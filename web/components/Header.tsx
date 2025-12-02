"use client";

import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HeaderProps = {
  locale: "en" | "sv";
};

export default function Header({ locale }: HeaderProps) {
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
          <a 
            href="#value" 
            className="text-sm font-league-spartan font-normal text-plum hover:text-terracotta transition-colors relative group"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('value')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            Om JOMOA
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-plum group-hover:w-full transition-all duration-200" />
          </a>
          <a 
            href="#features" 
            className="text-sm font-league-spartan font-normal text-plum hover:text-terracotta transition-colors relative group"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            Funktioner
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-plum group-hover:w-full transition-all duration-200" />
          </a>
          <Link 
            href={`/${locale}/knowledge-hub`}
            className="text-sm font-league-spartan font-normal text-plum hover:text-terracotta transition-colors relative group"
          >
            {locale === "sv" ? "Knowledge Hub" : "Knowledge Hub"}
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
            <a 
              href="#waitlist"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              Väntelista
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
