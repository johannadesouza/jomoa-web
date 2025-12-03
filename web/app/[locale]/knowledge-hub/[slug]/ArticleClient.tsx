"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar } from "lucide-react";

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

type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url?: string | null;
  status: string;
  category?: string | null;
  tags?: string[] | null;
  reading_time_minutes?: number | null;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
};

type Props = {
  dict: Dict;
  locale: "en" | "sv";
  article: Article;
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

export default function ArticleClient({ dict, locale, article }: Props) {
  // Simple markdown-like rendering (basic formatting)
  const renderContent = (content: string) => {
    // Split by double newlines for paragraphs
    const blocks = content.split(/\n\n+/);
    
    return blocks.map((block, idx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;
      
      // Check for headings
      if (trimmed.startsWith("# ")) {
        return (
          <h2 key={idx} className={cn(typography.h2.mobile, "font-the-seasons font-semibold text-[#462324] mt-8 mb-4")}>
            {trimmed.replace(/^# /, "")}
          </h2>
        );
      }
      if (trimmed.startsWith("## ")) {
        return (
          <h3 key={idx} className={cn(typography.h3.mobile, "font-the-seasons font-semibold text-[#462324] mt-6 mb-3")}>
            {trimmed.replace(/^## /, "")}
          </h3>
        );
      }
      if (trimmed.startsWith("### ")) {
        return (
          <h4 key={idx} className={cn(typography.h3.mobile, "font-the-seasons font-semibold text-[#462324] mt-4 mb-2 text-lg")}>
            {trimmed.replace(/^### /, "")}
          </h4>
        );
      }
      // Check for bullet lists
      if (trimmed.includes("\n- ") || trimmed.startsWith("- ") || trimmed.match(/^\d+\./)) {
        const lines = trimmed.split(/\n/);
        const isOrdered = lines[0].match(/^\d+\./);
        const items = lines
          .map(line => line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "").trim())
          .filter(Boolean);
        
        const ListTag = isOrdered ? "ol" : "ul";
        return (
          <ListTag key={idx} className={cn(
            isOrdered ? "list-decimal" : "list-disc",
            "list-inside space-y-2 my-4 ml-4"
          )}>
            {items.map((item, i) => (
              <li key={i} className={cn(typography.body.mobile, "font-league-spartan font-normal text-[#4E4A48] leading-relaxed")}>
                {item}
              </li>
            ))}
          </ListTag>
        );
      }
      // Check for bold text (**text**)
      const renderInline = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={i} className="font-semibold text-[#462324]">
                {part.replace(/\*\*/g, "")}
              </strong>
            );
          }
          return part;
        });
      };
      
      // Regular paragraph
      return (
        <p key={idx} className={cn(typography.body.mobile, "font-league-spartan font-normal text-[#4E4A48] leading-relaxed mb-4")}>
          {renderInline(trimmed)}
        </p>
      );
    }).filter(Boolean);
  };

  return (
    <div className="min-h-screen relative bg-[#FFFBF7]">
      <Header locale={locale} />
      
      <article className="py-12 sm:py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
          <SectionFadeIn className="space-y-6 sm:space-y-8">
            {/* Back link */}
            <Link 
              href={`/${locale}/knowledge-hub`}
              className="inline-flex items-center gap-2 text-[#4E4A48] hover:text-[#D96D46] transition-colors font-league-spartan text-sm mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              {locale === "sv" ? "Tillbaka till Knowledge Hub" : "Back to Knowledge Hub"}
            </Link>
            
            {/* Category */}
            {article.category && (
              <div className="mb-4">
                <span className="inline-flex items-center rounded-full bg-[#BA8E90]/[0.15] text-[#462324] text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-1.5 font-league-spartan font-medium">
                  {article.category}
                </span>
              </div>
            )}
            
            {/* Title */}
            <h1 className={cn(typography.h1.mobile, "font-the-seasons font-semibold text-[#462324] leading-tight mb-4 sm:mb-6")}>
              {article.title}
            </h1>
            
            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-[#725A5A] font-league-spartan mb-6 sm:mb-8">
              {article.reading_time_minutes && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{article.reading_time_minutes} {locale === "sv" ? "min läsning" : "min read"}</span>
                </div>
              )}
              {article.published_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(article.published_at).toLocaleDateString(locale === "sv" ? "sv-SE" : "en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
            
            {/* Cover Image */}
            {article.cover_image_url && (
              <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-3xl overflow-hidden mb-8 sm:mb-10 bg-gradient-to-br from-[#462324] to-[#4E4A48]">
                <img
                  src={article.cover_image_url}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Excerpt */}
            {article.excerpt && (
              <p className={cn(typography.body.mobile, "font-league-spartan font-semibold text-[#462324] text-lg sm:text-xl leading-relaxed mb-8 sm:mb-10")}>
                {article.excerpt}
              </p>
            )}
            
            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <div className={cn("space-y-4", typography.body.mobile, "font-league-spartan font-normal text-[#4E4A48] leading-relaxed")}>
                {renderContent(article.content)}
              </div>
            </div>
            
            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="pt-8 sm:pt-10 border-t border-[#E8D5D0] mt-8 sm:mt-10">
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-full bg-[#BA8E90]/[0.15] text-[#462324] text-xs font-league-spartan font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </SectionFadeIn>
        </div>
      </article>
      
      <Footer dict={dict} locale={locale} />
    </div>
  );
}

