import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

/**
 * GET /api/articles
 * Fetches published articles from Supabase
 * 
 * Query parameters:
 * - category: Filter by category
 * - limit: Limit number of results (default: 20)
 * - offset: Offset for pagination
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const locale = searchParams.get("locale") || "sv"; // Default to Swedish
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Build query
    let query = supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .eq("locale", locale) // Filter by locale
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by category if provided
    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch articles", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        articles: data || [],
        count: data?.length || 0 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Articles API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

