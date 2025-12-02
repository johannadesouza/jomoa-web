import { getDictionary } from "@/lib/i18n/getDictionary";
import PrivacyClient from "./PrivacyClient";

type Props = {
  params: Promise<{ locale: "en" | "sv" }>;
};

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  
  return <PrivacyClient dict={dict} locale={locale} />;
}

