import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST /api/tools/csv - Process CSV files
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const action = formData.get("action") as string; // parse, analyze, transform, query

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "File must be a CSV" },
        { status: 400 }
      );
    }

    // Read CSV content
    const text = await file.text();
    
    let result: any = {};

    switch (action) {
      case "parse":
        result = await parseCSV(text);
        break;
      case "analyze":
        result = await analyzeCSV(text);
        break;
      case "transform":
        const transformConfig = formData.get("config");
        result = await transformCSV(text, transformConfig ? JSON.parse(transformConfig as string) : {});
        break;
      case "query":
        const query = formData.get("query") as string;
        result = await queryCSV(text, query);
        break;
      default:
        result = await parseCSV(text);
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "process_csv",
      resource_type: "tool",
      details: { 
        filename: file.name,
        action,
        size: file.size,
        rows: result.rows?.length || 0
      }
    });

    return NextResponse.json({
      success: true,
      filename: file.name,
      action,
      result
    });

  } catch (error) {
    console.error("Error processing CSV:", error);
    return NextResponse.json(
      { error: "Failed to process CSV", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Helper function to parse CSV
function parseCSV(text: string): { headers: string[]; rows: any[]; rowCount: number } {
  const lines = text.trim().split("\n");
  if (lines.length === 0) {
    return { headers: [], rows: [], rowCount: 0 };
  }

  // Parse headers
  const headers = parseCSVLine(lines[0]);
  
  // Parse rows
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    rows.push(row);
  }

  return {
    headers,
    rows,
    rowCount: rows.length
  };
}

// Helper function to parse CSV line (handles quotes and commas)
function parseCSVLine(line: string): string[] {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// Helper function to analyze CSV
function analyzeCSV(text: string): any {
  const parsed = parseCSV(text);
  const { headers, rows } = parsed;

  const analysis: any = {
    rowCount: rows.length,
    columnCount: headers.length,
    columns: {}
  };

  // Analyze each column
  headers.forEach(header => {
    const values = rows.map(row => row[header]);
    const nonEmpty = values.filter(v => v !== "");
    
    // Detect data type
    const isNumeric = nonEmpty.every(v => !isNaN(parseFloat(v)));
    const isDate = nonEmpty.every(v => !isNaN(Date.parse(v)));
    
    const columnAnalysis: any = {
      type: isNumeric ? "numeric" : isDate ? "date" : "text",
      totalValues: values.length,
      nonEmptyValues: nonEmpty.length,
      emptyValues: values.length - nonEmpty.length,
      uniqueValues: new Set(nonEmpty).size
    };

    if (isNumeric) {
      const numbers = nonEmpty.map(v => parseFloat(v));
      columnAnalysis.min = Math.min(...numbers);
      columnAnalysis.max = Math.max(...numbers);
      columnAnalysis.avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    }

    analysis.columns[header] = columnAnalysis;
  });

  return analysis;
}

// Helper function to transform CSV
function transformCSV(text: string, config: any): any {
  const parsed = parseCSV(text);
  let { rows } = parsed;

  // Apply filters
  if (config.filters) {
    config.filters.forEach((filter: any) => {
      const { column, operator, value } = filter;
      rows = rows.filter(row => {
        const cellValue = row[column];
        switch (operator) {
          case "equals":
            return cellValue === value;
          case "contains":
            return cellValue.includes(value);
          case "greater_than":
            return parseFloat(cellValue) > parseFloat(value);
          case "less_than":
            return parseFloat(cellValue) < parseFloat(value);
          default:
            return true;
        }
      });
    });
  }

  // Apply sorting
  if (config.sort) {
    const { column, direction } = config.sort;
    rows.sort((a, b) => {
      const aVal = a[column];
      const bVal = b[column];
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return direction === "desc" ? -comparison : comparison;
    });
  }

  // Apply column selection
  if (config.columns) {
    rows = rows.map(row => {
      const newRow: any = {};
      config.columns.forEach((col: string) => {
        newRow[col] = row[col];
      });
      return newRow;
    });
  }

  return {
    rows,
    rowCount: rows.length
  };
}

// Helper function to query CSV (simple SQL-like queries)
function queryCSV(text: string, query: string): any {
  const parsed = parseCSV(text);
  let { rows, headers } = parsed;

  // Robust query parser (supports SELECT, WHERE, ORDER BY, LIMIT)
  // Example: "SELECT name, age WHERE age > 25 ORDER BY name ASC LIMIT 10"
  
  try {
    const queryUpper = query.toUpperCase();
    
    // Parse SELECT clause
    let selectedColumns: string[] = [];
    const selectMatch = query.match(/SELECT\s+(.+?)(?:\s+WHERE|\s+ORDER|\s+LIMIT|$)/i);
    if (selectMatch) {
      const columnsStr = selectMatch[1].trim();
      selectedColumns = columnsStr === '*' ? headers : columnsStr.split(',').map(c => c.trim());
    } else {
      selectedColumns = headers;
    }
    
    // Parse WHERE clause
    const whereMatch = query.match(/WHERE\s+(.+?)(?:\s+ORDER|\s+LIMIT|$)/i);
    if (whereMatch) {
      const whereClause = whereMatch[1].trim();
      rows = rows.filter(row => evaluateWhereClause(row, whereClause));
    }
    
    // Parse ORDER BY clause
    const orderMatch = query.match(/ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?/i);
    if (orderMatch) {
      const orderColumn = orderMatch[1];
      const orderDirection = (orderMatch[2] || 'ASC').toUpperCase();
      
      rows = rows.sort((a, b) => {
        const aVal = a[orderColumn];
        const bVal = b[orderColumn];
        
        // Try numeric comparison first
        const aNum = Number(aVal);
        const bNum = Number(bVal);
        
        let comparison = 0;
        if (!isNaN(aNum) && !isNaN(bNum)) {
          comparison = aNum - bNum;
        } else {
          comparison = String(aVal).localeCompare(String(bVal));
        }
        
        return orderDirection === 'DESC' ? -comparison : comparison;
      });
    }
    
    // Parse LIMIT clause
    const limitMatch = query.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      const limit = parseInt(limitMatch[1]);
      rows = rows.slice(0, limit);
    }
    
    // Select only requested columns
    if (selectedColumns.length > 0 && selectedColumns[0] !== '*') {
      rows = rows.map(row => {
        const newRow: any = {};
        selectedColumns.forEach(col => {
          if (col in row) {
            newRow[col] = row[col];
          }
        });
        return newRow;
      });
    }
    
    return {
      rows,
      rowCount: rows.length,
      query,
      selectedColumns
    };
  } catch (error) {
    console.error('Error parsing query:', error);
    return {
      rows: parsed.rows,
      rowCount: parsed.rows.length,
      query,
      error: error instanceof Error ? error.message : 'Query parsing failed'
    };
  }
}

// Helper function to evaluate WHERE clause conditions
function evaluateWhereClause(row: any, whereClause: string): boolean {
  try {
    // Support basic operators: =, !=, >, <, >=, <=, LIKE
    // Example: "age > 25 AND name LIKE 'John%'"
    
    // Split by AND/OR (simple implementation)
    const conditions = whereClause.split(/\s+(AND|OR)\s+/i);
    const operators: string[] = [];
    const clauses: string[] = [];
    
    for (let i = 0; i < conditions.length; i++) {
      if (i % 2 === 0) {
        clauses.push(conditions[i]);
      } else {
        operators.push(conditions[i].toUpperCase());
      }
    }
    
    // Evaluate each condition
    const results = clauses.map(clause => evaluateSingleCondition(row, clause.trim()));
    
    // Combine results with operators
    let finalResult = results[0];
    for (let i = 0; i < operators.length; i++) {
      if (operators[i] === 'AND') {
        finalResult = finalResult && results[i + 1];
      } else if (operators[i] === 'OR') {
        finalResult = finalResult || results[i + 1];
      }
    }
    
    return finalResult;
  } catch (error) {
    console.error('Error evaluating WHERE clause:', error);
    return false;
  }
}

// Helper function to evaluate a single condition
function evaluateSingleCondition(row: any, condition: string): boolean {
  // Match patterns like: column operator value
  const likeMatch = condition.match(/(\w+)\s+LIKE\s+'([^']+)'/i);
  if (likeMatch) {
    const [, column, pattern] = likeMatch;
    const value = String(row[column] || '');
    const regex = new RegExp('^' + pattern.replace(/%/g, '.*').replace(/_/g, '.') + '$', 'i');
    return regex.test(value);
  }
  
  const operatorMatch = condition.match(/(\w+)\s*(>=|<=|!=|=|>|<)\s*(.+)/);
  if (operatorMatch) {
    const [, column, operator, valueStr] = operatorMatch;
    const rowValue = row[column];
    
    // Remove quotes from value
    let compareValue: any = valueStr.trim().replace(/^['"]|['"]$/g, '');
    
    // Try to convert to number if possible
    const numValue = Number(compareValue);
    const numRowValue = Number(rowValue);
    
    if (!isNaN(numValue) && !isNaN(numRowValue)) {
      compareValue = numValue;
      const rowVal = numRowValue;
      
      switch (operator) {
        case '=': return rowVal === compareValue;
        case '!=': return rowVal !== compareValue;
        case '>': return rowVal > compareValue;
        case '<': return rowVal < compareValue;
        case '>=': return rowVal >= compareValue;
        case '<=': return rowVal <= compareValue;
      }
    } else {
      // String comparison
      const rowVal = String(rowValue);
      const cmpVal = String(compareValue);
      
      switch (operator) {
        case '=': return rowVal === cmpVal;
        case '!=': return rowVal !== cmpVal;
        case '>': return rowVal > cmpVal;
        case '<': return rowVal < cmpVal;
        case '>=': return rowVal >= cmpVal;
        case '<=': return rowVal <= cmpVal;
      }
    }
  }
  
  return false;
}
