import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Test database connection
    const { data: healthCheck, error: dbError } = await supabase
      .from("profiles")
      .select("id")
      .limit(1)

    if (dbError) {
      return NextResponse.json(
        {
          status: "error",
          service: "database",
          error: dbError.message,
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      )
    }

    // Test authentication system
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Auth errors are OK for health check - we just want to know the service is responding
    // Only fail if there's a critical auth system error
    if (authError && authError.code !== 'JWT_EXPIRED' && authError.message !== 'Auth session missing!') {
      return NextResponse.json(
        {
          status: "error",
          service: "authentication",
          error: authError.message,
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      )
    }

    // Test storage (if configured)
    let storageStatus = "unknown"
    try {
      // Simple storage test - list buckets
      const { data: buckets, error: storageError } = await supabase
        .storage
        .listBuckets()

      if (storageError) {
        storageStatus = `Storage error: ${storageError.message}`
      } else {
        storageStatus = "healthy"
      }
    } catch (storageError: any) {
      storageStatus = `Storage test failed: ${storageError?.message || 'Unknown error'}`
    }

    // Return health status
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: "healthy",
          response_time: "fast"
        },
        authentication: {
          status: "healthy",
          user: user ? "authenticated" : "no_active_session"
        },
        storage: {
          status: storageStatus
        }
      },
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development"
    })

  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        error: error?.message || 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}