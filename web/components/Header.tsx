import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import { cn } from "@/lib/utils";

type HeaderProps = {
  locale: "en" | "sv";
};

export default function Header({ locale }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50",
        "bg-soft-pink/80 backdrop-blur-sm",
        "border-b border-pink-light",
        "py-4 px-6"
      )}
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* JOMOA Logo */}
        <Link href={`/${locale}`} className="font-the-seasons text-2xl font-semibold text-plum">
          JOMOA
        </Link>

        {/* Right side: Language Switcher */}
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
