import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getLoadBalancer } from "@/lib/ai/load-balancer";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/load-balancer
 * Get load balancer statistics
 */
export async function GET(request: NextRequest) {
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

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const loadBalancer = getLoadBalancer();
    const stats = loadBalancer.getStats();

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error("Error getting load balancer stats:", error);
    return NextResponse.json(
      { error: "Failed to get load balancer stats" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/load-balancer/reset
 * Reset load balancer statistics
 */
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

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const loadBalancer = getLoadBalancer();
    loadBalancer.resetStats();

    return NextResponse.json({
      success: true,
      message: "Load balancer stats reset successfully"
    });

  } catch (error) {
    console.error("Error resetting load balancer stats:", error);
    return NextResponse.json(
      { error: "Failed to reset load balancer stats" },
      { status: 500 }
    );
  }
}
