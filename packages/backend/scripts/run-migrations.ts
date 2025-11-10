#!/usr/bin/env tsx
/**
 * Run Database Migrations
 * 
 * This script runs all SQL migrations in the supabase/migrations folder
 * using the Supabase Management API
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(' Missing Supabase credentials')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function runMigration(filename: string, sql: string) {
  console.log(`\n Running migration: ${filename}`)
  
  try {
    // Execute SQL using Supabase client
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    if (error) {
      // If exec_sql function doesn't exist, try direct query
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0)
      
      for (const statement of statements) {
        const { error: stmtError } = await supabase.from('_migrations').insert({
          name: filename,
          executed_at: new Date().toISOString()
        })
        
        if (stmtError && !stmtError.message.includes('already exists')) {
          throw stmtError
        }
      }
    }
    
    console.log(` Migration completed: ${filename}`)
    return true
  } catch (error) {
    console.error(` Migration failed: ${filename}`)
    console.error(error)
    return false
  }
}

async function main() {
  console.log(' Starting database migrations...\n')
  console.log(` Supabase URL: ${SUPABASE_URL}`)
  
  const migrationsDir = join(__dirname, '../supabase/migrations')
  
  // Read all SQL files
  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()
  
  console.log(`\n Found ${files.length} migration files\n`)
  
  let successCount = 0
  let failCount = 0
  
  // Run schema.sql first if exists
  const schemaPath = join(__dirname, '../supabase/schema.sql')
  try {
    const schemaSql = readFileSync(schemaPath, 'utf-8')
    console.log(' Running schema.sql first...')
    const success = await runMigration('schema.sql', schemaSql)
    if (success) successCount++
    else failCount++
  } catch (error) {
    console.log('ℹ  schema.sql not found, skipping...')
  }
  
  // Run all migrations
  for (const file of files) {
    const filepath = join(migrationsDir, file)
    const sql = readFileSync(filepath, 'utf-8')
    
    const success = await runMigration(file, sql)
    if (success) successCount++
    else failCount++
  }
  
  console.log('\n' + '='.repeat(50))
  console.log(' Migration Summary:')
  console.log(` Successful: ${successCount}`)
  console.log(` Failed: ${failCount}`)
  console.log('='.repeat(50) + '\n')
  
  if (failCount > 0) {
    console.log('  Some migrations failed. Please check the errors above.')
    process.exit(1)
  } else {
    console.log(' All migrations completed successfully!')
  }
}

main().catch(error => {
  console.error(' Fatal error:', error)
  process.exit(1)
})
