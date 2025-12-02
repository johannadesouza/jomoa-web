"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HeaderProps = {
  locale: "en" | "sv";
};

export default function Header({ locale }: HeaderProps) {
  const pathname = usePathname();

  // Handle hash scrolling when navigating from other pages
  useEffect(() => {
    if (pathname?.includes("#")) {
      const hash = pathname.split("#")[1];
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [pathname]);

  // Navigation labels
  const navLabels = {
    sv: {
      about: "Om JOMOA",
      features: "Funktioner",
      knowledgeHub: "Knowledge Hub",
      waitlist: "Väntelista",
    },
    en: {
      about: "About JOMOA",
      features: "Features",
      knowledgeHub: "Knowledge Hub",
      waitlist: "Waitlist",
    },
  };

  const labels = navLabels[locale];

  return (
    <header
      className={cn(
        "sticky top-0 z-50",
        "bg-soft-pink/95 backdrop-blur-sm",
        "border-b border-pink-light/50",
        "py-3 px-6"
      )}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* JOMOA Logo - Left */}
        <Link href={`/${locale}`} className="font-the-seasons text-lg font-semibold text-plum hover:opacity-80 transition-opacity">
          JOMOA
        </Link>

        {/* Navigation - Center */}
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            href={`/${locale}#value`}
            className="text-sm font-league-spartan font-normal text-plum hover:text-terracotta transition-colors relative group"
          >
            {labels.about}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-plum group-hover:w-full transition-all duration-200" />
          </Link>
          <Link 
            href={`/${locale}#features`}
            className="text-sm font-league-spartan font-normal text-plum hover:text-terracotta transition-colors relative group"
          >
            {labels.features}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-plum group-hover:w-full transition-all duration-200" />
          </Link>
          <Link 
            href={`/${locale}/knowledge-hub`}
            className="text-sm font-league-spartan font-normal text-plum hover:text-terracotta transition-colors relative group"
          >
            {labels.knowledgeHub}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-plum group-hover:w-full transition-all duration-200" />
          </Link>
        </nav>

        {/* Right side: Language Switcher + CTA */}
        <div className="flex items-center gap-6">
          <LanguageSwitcher />
          <Button
            asChild
            className={cn(
              "rounded-full h-9 px-6 text-sm font-league-spartan font-medium",
              "bg-terracotta hover:bg-[#C85A3A] text-white",
              "transition-all duration-150 ease-out hover:scale-[1.03]"
            )}
          >
            <Link href={`/${locale}#waitlist`}>
              {labels.waitlist}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
