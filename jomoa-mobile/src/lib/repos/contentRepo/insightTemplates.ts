/**
 * contentRepo/insightTemplates – daglig insight-titel, body och actions från Content DB.
 */
import { contentClient } from "../../supabase/contentClient";

export type InsightTemplateEntry = {
  template_key: string;
  title: string;
  body: string;
  actions: string[];
};

export async function fetchInsightTemplate(
  templateKey: string
): Promise<InsightTemplateEntry | null> {
  const { data, error } = await contentClient
    .from("insight_templates")
    .select("template_key, title, body, actions")
    .eq("template_key", templateKey)
    .maybeSingle();
  if (error || !data) return null;
  return data as InsightTemplateEntry;
}
