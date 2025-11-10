import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/prompt-templates - List all public prompt templates
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
      .from("prompt_templates")
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
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching prompt templates:", error);
      return NextResponse.json(
        { error: "Failed to fetch prompt templates" },
        { status: 500 }
      );
    }

    return NextResponse.json({ templates: data });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/prompt-templates - Create a new prompt template
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
      title,
      description,
      category,
      tags,
      template,
      variables,
      examples,
      is_public,
      price
    } = body;

    // Validation
    if (!title || !category || !template) {
      return NextResponse.json(
        { error: "Missing required fields: title, category, template" },
        { status: 400 }
      );
    }

    // Create prompt template
    const { data, error } = await supabase
      .from("prompt_templates")
      .insert({
        title,
        description,
        category,
        tags: tags || [],
        template,
        variables: variables || [],
        examples: examples || [],
        author_id: user.id,
        is_public: is_public || false,
        price: price || 0
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating prompt template:", error);
      return NextResponse.json(
        { error: "Failed to create prompt template" },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "create_prompt_template",
      resource_type: "prompt_template",
      resource_id: data.id,
      details: { title, category }
    });

    return NextResponse.json({ template: data }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
