import { getDictionary } from "@/lib/i18n/getDictionary";
import HomeClient from "./HomeClient";

type Props = {
  params: Promise<{ locale: "en" | "sv" }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  
  return <HomeClient dict={dict} locale={locale} />;
}

