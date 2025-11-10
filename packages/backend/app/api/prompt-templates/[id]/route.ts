import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/prompt-templates/[id] - Get a specific prompt template
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id } = params;

    const { data, error } = await supabase
      .from("prompt_templates")
      .select("*, profiles(email), ratings(rating, feedback, created_at)")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching prompt template:", error);
      return NextResponse.json(
        { error: "Prompt template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ template: data });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/prompt-templates/[id] - Update a prompt template
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id } = params;
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check ownership or admin
    const { data: template } = await supabase
      .from("prompt_templates")
      .select("author_id")
      .eq("id", id)
      .single();

    if (!template) {
      return NextResponse.json(
        { error: "Prompt template not found" },
        { status: 404 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (template.author_id !== user.id && profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      tags,
      template: templateText,
      variables,
      examples,
      is_public,
      is_featured,
      price
    } = body;

    // Update prompt template
    const { data, error } = await supabase
      .from("prompt_templates")
      .update({
        title,
        description,
        category,
        tags,
        template: templateText,
        variables,
        examples,
        is_public,
        is_featured,
        price,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating prompt template:", error);
      return NextResponse.json(
        { error: "Failed to update prompt template" },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "update_prompt_template",
      resource_type: "prompt_template",
      resource_id: id,
      details: { title, category }
    });

    return NextResponse.json({ template: data });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/prompt-templates/[id] - Delete a prompt template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id } = params;
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check ownership or admin
    const { data: template } = await supabase
      .from("prompt_templates")
      .select("author_id, title")
      .eq("id", id)
      .single();

    if (!template) {
      return NextResponse.json(
        { error: "Prompt template not found" },
        { status: 404 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (template.author_id !== user.id && profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Delete prompt template
    const { error } = await supabase
      .from("prompt_templates")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting prompt template:", error);
      return NextResponse.json(
        { error: "Failed to delete prompt template" },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "delete_prompt_template",
      resource_type: "prompt_template",
      resource_id: id,
      details: { title: template.title }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
