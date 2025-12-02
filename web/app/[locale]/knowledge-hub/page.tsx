import { getDictionary } from "@/lib/i18n/getDictionary";
import KnowledgeHubClient from "./KnowledgeHubClient";

type Props = {
  params: Promise<{ locale: "en" | "sv" }>;
};

export default async function KnowledgeHubPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  
  return <KnowledgeHubClient dict={dict} locale={locale} />;
}

