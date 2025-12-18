import { getDictionary } from "@/lib/i18n/getDictionary";
import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import ArticleClient from "./ArticleClient";

type Props = {
  params: Promise<{ locale: "en" | "sv"; slug: string }>;
};

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  const dict = await getDictionary(locale);
  
  // Fetch article by slug and locale
  const { data: article, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("locale", locale) // Filter by locale
    .eq("status", "published")
    .single();

  if (error || !article) {
    notFound();
  }
  
  return <ArticleClient dict={dict} locale={locale} article={article} />;
}

