import Link from "next/link";
import { getDictionary } from "@/lib/i18n/getDictionary";

type Props = {
  params: Promise<{ locale: "en" | "sv" }>;
};

export default async function NotFound({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFBF7] px-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-4xl font-the-seasons font-semibold text-[#462324]">
          {locale === "sv" ? "Artikel hittades inte" : "Article not found"}
        </h1>
        <p className="text-lg font-league-spartan font-normal text-[#4E4A48]">
          {locale === "sv" 
            ? "Den artikel du letar efter finns inte eller har inte publicerats ännu." 
            : "The article you're looking for doesn't exist or hasn't been published yet."}
        </p>
        <Link
          href={`/${locale}/knowledge-hub`}
          className="inline-block px-6 py-3 rounded-full bg-[#D96D46] text-white font-league-spartan font-semibold hover:bg-[#C85A3A] transition-colors"
        >
          {locale === "sv" ? "Tillbaka till Knowledge Hub" : "Back to Knowledge Hub"}
        </Link>
      </div>
    </div>
  );
}

