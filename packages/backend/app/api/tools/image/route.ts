import { createLogger } from '@/lib/utils/logger';
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, readFile } from "fs/promises";
import { join } from "path";
import sharp from 'sharp';

export const dynamic = "force-dynamic";

const logger = createLogger({ module: 'image-route' });

// POST /api/tools/image - Process images
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
    const action = formData.get("action") as string; // analyze, ocr, describe, resize, convert

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
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
        case "analyze":
          result = await analyzeImage(tempPath, buffer);
          break;
        case "ocr":
          result = await performOCR(tempPath);
          break;
        case "describe":
          result = await describeImage(tempPath, buffer);
          break;
        case "resize":
          const width = parseInt(formData.get("width") as string || "800");
          const height = parseInt(formData.get("height") as string || "600");
          result = await resizeImage(tempPath, width, height);
          break;
        case "convert":
          const format = formData.get("format") as string || "png";
          result = await convertImage(tempPath, format);
          break;
        default:
          result = await analyzeImage(tempPath, buffer);
      }

      // Clean up temp file
      await unlink(tempPath);

      // Log activity
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        action: "process_image",
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
    logger.error('Error processing image:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Failed to process image", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Helper function to analyze image
async function analyzeImage(imagePath: string, buffer: Buffer): Promise<any> {
  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    const stats = await image.stats();
    
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
      space: metadata.space,
      channels: metadata.channels,
      depth: metadata.depth,
      density: metadata.density,
      hasAlpha: metadata.hasAlpha,
      orientation: metadata.orientation,
      isProgressive: metadata.isProgressive,
      pages: metadata.pages,
      pageHeight: metadata.pageHeight,
      stats: {
        channels: stats.channels,
        isOpaque: stats.isOpaque,
        entropy: stats.entropy
      }
    };
  } catch (error) {
    logger.error('Error analyzing image:', error instanceof Error ? error : new Error(String(error)));
    throw new Error("Failed to analyze image");
  }
}

// Helper function to perform OCR
async function performOCR(imagePath: string): Promise<{ text: string; confidence: number; words: any[] }> {
  try {
    const Tesseract = require('tesseract.js');
    
    const { data } = await Tesseract.recognize(
      imagePath,
      'eng',
      {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            logger.info(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );
    
    return {
      text: data.text,
      confidence: data.confidence,
      words: data.words.map((w: any) => ({
        text: w.text,
        confidence: w.confidence,
        bbox: w.bbox
      }))
    };
  } catch (error) {
    logger.error('Error performing OCR:', error instanceof Error ? error : new Error(String(error)));
    throw new Error("Failed to perform OCR");
  }
}

// Helper function to describe image using AI
async function describeImage(imagePath: string, buffer: Buffer): Promise<{ description: string; labels: string[] }> {
  try {
    // Convert image to base64
    const base64Image = buffer.toString("base64");
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;

    // Call OpenAI Vision API or similar
    // For now, return placeholder
    // TODO: Implement actual image description using GPT-4 Vision or similar

    return {
      description: "Image description functionality coming soon",
      labels: []
    };
  } catch (error) {
    logger.error('Error describing image:', error instanceof Error ? error : new Error(String(error)));
    throw new Error("Failed to describe image");
  }
}

// Helper function to resize image
async function resizeImage(imagePath: string, width: number, height: number): Promise<any> {
  try {
    const outputPath = imagePath.replace(/\.(\w+)$/, `-resized-${width}x${height}.$1`);
    
    await sharp(imagePath)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toFile(outputPath);
    
    const buffer = await readFile(outputPath);
    const base64 = buffer.toString('base64');
    
    // Clean up resized file
    await unlink(outputPath);
    
    return {
      width,
      height,
      base64,
      message: "Image resized successfully"
    };
  } catch (error) {
    logger.error('Error resizing image:', error instanceof Error ? error : new Error(String(error)));
    throw new Error("Failed to resize image");
  }
}

// Helper function to convert image format
async function convertImage(imagePath: string, format: string): Promise<any> {
  try {
    const outputPath = imagePath.replace(/\.\w+$/, `.${format}`);
    
    let image = sharp(imagePath);
    
    // Apply format-specific options
    switch (format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        image = image.jpeg({ quality: 90 });
        break;
      case 'png':
        image = image.png({ compressionLevel: 9 });
        break;
      case 'webp':
        image = image.webp({ quality: 90 });
        break;
      case 'avif':
        image = image.avif({ quality: 90 });
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
    
    await image.toFile(outputPath);
    
    const buffer = await readFile(outputPath);
    const base64 = buffer.toString('base64');
    
    // Clean up converted file
    await unlink(outputPath);
    
    return {
      format,
      base64,
      message: "Image converted successfully"
    };
  } catch (error) {
    logger.error('Error converting image:', error instanceof Error ? error : new Error(String(error)));
    throw new Error("Failed to convert image");
  }
}
