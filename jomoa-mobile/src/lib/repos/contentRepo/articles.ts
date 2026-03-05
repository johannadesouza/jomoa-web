import { contentClient } from "../../supabase/contentClient";

export type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  status: "draft" | "published" | "archived";
  locale: string;
  reading_time_minutes: number | null;
  published_at: string | null;
  created_at: string;
};

export async function fetchPublishedArticles(locale = "sv"): Promise<Article[]> {
  const { data, error } = await contentClient
    .from("articles")
    .select(
      "id, title, slug, excerpt, category, status, locale, reading_time_minutes, published_at, created_at"
    )
    .eq("status", "published")
    .eq("locale", locale)
    .order("published_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Article[];
}

export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await contentClient
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  return data as Article | null;
}

export async function fetchArticlesByCategory(
  category: string,
  locale = "sv"
): Promise<Article[]> {
  const { data, error } = await contentClient
    .from("articles")
    .select(
      "id, title, slug, excerpt, category, status, locale, reading_time_minutes, published_at, created_at"
    )
    .eq("status", "published")
    .eq("locale", locale)
    .ilike("category", category)
    .order("published_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Article[];
}
