"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const currentLocale = pathname?.startsWith("/sv") ? "sv" : "en";

  // Get the current path without locale prefix, default to empty string if root
  const pathWithoutLocale = pathname
    ? pathname.replace(/^\/(en|sv)/, "") || ""
    : "";

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/en${pathWithoutLocale}`}
        className={cn(
          "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
          currentLocale === "en"
            ? "bg-jomoa-accent/10 text-jomoa-accent font-semibold"
            : "text-jomoa-text2 hover:text-jomoa-text hover:bg-jomoa-bg2"
        )}
      >
        EN
      </Link>
      <Link
        href={`/sv${pathWithoutLocale}`}
        className={cn(
          "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
          currentLocale === "sv"
            ? "bg-jomoa-accent/10 text-jomoa-accent font-semibold"
            : "text-jomoa-text2 hover:text-jomoa-text hover:bg-jomoa-bg2"
        )}
      >
        SV
      </Link>
    </div>
  );
}

