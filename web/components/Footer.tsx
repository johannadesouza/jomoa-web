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
    <footer className="border-t border-[#462324]/10 bg-[#FFFBF7] relative z-10 py-10 md:py-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col items-center justify-center text-center space-y-4 md:space-y-5">
          <p className={cn(typography.body.mobile, "font-inter text-[#976568] max-w-2xl leading-relaxed")}>
            {dict.footer.research}
          </p>
          <div className="flex flex-wrap items-center justify-center font-inter text-sm text-[#976568] gap-x-4 gap-y-1">
            <Link href={`/${locale}#waitlist`} className="hover:text-[#D96D46] transition-colors">
              {dict.footer.links.waitlist}
            </Link>
            <span>·</span>
            <Link href={`/${locale}#b2b`} className="hover:text-[#D96D46] transition-colors">
              {dict.footer.links.companies}
            </Link>
            <span>·</span>
            <Link href={`/${locale}/privacy`} className="hover:text-[#D96D46] transition-colors">
              {dict.footer.links.privacy}
            </Link>
            <span>·</span>
            <a href="mailto:info@jomoa.coach" className="hover:text-[#D96D46] transition-colors">
              {dict.footer.links.contact}
            </a>
          </div>
          <p className="font-inter text-sm text-[#976568]">
            © {currentYear} {dict.footer.copyright}
          </p>
          <p className={cn(typography.small.mobile, "font-inter max-w-xl text-[#976568] leading-relaxed opacity-90")}>
            {dict.footer.privacy}
          </p>
        </div>
      </div>
    </footer>
  );
}

