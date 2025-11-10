import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/agents - List all public agents
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("agents")
      .select("*, profiles(email)")
      .eq("is_public", true)
      .order("execution_count", { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq("category", category);
    }

    if (tag) {
      query = query.contains("tags", [tag]);
    }

    if (featured === "true") {
      query = query.eq("is_featured", true);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching agents:", error);
      return NextResponse.json(
        { error: "Failed to fetch agents" },
        { status: 500 }
      );
    }

    return NextResponse.json({ agents: data });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/agents - Create a new agent
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

    const body = await request.json();
    const {
      name,
      description,
      category,
      icon,
      tags,
      steps,
      input_schema,
      output_schema,
      is_public,
      price
    } = body;

    // Validation
    if (!name || !category || !steps || !input_schema) {
      return NextResponse.json(
        { error: "Missing required fields: name, category, steps, input_schema" },
        { status: 400 }
      );
    }

    // Validate steps format
    if (!Array.isArray(steps) || steps.length === 0) {
      return NextResponse.json(
        { error: "Steps must be a non-empty array" },
        { status: 400 }
      );
    }

    // Create agent
    const { data, error } = await supabase
      .from("agents")
      .insert({
        name,
        description,
        category,
        icon: icon || "robot",
        tags: tags || [],
        steps,
        input_schema,
        output_schema: output_schema || {},
        author_id: user.id,
        is_public: is_public || false,
        price: price || 0
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating agent:", error);
      return NextResponse.json(
        { error: "Failed to create agent" },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "create_agent",
      resource_type: "agent",
      resource_id: data.id,
      details: { name, category }
    });

    return NextResponse.json({ agent: data }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
