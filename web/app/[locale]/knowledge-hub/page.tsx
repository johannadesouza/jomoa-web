import { getDictionary } from "@/lib/i18n/getDictionary";
import { supabase } from "@/lib/supabaseClient";
import KnowledgeHubClient from "./KnowledgeHubClient";

type Props = {
  params: Promise<{ locale: "en" | "sv" }>;
};

export default async function KnowledgeHubPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  
  // Fetch published articles
  let articles: any[] = [];
  try {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      articles = data;
    }
  } catch (error) {
    console.error("Error fetching articles:", error);
  }
  
  return <KnowledgeHubClient dict={dict} locale={locale} initialArticles={articles} />;
}

