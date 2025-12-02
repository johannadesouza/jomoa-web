"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  ArrowRight,
  BookOpen,
  TrendingUp,
  Utensils,
  Brain,
  Moon,
  Beaker,
  Heart,
  Activity,
  Waves,
} from "lucide-react";
import Link from "next/link";

// JOMOA Brand Colors
const colors = {
  bg: "#FFFBF7",
  bgAlt: "#F0D6D7",
  primary: "#D96D46",
  text: "#462324",
  textSecondary: "#4E4A48",
  textMuted: "#725A5A",
  accent: "#BA8E90",
  border: "#E8D5D0",
  card: "#FFFFFF",
  darkBg: "#462324",
  darkBgAlt: "#4E4A48",
};

// Typography System
const typography = {
  h1: {
    mobile: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl",
  },
  h2: {
    mobile: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl",
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

// Helper Components
const PageSection = ({ 
  children, 
  bgColor = colors.bg, 
  className = "",
  id,
}: { 
  children: React.ReactNode; 
  bgColor?: string; 
  className?: string;
  id?: string;
}) => {
  const bgClass = bgColor === colors.bg ? "bg-[#FFFBF7]" : 
                  bgColor === colors.bgAlt ? "bg-[#F0D6D7]" :
                  bgColor === colors.darkBg ? "bg-[#462324]" :
                  bgColor === colors.darkBgAlt ? "bg-[#4E4A48]" :
                  undefined;
  
  return (
    <section 
      id={id}
      className={cn("relative py-12 sm:py-16 md:py-24 lg:py-28 xl:py-32 overflow-hidden", bgClass, className)}
      style={bgClass ? undefined : { backgroundColor: bgColor }}
    >
      {children}
    </section>
  );
};

const SectionContainer = ({ 
  children, 
  maxWidth = "1200px",
  className = ""
}: { 
  children: React.ReactNode; 
  maxWidth?: string;
  className?: string;
}) => {
  const maxWidthClass = maxWidth === "1200px" ? "max-w-[1200px]" :
                       maxWidth === "1040px" ? "max-w-[1040px]" :
                       undefined;
  
  return (
    <div 
      className={cn("mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 relative z-10", maxWidthClass, className)}
      style={maxWidthClass ? undefined : { maxWidth }}
    >
      {children}
    </div>
  );
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

// Category Icons Map
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Hormoner & kvinnlig fysiologi": Heart,
  "Hormones & female physiology": Heart,
  "Träning & prestation": Activity,
  "Training & performance": Activity,
  "Kost & metabolism": Utensils,
  "Nutrition & metabolism": Utensils,
  "Stress, sömn & beteende": Moon,
  "Stress, sleep & behavior": Moon,
  "Vetenskap & forskning": Beaker,
  "Science & research": Beaker,
};

// Hero Section
function HeroSection({ dict, locale }: { dict: Dict; locale: "en" | "sv" }) {
  return (
    <PageSection 
      bgColor={colors.darkBg}
      className="relative"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#462324] via-[#4E4A48] to-[#462324] opacity-100"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-[#462324]/50"></div>
      
      <SectionContainer>
        <div className="relative z-10">
          <SectionFadeIn className="text-center space-y-6 sm:space-y-8 md:space-y-10 max-w-4xl mx-auto">
            <h1
              className={cn(
                typography.h1.mobile,
                "font-the-seasons font-semibold",
                "text-[#FFFBF7] mb-4 sm:mb-6 leading-tight"
              )}
            >
              {dict.knowledgeHub.hero.title}
            </h1>
            
            <p
              className={cn(
                typography.body.mobile,
                "font-league-spartan font-normal",
                "text-[#FFFBF7] opacity-90 leading-relaxed max-w-3xl mx-auto"
              )}
            >
              {dict.knowledgeHub.hero.description}
            </p>
            
            <div className="pt-4 sm:pt-6">
              <p className={cn(typography.body.mobile, "font-league-spartan font-normal text-[#FFFBF7] opacity-75 italic")}>
                {locale === "sv" ? "Kommer snart..." : "Coming soon..."}
              </p>
            </div>
          </SectionFadeIn>
        </div>
      </SectionContainer>
    </PageSection>
  );
}

// Category Section
function CategorySection({ dict }: { dict: Dict }) {
  return (
    <PageSection bgColor={colors.bgAlt}>
      <SectionContainer>
        <SectionFadeIn className="space-y-8 sm:space-y-10 md:space-y-12">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className={cn(typography.h2.mobile, "font-the-seasons font-semibold text-[#462324] mb-4")}>
              {dict.knowledgeHub.categories.title}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {dict.knowledgeHub.categories.items.map((category, idx) => {
              const Icon = categoryIcons[category.title] || BookOpen;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative overflow-hidden rounded-3xl bg-white border border-[#E8D5D0] shadow-sm hover:shadow-lg hover:border-[#D96D46]/30 transition-all duration-300 cursor-pointer"
                >
                  {/* Image placeholder - dark with natural light */}
                  <div className="relative h-48 bg-gradient-to-br from-[#462324] to-[#4E4A48] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    <div className="absolute top-4 left-4 right-4 z-10">
                      <h3 className={cn(typography.h3.mobile, "font-the-seasons font-semibold text-white mb-2")}>
                        {category.title}
                      </h3>
                    </div>
                    {/* Organic icon overlay */}
                    <div className="absolute bottom-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity">
                      <Icon className="h-16 w-16 text-white" />
                    </div>
                  </div>
                  
                  <div className="p-5 sm:p-6">
                    <p className={cn(typography.body.mobile, "font-league-spartan font-normal text-[#4E4A48] italic")}>
                      {category.tagline}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </SectionFadeIn>
      </SectionContainer>
    </PageSection>
  );
}

// Featured Article Section
function FeaturedSection({ dict }: { dict: Dict }) {
  return (
    <PageSection bgColor={colors.bg}>
      <SectionContainer>
        <SectionFadeIn className="space-y-6 sm:space-y-8">
          <div className="inline-block mb-4">
            <span className="inline-flex items-center rounded-full bg-[#D96D46]/[0.08] text-[#462324] text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-1.5 font-league-spartan font-medium">
              {dict.knowledgeHub.featured.label}
            </span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 items-center">
            {/* Image */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative h-64 sm:h-80 md:h-96 rounded-3xl overflow-hidden bg-gradient-to-br from-[#462324] to-[#4E4A48]"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              {/* Placeholder for real image */}
            </motion.div>
            
            {/* Content */}
            <div className="space-y-4 sm:space-y-6">
              <h2 className={cn(typography.h2.mobile, "font-the-seasons font-semibold text-[#462324] leading-tight")}>
                {dict.knowledgeHub.featured.title}
              </h2>
              
              <p className={cn(typography.body.mobile, "font-league-spartan font-normal text-[#4E4A48] leading-relaxed")}>
                {dict.knowledgeHub.featured.summary}
              </p>
              
              <Button
                asChild
                variant="outline"
                className={cn(
                  "rounded-full font-league-spartan font-semibold",
                  "text-[#462324] border-[#D96D46] hover:bg-[#D96D46] hover:text-white",
                  "px-6 sm:px-8 py-3 sm:py-3.5 text-base sm:text-lg",
                  "transition-all duration-200 ease-out",
                  "inline-flex items-center gap-2"
                )}
              >
                <Link href="/knowledge-hub/article">
                  {dict.knowledgeHub.featured.readMore}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </SectionFadeIn>
      </SectionContainer>
    </PageSection>
  );
}

// All Articles Grid
function ArticlesGrid({ dict }: { dict: Dict }) {
  return (
    <div className="space-y-8 sm:space-y-10 md:space-y-12">
      <h2 className={cn(typography.h2.mobile, "font-the-seasons font-semibold text-[#462324] text-center mb-8 sm:mb-10")}>
        {dict.knowledgeHub.articles.title}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {dict.knowledgeHub.articles.items.map((article, idx) => (
          <motion.article
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ y: -4, scale: 1.01 }}
            className="group bg-white border border-[#E8D5D0] rounded-3xl overflow-hidden shadow-sm hover:shadow-lg hover:border-[#D96D46]/30 transition-all duration-300 cursor-pointer"
          >
            {/* Image - 50% of card */}
            <div className="relative h-48 bg-gradient-to-br from-[#462324] to-[#4E4A48]">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
            
            {/* Content */}
            <div className="p-5 sm:p-6 space-y-4">
              {/* Category tag */}
              <span className="inline-flex items-center rounded-full bg-[#BA8E90]/[0.15] text-[#462324] text-xs px-3 py-1 font-league-spartan font-medium">
                {article.category}
              </span>
              
              {/* Title */}
              <h3 className={cn(typography.h3.mobile, "font-the-seasons font-semibold text-[#462324] leading-tight group-hover:text-[#D96D46] transition-colors")}>
                {article.title}
              </h3>
              
              {/* Summary - 2 lines */}
              <p className={cn(typography.body.mobile, "font-league-spartan font-normal text-[#4E4A48] leading-relaxed line-clamp-2")}>
                {article.summary}
              </p>
              
              {/* Read more */}
              <div className="flex items-center gap-2 text-[#D96D46] font-league-spartan font-semibold text-sm group-hover:gap-3 transition-all">
                {dict.knowledgeHub.articles.readMore}
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

// Sidebar Component
function Sidebar({ dict }: { dict: Dict }) {
  return (
    <aside className="space-y-8">
      {/* Most Read */}
      <div className="bg-white border border-[#E8D5D0] rounded-2xl p-5 sm:p-6">
        <h3 className={cn(typography.h3.mobile, "font-the-seasons font-semibold text-[#462324] mb-4")}>
          {dict.knowledgeHub.sidebar.mostRead.title}
        </h3>
        <ul className="space-y-3">
          {[1, 2, 3].map((i) => (
            <li key={i} className="text-sm font-league-spartan text-[#4E4A48] hover:text-[#D96D46] transition-colors cursor-pointer">
              {i}. Artikel titel {i}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Popular Topics */}
      <div className="bg-white border border-[#E8D5D0] rounded-2xl p-5 sm:p-6">
        <h3 className={cn(typography.h3.mobile, "font-the-seasons font-semibold text-[#462324] mb-4")}>
          {dict.knowledgeHub.sidebar.popularTopics.title}
        </h3>
        <div className="flex flex-wrap gap-2">
          {["Hormoner", "Träning", "Kost", "Återhämtning"].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 rounded-full bg-[#BA8E90]/[0.15] text-[#462324] text-xs font-league-spartan font-medium hover:bg-[#BA8E90]/[0.25] transition-colors cursor-pointer"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      
      {/* Ask JOMOA */}
      <div className="bg-white border border-[#D96D46]/30 rounded-2xl p-5 sm:p-6">
        <h3 className={cn(typography.h3.mobile, "font-the-seasons font-semibold text-[#462324] mb-4")}>
          {dict.knowledgeHub.sidebar.askJomoa.title}
        </h3>
        <p className={cn(typography.body.mobile, "font-league-spartan font-normal text-[#4E4A48] mb-4")}>
          Har du en fråga om din cykel eller träning?
        </p>
        <Button
          asChild
          className={cn(
            "rounded-full font-league-spartan font-semibold",
            "text-white bg-[#D96D46]",
            "px-6 py-3 text-sm",
            "w-full"
          )}
        >
          <a href="#contact">Ställ din fråga</a>
        </Button>
      </div>
      
      {/* Updates */}
      <div className="bg-[#FEE7AB]/[0.3] border border-[#D96D46]/20 rounded-2xl p-5 sm:p-6">
        <h3 className={cn(typography.h3.mobile, "font-the-seasons font-semibold text-[#462324] mb-4")}>
          {dict.knowledgeHub.sidebar.updates.title}
        </h3>
        <ul className="space-y-3 text-sm font-league-spartan text-[#4E4A48]">
          <li>• Träningsprogram i block</li>
          <li>• Energi/humör-logg</li>
          <li>• Cykelmodul</li>
          <li>• Coach-insights</li>
        </ul>
      </div>
    </aside>
  );
}

// Knowledge Hub Footer Section (before main footer)
function KnowledgeHubFooterSection({ dict }: { dict: Dict }) {
  return (
    <PageSection bgColor={colors.bgAlt}>
      <SectionContainer maxWidth="800px">
        <SectionFadeIn className="text-center space-y-4 sm:space-y-6">
          <h2 className={cn(typography.h2.mobile, "font-the-seasons font-semibold text-[#462324]")}>
            {dict.knowledgeHub.footer.title}
          </h2>
          <p className={cn(typography.body.mobile, "font-league-spartan font-normal text-[#4E4A48] leading-relaxed max-w-2xl mx-auto")}>
            {dict.knowledgeHub.footer.description}
          </p>
        </SectionFadeIn>
      </SectionContainer>
    </PageSection>
  );
}

// Main Component
export default function KnowledgeHubClient({ dict, locale }: Props) {
  return (
    <div className="min-h-screen relative bg-[#FFFBF7]">
      <Header locale={locale} />
      <HeroSection dict={dict} locale={locale} />
      <KnowledgeHubFooterSection dict={dict} />
      <Footer dict={dict} locale={locale} />
    </div>
  );
}

