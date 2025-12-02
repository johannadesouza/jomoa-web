"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";

const colors = {
  bg: "#FFFBF7",
  bgAlt: "#F0D6D7",
  text: "#462324",
  textSecondary: "#4E4A48",
  border: "#E8D5D0",
};

const typography = {
  h1: {
    mobile: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
  },
  h2: {
    mobile: "text-2xl sm:text-3xl md:text-4xl",
  },
  h3: {
    mobile: "text-lg sm:text-xl md:text-2xl",
  },
  body: {
    mobile: "text-sm sm:text-base md:text-lg",
  },
};

type Dict = Awaited<ReturnType<typeof import("@/lib/i18n/getDictionary").getDictionary>>;

type Props = {
  dict: Dict;
  locale: "en" | "sv";
};

const SectionFadeIn = ({ 
  children, 
  delay = 0,
  className = ""
}: { 
  children: React.ReactNode; 
  delay?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function PrivacyClient({ dict, locale }: Props) {
  return (
    <div className="min-h-screen relative bg-[#FFFBF7]">
      <Header locale={locale} />
      
      <section className="relative py-12 sm:py-16 md:py-24 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
          <SectionFadeIn className="space-y-8 sm:space-y-10 md:space-y-12">
            {/* Header */}
            <div className="space-y-4 sm:space-y-6">
              <Link 
                href={`/${locale}`}
                className="inline-flex items-center gap-2 text-[#4E4A48] hover:text-[#D96D46] transition-colors font-league-spartan text-sm"
              >
                {locale === "sv" ? "← Tillbaka" : "← Back"}
              </Link>
              
              <h1 className={cn(typography.h1.mobile, "font-the-seasons font-semibold text-[#462324] leading-tight")}>
                {dict.privacy.title}
              </h1>
              
              <p className={cn(typography.body.mobile, "font-league-spartan font-normal text-[#4E4A48] leading-relaxed")}>
                {dict.privacy.lastUpdated}
              </p>
            </div>
            
            {/* Content */}
            <div className="space-y-8 sm:space-y-10">
              {dict.privacy.sections.map((section, idx) => (
                <SectionFadeIn key={idx} delay={idx * 0.1} className="space-y-4 sm:space-y-6">
                  <h2 className={cn(typography.h2.mobile, "font-the-seasons font-semibold text-[#462324]")}>
                    {section.title}
                  </h2>
                  
                  {section.content.map((paragraph, pIdx) => (
                    <p 
                      key={pIdx}
                      className={cn(typography.body.mobile, "font-league-spartan font-normal text-[#4E4A48] leading-relaxed")}
                    >
                      {paragraph}
                    </p>
                  ))}
                  
                  {section.list && (
                    <ul className="space-y-2 sm:space-y-3 list-disc list-inside ml-4">
                      {section.list.map((item, iIdx) => (
                        <li 
                          key={iIdx}
                          className={cn(typography.body.mobile, "font-league-spartan font-normal text-[#4E4A48] leading-relaxed")}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </SectionFadeIn>
              ))}
            </div>
            
            {/* Contact */}
            <div className="pt-8 sm:pt-10 border-t border-[#E8D5D0]">
              <SectionFadeIn className="space-y-4">
                <h3 className={cn(typography.h3.mobile, "font-the-seasons font-semibold text-[#462324]")}>
                  {dict.privacy.contact.title}
                </h3>
                <p className={cn(typography.body.mobile, "font-league-spartan font-normal text-[#4E4A48] leading-relaxed mb-4")}>
                  {dict.privacy.contact.description}
                </p>
                <a 
                  href={`mailto:${dict.privacy.contact.email}`}
                  className="inline-block text-[#D96D46] hover:text-[#C85A3A] transition-colors font-league-spartan font-semibold mb-4"
                >
                  {dict.privacy.contact.email}
                </a>
                {dict.privacy.contact.supervisory && (
                  <p className={cn(typography.body.mobile, "font-league-spartan font-normal text-[#4E4A48] leading-relaxed mt-4 pt-4 border-t border-[#E8D5D0]")}>
                    {dict.privacy.contact.supervisory}
                  </p>
                )}
              </SectionFadeIn>
            </div>
          </SectionFadeIn>
        </div>
      </section>
      <Footer dict={dict} locale={locale} />
    </div>
  );
}

