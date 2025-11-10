import { createLogger } from '@/lib/utils/logger'
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const dynamic = "force-dynamic";

const logger = createLogger({ module: 'pdf-route' });

// POST /api/tools/pdf - Process PDF files
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
    const action = formData.get("action") as string; // extract_text, extract_images, get_metadata

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!file.type.includes("pdf")) {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }

    // Save file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempPath = join("/tmp", `${Date.now()}-${file.name}`);
    await writeFile(tempPath, buffer);

    try {
      let result: any = {};

      switch (action) {
        case "extract_text":
          result = await extractTextFromPDF(tempPath);
          break;
        case "extract_images":
          result = await extractImagesFromPDF(tempPath);
          break;
        case "get_metadata":
          result = await getPDFMetadata(tempPath);
          break;
        case "convert_to_images":
          result = await convertPDFToImages(tempPath);
          break;
        default:
          // Default: extract text
          result = await extractTextFromPDF(tempPath);
      }

      // Clean up temp file
      await unlink(tempPath);

      // Log activity
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        action: "process_pdf",
        resource_type: "tool",
        details: { 
          filename: file.name,
          action,
          size: file.size
        }
      });

      return NextResponse.json({
        success: true,
        filename: file.name,
        action,
        result
      });

    } catch (error) {
      // Clean up temp file on error
      try {
        await unlink(tempPath);
      } catch (e) {
        // Ignore cleanup errors
      }
      throw error;
    }

  } catch (error) {
    logger.error('Error processing PDF:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Failed to process PDF", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Helper function to extract text from PDF
async function extractTextFromPDF(pdfPath: string): Promise<{ text: string; pages: number }> {
  try {
    // Use pdftotext command (from poppler-utils)
    const { stdout } = await execAsync(`pdftotext "${pdfPath}" -`);
    
    // Get page count
    const { stdout: infoOutput } = await execAsync(`pdfinfo "${pdfPath}"`);
    const pagesMatch = infoOutput.match(/Pages:\s+(\d+)/);
    const pages = pagesMatch ? parseInt(pagesMatch[1]) : 0;

    return {
      text: stdout,
      pages
    };
  } catch (error) {
    logger.error('Error extracting text from PDF:', error instanceof Error ? error : new Error(String(error)));
    throw new Error("Failed to extract text from PDF");
  }
}

// Helper function to extract images from PDF
async function extractImagesFromPDF(pdfPath: string): Promise<{ images: string[]; count: number }> {
  try {
    const outputDir = join("/tmp", `pdf-images-${Date.now()}`);
    await execAsync(`mkdir -p "${outputDir}"`);
    
    // Use pdfimages command
    await execAsync(`pdfimages -all "${pdfPath}" "${outputDir}/image"`);
    
    // List extracted images
    const { stdout } = await execAsync(`ls "${outputDir}"`);
    const images = stdout.trim().split("\n").filter(f => f);

    // TODO: Upload images to storage and return URLs
    // For now, return image filenames
    
    return {
      images,
      count: images.length
    };
  } catch (error) {
    logger.error('Error extracting images from PDF:', error instanceof Error ? error : new Error(String(error)));
    throw new Error("Failed to extract images from PDF");
  }
}

// Helper function to get PDF metadata
async function getPDFMetadata(pdfPath: string): Promise<any> {
  try {
    const { stdout } = await execAsync(`pdfinfo "${pdfPath}"`);
    
    const metadata: any = {};
    const lines = stdout.split("\n");
    
    for (const line of lines) {
      const [key, ...valueParts] = line.split(":");
      if (key && valueParts.length > 0) {
        const value = valueParts.join(":").trim();
        metadata[key.trim()] = value;
      }
    }

    return metadata;
  } catch (error) {
    logger.error('Error getting PDF metadata:', error instanceof Error ? error : new Error(String(error)));
    throw new Error("Failed to get PDF metadata");
  }
}

// Helper function to convert PDF to images
async function convertPDFToImages(pdfPath: string): Promise<{ images: string[]; count: number }> {
  try {
    const outputDir = join("/tmp", `pdf-pages-${Date.now()}`);
    await execAsync(`mkdir -p "${outputDir}"`);
    
    // Use pdftoppm command
    await execAsync(`pdftoppm -png "${pdfPath}" "${outputDir}/page"`);
    
    // List generated images
    const { stdout } = await execAsync(`ls "${outputDir}"`);
    const images = stdout.trim().split("\n").filter(f => f);

    // TODO: Upload images to storage and return URLs
    
    return {
      images,
      count: images.length
    };
  } catch (error) {
    logger.error('Error converting PDF to images:', error instanceof Error ? error : new Error(String(error)));
    throw new Error("Failed to convert PDF to images");
  }
}
