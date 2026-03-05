"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Menu, X } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HeaderProps = {
  locale: "en" | "sv";
};

// Logo component with fallback to text
function LogoWithFallback() {
  const [imageError, setImageError] = useState(false);
  const [logoSrc, setLogoSrc] = useState<string>("/logo.png"); // Try PNG first, then SVG

  // Try to load logo.png first, then logo.svg, then fallback to text
  if (imageError) {
    return (
      <span className="font-inter text-lg sm:text-xl font-bold text-[#462324]">
        JOMOA
      </span>
    );
  }

  return (
    <Image
      src={logoSrc}
      alt="JOMOA"
      width={180}
      height={60}
      className="h-10 sm:h-12 md:h-14 w-auto"
      onError={() => {
        // Try alternative format
        if (logoSrc === "/logo.png") {
          setLogoSrc("/logo.svg");
        } else {
          setImageError(true);
        }
      }}
      priority
    />
  );
}

export default function Header({ locale }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Close mobile menu when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Navigation labels
  const navLabels = {
    sv: {
      about: "Om JOMOA",
      features: "Funktioner",
      knowledgeHub: "Knowledge Hub",
      forIndividuals: "Privatpersoner",
      forCompanies: "För företag",
      downloadApp: "Ladda ner appen",
    },
    en: {
      about: "About JOMOA",
      features: "Features",
      knowledgeHub: "Knowledge Hub",
      forIndividuals: "For individuals",
      forCompanies: "For companies",
      downloadApp: "Download the app",
    },
  };

  const labels = navLabels[locale];

  return (
    <>
    <header
      className={cn(
        "sticky top-0 z-50",
        "bg-soft-pink/95 backdrop-blur-sm",
        "border-b border-pink-light/50",
          "py-3 px-4 sm:px-6"
      )}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* JOMOA Logo - Left */}
          <Link 
            href={`/${locale}`} 
            className="flex items-center hover:opacity-80 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          >
            {/* Logo image - will show text fallback if image doesn't exist */}
            <LogoWithFallback />
        </Link>

          {/* Desktop Navigation - Center: Om, Funktioner, För företag */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
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
              href={`/${locale}#b2b`}
              className="text-sm font-league-spartan font-normal text-plum hover:text-terracotta transition-colors relative group"
            >
              {labels.forCompanies}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-plum group-hover:w-full transition-all duration-200" />
            </Link>
        </nav>

          {/* Right side: Desktop - Language Switcher + CTA */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
          <LanguageSwitcher />
          <Button
            asChild
            className={cn(
                "rounded-full h-9 px-4 xl:px-6 text-xs xl:text-sm font-league-spartan font-medium",
              "bg-[#D96D46] hover:bg-[#C45D36] text-white",
              "transition-all duration-150 ease-out hover:scale-[1.03]"
            )}
          >
              <Link href={`/${locale}#waitlist`}>
                {labels.downloadApp}
              </Link>
            </Button>
          </div>

          {/* Mobile: Language Switcher + Menu Button */}
          <div className="flex lg:hidden items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-plum hover:text-terracotta transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden",
          "bg-soft-pink/98 backdrop-blur-sm",
          "transition-all duration-300 ease-in-out",
          mobileMenuOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        )}
      >
        <div className="flex flex-col h-full pt-20 px-6 pb-8">
          <nav className="flex flex-col gap-6">
            <Link
              href={`/${locale}#value`}
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-league-spartan font-normal text-plum hover:text-terracotta transition-colors py-2 border-b border-pink-light/30"
            >
              {labels.about}
            </Link>
            <Link
              href={`/${locale}#features`}
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-league-spartan font-normal text-plum hover:text-terracotta transition-colors py-2 border-b border-pink-light/30"
            >
              {labels.features}
            </Link>
            <Link
              href={`/${locale}#b2b`}
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-league-spartan font-normal text-plum hover:text-terracotta transition-colors py-2 border-b border-pink-light/30"
            >
              {labels.forCompanies}
            </Link>
            <div className="pt-4">
              <Button
                asChild
                className={cn(
                  "rounded-full w-full h-12 text-base font-league-spartan font-semibold",
                  "bg-[#D96D46] hover:bg-[#C45D36] text-white",
                  "transition-all duration-150 ease-out"
                )}
            >
                <Link href={`/${locale}#waitlist`} onClick={() => setMobileMenuOpen(false)}>
                  {labels.downloadApp}
                </Link>
          </Button>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
