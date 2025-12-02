"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const typography = {
  body: {
    mobile: "text-sm sm:text-base md:text-lg",
  },
  small: {
    mobile: "text-xs sm:text-sm md:text-base",
  },
};

type Dict = Awaited<ReturnType<typeof import("@/lib/i18n/getDictionary").getDictionary>>;

type FooterProps = {
  dict: Dict;
  locale: "en" | "sv";
};

export default function Footer({ dict, locale }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#E8D5D0] bg-[#FFFBF7] relative z-10 py-6 sm:py-8 md:py-10 px-4 sm:px-6 md:px-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="h-px w-full bg-[#E8D5D0] opacity-70 mb-3 sm:mb-4 md:mb-5"></div>
        <div className="flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4 md:space-y-5">
          <p className={cn(typography.body.mobile, "font-league-spartan font-normal max-w-3xl text-[#4E4A48] leading-relaxed")}>
            {dict.footer.research}
          </p>
          <div className="flex flex-wrap items-center justify-center font-league-spartan font-normal gap-3 sm:gap-4 text-sm sm:text-base text-[#4E4A48]">
            <p>© {currentYear} {dict.footer.copyright}</p>
            <span>•</span>
            <Link href={`/${locale}/privacy`} className="hover:opacity-70 hover:text-[#D96D46] transition-colors">
              {dict.footer.links.privacy}
            </Link>
            <span>•</span>
            <a href="mailto:info@jomoa.coach" className="hover:opacity-70 hover:text-[#D96D46] transition-colors">
              {dict.footer.links.contact}
            </a>
          </div>
          <p className={cn(typography.small.mobile, "font-league-spartan font-normal max-w-2xl opacity-70 text-[#4E4A48] leading-relaxed px-4")}>
            {dict.footer.privacy}
          </p>
        </div>
      </div>
    </footer>
  );
}

