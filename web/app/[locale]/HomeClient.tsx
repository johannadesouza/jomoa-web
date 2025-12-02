"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import WaitlistForm from "@/components/WaitlistForm";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Check,
  Calendar,
  TrendingUp,
  Utensils,
  Brain,
  Waves,
  Activity,
  Heart,
  Shield,
  Baby,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// JOMOA Brand Colors - matching jomoa.coach
const colors = {
  bg: "#FFFBF7",              // Main background
  bgAlt: "#FFF8F4",           // Alternate background
  primary: "#D96D46",         // Primary CTA buttons (terracotta)
  text: "#462324",            // Headlines, strong text (plum)
  textSecondary: "#4E4A48",   // Body text
  textMuted: "#725A5A",       // Muted text
  accent: "#BA8E90",          // Accents (mauve)
  border: "#E8D5D0",          // Borders
  card: "#FFFFFF",            // Card backgrounds
};

// Typography System - enhanced responsive scaling
const typography = {
  h1: {
    mobile: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl",
    tablet: "text-5xl",
    desktop: "text-6xl",
    xl: "text-7xl",
  },
  h2: {
    mobile: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl",
    tablet: "text-4xl",
    desktop: "text-5xl",
  },
  h3: {
    mobile: "text-lg sm:text-xl md:text-2xl",
    tablet: "text-2xl",
    desktop: "text-2xl",
  },
  subheading: {
    mobile: "text-base sm:text-lg md:text-xl",
    tablet: "text-xl",
    desktop: "text-xl",
  },
  body: {
    mobile: "text-sm sm:text-base md:text-lg",
    tablet: "text-lg",
    desktop: "text-lg",
  },
  small: {
    mobile: "text-xs sm:text-sm md:text-base",
    tablet: "text-base",
    desktop: "text-base",
  },
};

// Helper Components
const PageSection = ({ 
  children, 
  bgColor = colors.bg, 
  className = "",
  id,
  withDecorativeShapes = false
}: { 
  children: React.ReactNode; 
  bgColor?: string; 
  className?: string;
  id?: string;
  withDecorativeShapes?: boolean;
}) => {
  // Map known colors to Tailwind classes
  const bgClass = bgColor === colors.bg ? "bg-[#FFFBF7]" : 
                  bgColor === colors.bgAlt ? "bg-[#FFF8F4]" :
                  bgColor === colors.text ? "bg-[#462324]" : 
                  undefined;
  const needsOverlay = bgColor !== colors.bg;
  
  return (
    <section 
      id={id}
      className={cn("relative py-12 sm:py-16 md:py-24 lg:py-28 xl:py-32 overflow-hidden", bgClass, className)}
      style={bgClass ? undefined : { backgroundColor: bgColor }}
    >
      {needsOverlay && (
        <div 
          className={cn("absolute inset-0", bgClass)} 
          style={bgClass ? undefined : { background: bgColor }}
        />
      )}
      {withDecorativeShapes && (
        <>
          <div className="absolute top-20 right-0 w-64 h-64 bg-[#D96D46]/[0.08] rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-20 left-0 w-96 h-96 bg-[#BA8E90]/[0.06] rounded-full blur-3xl pointer-events-none"></div>
        </>
      )}
      {children}
    </section>
  );
};

const SectionContainer = ({ 
  children, 
  maxWidth = "1040px",
  className = ""
}: { 
  children: React.ReactNode; 
  maxWidth?: string;
  className?: string;
}) => {
  // Map common maxWidth values to Tailwind classes
  const maxWidthClass = maxWidth === "1040px" ? "max-w-[1040px]" :
                       maxWidth === "1200px" ? "max-w-[1200px]" :
                       maxWidth === "560px" ? "max-w-[560px]" :
                       maxWidth === "680px" ? "max-w-[680px]" :
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

const TextContainer = ({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode; 
  className?: string;
}) => (
  <div 
    className={cn("mx-auto max-w-[680px] w-full", className)}
  >
    {children}
  </div>
);

// Subtle fade-in animation wrapper
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

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  calendar: Calendar,
  "trending-up": TrendingUp,
  utensils: Utensils,
  brain: Brain,
  waves: Waves,
  activity: Activity,
  heart: Heart,
  shield: Shield,
  baby: Baby,
};

type Dict = Awaited<ReturnType<typeof import("@/lib/i18n/getDictionary").getDictionary>>;

type Props = {
  dict: Dict;
  locale: "en" | "sv";
};

// Consistent CTA Button Style
const PrimaryCTA = ({ children, href = "#waitlist" }: { children: React.ReactNode; href?: string }) => (
  <Button
    asChild
    className={cn(
      "rounded-full font-league-spartan font-semibold",
      "text-white bg-[#D96D46]",
      "px-6 sm:px-8 md:px-9 py-3 sm:py-3.5 md:py-4 text-base sm:text-lg",
      "transition-all duration-200 ease-out",
      "hover:opacity-90 hover:scale-[1.02] hover:shadow-md",
      "w-full sm:w-auto"
    )}
  >
    <a 
      href={href}
      onClick={(e) => {
        e.preventDefault();
        document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }}
    >
      {children}
    </a>
  </Button>
);

// Section Components
function HeroSection({ dict, locale }: { dict: Dict; locale: "en" | "sv" }) {
  return (
    <PageSection className="pt-16 sm:pt-20 md:pt-24 lg:pt-32 xl:pt-36 pb-12 sm:pb-16 md:pb-20 lg:pb-24">
      <SectionContainer>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FFF8F4]/60 to-transparent pointer-events-none"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-8 sm:gap-10 md:gap-12 lg:gap-16 xl:gap-20 items-center relative z-10">
            <SectionFadeIn className="space-y-3 sm:space-y-4 md:space-y-5 max-w-2xl">
              {/* Eyebrow label */}
              <div className="mb-3 sm:mb-4 md:mb-5">
                <span className="inline-flex items-center rounded-full bg-[#D96D46]/[0.08] text-[#462324] text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-1.5 font-league-spartan font-medium">
                  {dict.forEveryone.heading}
                </span>
              </div>
              
              <h1
                className={cn(
                  typography.h1.mobile,
                  "font-the-seasons font-semibold",
                  "text-[#462324] mb-2 sm:mb-3 md:mb-4 leading-tight"
                )}
              >
                {dict.hero.h1}
              </h1>
              
              <p
                className={cn(
                  typography.subheading.mobile,
                  "font-league-spartan font-semibold",
                  "text-[#462324] opacity-90 mb-4 sm:mb-5 md:mb-6"
                )}
              >
                {dict.hero.subheadline}
              </p>
              
              <p
                className={cn(
                  typography.body.mobile,
                  "font-league-spartan font-normal",
                  "text-[#4E4A48] leading-relaxed"
                )}
              >
                {dict.hero.body}
              </p>
              
              {/* Value chips */}
              <div className="flex flex-wrap gap-2 sm:gap-2.5 md:gap-3 mt-4 sm:mt-5 md:mt-6">
                <motion.span
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="inline-flex items-center rounded-full bg-[#D96D46]/[0.06] hover:bg-[#D96D46]/[0.12] border border-transparent hover:border-[#D96D46]/30 text-[#462324] text-xs md:text-sm px-3 py-1.5 font-league-spartan font-medium transition-all duration-200 cursor-pointer"
                >
                  {dict.data.heading}
                </motion.span>
                <motion.span
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="inline-flex items-center rounded-full bg-[#D96D46]/[0.06] hover:bg-[#D96D46]/[0.12] border border-transparent hover:border-[#D96D46]/30 text-[#462324] text-xs md:text-sm px-3 py-1.5 font-league-spartan font-medium transition-all duration-200 cursor-pointer"
                >
                  {dict.phases.heading}
                </motion.span>
              </div>
            </SectionFadeIn>
            
            <SectionFadeIn delay={0.1} className="w-full max-w-md mx-auto lg:max-w-none mt-8 md:mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -4, scale: 1.01 }}
                className="rounded-xl sm:rounded-2xl bg-white border border-[#E8D5D0] p-5 sm:p-6 md:p-7 lg:p-8 shadow-sm hover:shadow-lg hover:border-[#D96D46]/30 transition-all duration-300 space-y-3 sm:space-y-4 group"
              >
                <h3 className="text-base sm:text-lg md:text-xl font-the-seasons text-[#462324] mb-3 sm:mb-4 text-center group-hover:text-[#D96D46] transition-colors">
                  {dict.waitlist.form.title}
                </h3>
                <WaitlistForm
                  locale={locale}
                  labels={{
                    title: dict.waitlist.form.title,
                    description: dict.waitlist.form.description,
                    firstNamePlaceholder: dict.waitlist.form.firstNamePlaceholder,
                    emailPlaceholder: dict.waitlist.form.emailPlaceholder,
                    buttonIdle: dict.waitlist.form.buttonIdle,
                    buttonLoading: dict.waitlist.form.buttonLoading,
                    success: dict.waitlist.form.success,
                    duplicateError: dict.waitlist.form.duplicateError,
                    genericError: dict.waitlist.form.genericError,
                    validationError: dict.waitlist.form.validationError,
                    emptyError: dict.waitlist.form.emptyError,
                    firstNameError: dict.waitlist.form.firstNameError,
                  }}
                />
              </motion.div>
              <p 
                className={cn(
                  typography.small.mobile,
                  "font-league-spartan font-normal text-center mt-3 sm:mt-4 opacity-75 text-[#4E4A48] leading-relaxed"
                )}
              >
                {dict.hero.ctaSubtext}
              </p>
            </SectionFadeIn>
          </div>
        </div>
      </SectionContainer>
    </PageSection>
  );
}

function ProblemVariationSection({ dict }: { dict: Dict }) {
  return (
    <PageSection id="value" bgColor={colors.bgAlt} withDecorativeShapes={true}>
      <SectionContainer className="space-y-8 sm:space-y-10 md:space-y-12">
        <div className="h-px w-full bg-[#E8D5D0] opacity-60 mb-8 sm:mb-10 md:mb-12"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 xl:gap-20 items-start">
          {/* Left: Problem */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="pt-2 sm:pt-3 md:pt-4 border-l-2 border-[#D96D46]/30 pl-3 sm:pl-4 md:pl-5 relative"
          >
            <div className="absolute -left-1 top-6 sm:top-8 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#D96D46]/20 rounded-full"></div>
            <h2 className={cn(typography.h2.mobile, "font-the-seasons font-semibold text-[#462324] mb-6 sm:mb-8 md:mb-10")}>
              {dict.problem.heading}
            </h2>
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={cn(typography.body.mobile, typography.body.tablet, typography.body.desktop, "font-league-spartan font-normal text-[#4E4A48]")}
              >
                {dict.problem.body1}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={cn(typography.body.mobile, typography.body.tablet, typography.body.desktop, "font-league-spartan font-normal text-[#4E4A48]")}
              >
                {dict.problem.body2}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={cn(typography.body.mobile, typography.body.tablet, typography.body.desktop, "font-league-spartan font-normal text-[#4E4A48]")}
              >
                {dict.problem.body3}
              </motion.p>
            </div>
          </motion.div>

          {/* Right: Solution card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ y: -4 }}
            className="relative"
          >
            <div className="bg-white border border-[#E8D5D0] rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl hover:border-[#D96D46]/40 p-5 sm:p-6 md:p-7 lg:p-8 transition-all duration-300 space-y-4 sm:space-y-5 md:space-y-6 group">
              <h3 className={cn(typography.h3.mobile, "font-the-seasons font-semibold mb-3 sm:mb-4 md:mb-5 text-[#462324] group-hover:text-[#D96D46] transition-colors")}>
                {dict.variation.heading}
              </h3>
              <p className={cn(typography.body.mobile, "font-league-spartan font-semibold text-[#462324]")}>
                {dict.variation.subheading}
              </p>
              
              <div className="border-l-2 border-[#D96D46]/30 pl-3 sm:pl-4 md:pl-5 space-y-3 sm:space-y-4 group-hover:border-[#D96D46]/50 transition-colors">
                <ul className="space-y-3">
                  {dict.variation.items.map((item, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: idx * 0.08 }}
                      whileHover={{ x: 4 }}
                      className="flex items-start gap-3 sm:gap-4 group/item"
                    >
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Check className="h-4 w-4 sm:h-5 sm:w-5 text-[#D96D46] flex-shrink-0 mt-1 [&>path]:stroke-[1.5] group-hover/item:text-[#D96D46]" />
                      </motion.div>
                      <span className={cn(typography.body.mobile, "font-league-spartan font-normal flex-1 leading-relaxed text-[#4E4A48]")}>
                        {item}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              
              <p className="text-sm opacity-80 mt-4 leading-relaxed font-league-spartan font-normal text-[#4E4A48]">
                {dict.variation.footer}
              </p>
            </div>
          </motion.div>
        </div>
      </SectionContainer>
    </PageSection>
  );
}

function PhasesDataSection({ dict }: { dict: Dict }) {
  return (
    <PageSection bgColor={colors.bgAlt} withDecorativeShapes={true}>
      <SectionContainer className="space-y-8 sm:space-y-10 md:space-y-12">
        <div className="h-px w-full bg-[#E8D5D0] opacity-60 mb-8 sm:mb-10 md:mb-12"></div>
        <TextContainer>
          <SectionFadeIn className="space-y-5 sm:space-y-6 md:space-y-8">
            <div className="space-y-3 sm:space-y-4 md:space-y-5">
              <h2 className={cn(typography.h2.mobile, "font-the-seasons font-semibold text-[#462324] mb-6 sm:mb-8 md:mb-10")}>
                {dict.phases.heading}
              </h2>
              <p className={cn(typography.body.mobile, "font-league-spartan font-normal text-[#4E4A48] leading-relaxed")}>
                {dict.phases.subheading}
              </p>
            </div>
            
            <div className="border-l-2 border-[#D96D46]/30 pl-3 sm:pl-4 md:pl-5 space-y-3 sm:space-y-4 md:space-y-5 group/list">
              <ul className="space-y-3 sm:space-y-4">
                {dict.phases.items.map((item, idx) => {
                  const Icon = iconMap[item.icon] || Calendar;
                  return (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                      whileHover={{ x: 4 }}
                      className="flex items-start gap-2 sm:gap-3 md:gap-4 group/item cursor-pointer"
                    >
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#D96D46] flex-shrink-0 mt-0.5 sm:mt-1 [&>path]:stroke-[1.5] group-hover/item:text-[#D96D46]" />
                      </motion.div>
                      <span className={cn(typography.body.mobile, "font-league-spartan font-normal flex-1 text-[#4E4A48] group-hover/item:text-[#462324] transition-colors leading-relaxed")}>
                        {item.title}
                      </span>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
            
            <div className="space-y-3 sm:space-y-4 md:space-y-5 pt-2">
              <p className={cn(typography.body.mobile, "font-league-spartan font-normal text-[#4E4A48] leading-relaxed")}>
                {dict.phases.body1}
              </p>
              <p className={cn(typography.body.mobile, "font-league-spartan font-normal text-[#4E4A48] leading-relaxed")}>
                {dict.phases.body2}
              </p>
            </div>

            <div className="pt-6 sm:pt-8 md:pt-10 space-y-4 sm:space-y-5 md:space-y-6 border-t border-[#E8D5D0] mt-6 sm:mt-8">
              <div>
                <h3 className={cn(typography.h3.mobile, "font-the-seasons font-semibold mb-3 sm:mb-4 md:mb-5 text-[#462324]")}>
                  {dict.data.heading}
                </h3>
                <p className={cn(typography.body.mobile, "font-league-spartan font-normal mb-4 sm:mb-5 md:mb-6 text-[#4E4A48] leading-relaxed")}>
                  {dict.data.body}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2 sm:gap-2.5 md:gap-3">
                {dict.data.patterns.map((pattern, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-league-spartan font-normal text-xs sm:text-sm bg-[#D96D46]/[0.12] hover:bg-[#D96D46]/[0.20] text-[#D96D46] border border-[#D96D46]/[0.25] hover:border-[#D96D46]/50 transition-all duration-200 cursor-pointer"
                  >
                    {pattern}
                  </motion.span>
                ))}
              </div>
              
              <p className={cn(typography.body.mobile, "font-league-spartan font-normal text-[#4E4A48] leading-relaxed")}>
                {dict.data.insight}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5 pt-2">
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-white border border-[#E8D5D0] rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg hover:border-[#D96D46]/30 transition-all duration-300 group cursor-pointer"
                >
                  <p className={cn(typography.body.mobile, "font-league-spartan font-semibold mb-2 sm:mb-3 text-[#462324] group-hover:text-[#D96D46] transition-colors")}>
                    För klienten:
                  </p>
                  <p className={cn(typography.body.mobile, "font-league-spartan font-normal italic text-[#D96D46] leading-relaxed")}>
                    {dict.data.client}
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-white border border-[#E8D5D0] rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg hover:border-[#D96D46]/30 transition-all duration-300 group cursor-pointer"
                >
                  <p className={cn(typography.body.mobile, "font-league-spartan font-semibold mb-2 sm:mb-3 text-[#462324] group-hover:text-[#D96D46] transition-colors")}>
                    För tränaren:
                  </p>
                  <p className={cn(typography.body.mobile, "font-league-spartan font-normal italic text-[#D96D46] leading-relaxed")}>
                    {dict.data.coach}
                  </p>
                </motion.div>
              </div>
            </div>
          </SectionFadeIn>
        </TextContainer>
      </SectionContainer>
    </PageSection>
  );
}

function FeaturesSection({ dict }: { dict: Dict }) {
  return (
    <PageSection id="features" bgColor={colors.bgAlt} withDecorativeShapes={true}>
      <SectionContainer className="space-y-8 sm:space-y-10 md:space-y-12">
        <div className="h-px w-full bg-[#E8D5D0] opacity-60 mb-8 sm:mb-10 md:mb-12"></div>
        <SectionFadeIn>
          <div className="space-y-8 sm:space-y-10 md:space-y-12">
            <TextContainer className="text-center mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto">
              <h2 className={cn(typography.h2.mobile, "font-the-seasons font-semibold text-[#462324] mb-6 sm:mb-8 md:mb-10")}>
                {dict.features.heading}
              </h2>
              <p className={cn(typography.body.mobile, "mt-3 sm:mt-4 font-league-spartan text-[#4E4A48] leading-relaxed")}>
                {dict.problem.body1}
              </p>
            </TextContainer>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-7 mb-8 sm:mb-10">
              {dict.features.items.map((feature, idx) => {
                const Icon = iconMap[feature.icon] || Calendar;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="h-full flex flex-col bg-white border border-[#E8D5D0] rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-7 shadow-sm hover:shadow-lg hover:border-[#D96D46]/30 transition-all duration-300 space-y-3 sm:space-y-4 group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <motion.div
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#D96D46] group-hover:text-[#D96D46] [&>path]:stroke-[1.5]" />
                      </motion.div>
                      <span className="inline-flex items-center justify-center rounded-full border border-[#D96D46]/40 text-[#D96D46] text-xs font-league-spartan px-2 py-0.5 group-hover:bg-[#D96D46]/[0.08] transition-colors">
                        {idx + 1}
                      </span>
                    </div>
                    <h3 className={cn(typography.h3.mobile, "font-the-seasons font-semibold mb-3 sm:mb-4 text-[#462324] group-hover:text-[#D96D46] transition-colors")}>
                      {feature.title}
                    </h3>
                    <p className={cn(typography.body.mobile, "font-league-spartan font-normal flex-1 text-[#4E4A48] leading-relaxed")}>
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
            
            <div className="text-center">
              <PrimaryCTA>{dict.hero.cta}</PrimaryCTA>
            </div>
          </div>
        </SectionFadeIn>
      </SectionContainer>
    </PageSection>
  );
}

function ForEveryoneStepsSection({ dict }: { dict: Dict }) {
  return (
    <PageSection>
      <SectionContainer className="space-y-8 sm:space-y-10 md:space-y-12">
        <div className="h-px w-full bg-[#E8D5D0] opacity-60 mb-8 sm:mb-10 md:mb-12"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 xl:gap-20 items-start">
          {/* Left column: forEveryone */}
          <TextContainer className="space-y-5 sm:space-y-6 md:space-y-8">
            <SectionFadeIn className="space-y-5 sm:space-y-6 md:space-y-8">
              <div className="space-y-3 sm:space-y-4">
                <h2 className={cn(typography.h2.mobile, "font-the-seasons font-semibold text-[#462324] mb-3 sm:mb-4")}>
                  {dict.forEveryone.heading}
                </h2>
                <p className={cn(typography.body.mobile, "font-league-spartan font-normal text-[#4E4A48] leading-relaxed")}>
                  {dict.forEveryone.body}
                </p>
              </div>
              
              <div className="bg-white/60 border border-[#E8D5D0] rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 hover:bg-white/80 transition-colors duration-300">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4">
                  {dict.forEveryone.clients.map((client, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                      whileHover={{ y: -2, scale: 1.05 }}
                      className="flex items-center justify-center text-center bg-white border border-[#E8D5D0] rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md hover:border-[#D96D46]/40 hover:bg-[#D96D46]/[0.03] transition-all duration-300 cursor-pointer group"
                    >
                      <p className={cn(typography.body.mobile, "font-league-spartan font-normal text-[#4E4A48] group-hover:text-[#D96D46] transition-colors")}>
                        {client}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <p className={cn(typography.body.mobile, "font-league-spartan font-normal italic text-[#4E4A48] pt-2 sm:pt-3 leading-relaxed")}>
                {dict.forEveryone.footer}
              </p>
            </SectionFadeIn>
          </TextContainer>

          {/* Right column: steps */}
          <TextContainer className="space-y-5 sm:space-y-6 md:space-y-8">
            <SectionFadeIn className="space-y-5 sm:space-y-6 md:space-y-8">
              <div>
                <h3 className={cn(typography.h3.mobile, "font-the-seasons font-semibold mb-3 sm:mb-4 text-[#462324]")}>
                  {dict.steps.heading}
                </h3>
                {dict.steps.intro && (
                  <p className={cn(typography.body.mobile, "font-league-spartan font-normal mb-4 sm:mb-5 md:mb-6 text-[#4E4A48] leading-relaxed")}>
                    {dict.steps.intro}
                  </p>
                )}
              </div>
              
              <div className="space-y-3 sm:space-y-4 md:space-y-5">
                {dict.steps.items.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    whileHover={{ x: 4, borderColor: "#D96D46" }}
                    className="flex flex-col sm:flex-row gap-3 sm:gap-4 border-l-2 border-[#D96D46]/30 pl-3 sm:pl-4 md:pl-5 group cursor-pointer transition-all duration-300"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0 flex items-center justify-center font-the-seasons font-semibold w-8 h-8 sm:w-10 sm:h-10 text-base sm:text-lg text-[#D96D46] bg-[#D96D46]/[0.08] rounded-full group-hover:bg-[#D96D46]/[0.15] transition-colors"
                    >
                      {idx + 1}
                    </motion.div>
                    <div className="flex-1">
                      <h4 className={cn(typography.h3.mobile, "font-the-seasons font-semibold mb-2 text-[#462324] group-hover:text-[#D96D46] transition-colors")}>
                        {step.title}
                      </h4>
                      <p className={cn(typography.body.mobile, "font-league-spartan font-normal text-[#4E4A48] leading-relaxed")}>
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </SectionFadeIn>
          </TextContainer>
        </div>
      </SectionContainer>
    </PageSection>
  );
}

function FinalCtaSection({ dict }: { dict: Dict }) {
  return (
    <PageSection bgColor={colors.text} withDecorativeShapes={true}>
      <SectionContainer className="space-y-8 sm:space-y-10 md:space-y-12">
        <div className="h-px w-full bg-[#E8D5D0] opacity-60 mb-8 sm:mb-10 md:mb-12"></div>
        <SectionFadeIn>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-xl mx-auto text-center space-y-4 sm:space-y-5 md:space-y-6 relative"
          >
            <div className="absolute -top-6 sm:-top-8 left-1/2 transform -translate-x-1/2 w-20 sm:w-24 h-1 bg-[#FEE7AB]/20 rounded-full"></div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="font-league-spartan text-xs sm:text-sm uppercase tracking-[0.18em] text-[#FEE7AB]/80 mb-2 sm:mb-3"
            >
              {dict.hero.subheadline}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={cn(typography.h1.mobile, "font-the-seasons font-semibold text-[#FEE7AB] mb-3 sm:mb-4 leading-tight")}
            >
              {dict.ctaFooter.h1}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-3 sm:space-y-4 md:space-y-5"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <PrimaryCTA>{dict.ctaFooter.cta}</PrimaryCTA>
              </motion.div>
              <p className={cn(typography.body.mobile, "font-league-spartan font-normal text-[#FEE7AB] leading-relaxed")}>
                {dict.ctaFooter.subtext}
              </p>
              <p className={cn(typography.small.mobile, "font-league-spartan font-normal opacity-90 text-[#FEE7AB] leading-relaxed")}>
                {dict.ctaFooter.trust}
              </p>
            </motion.div>
          </motion.div>
        </SectionFadeIn>
      </SectionContainer>
    </PageSection>
  );
}

function WaitlistSection({ dict, locale }: { dict: Dict; locale: "en" | "sv" }) {
  return (
    <PageSection id="waitlist" bgColor={colors.bgAlt} className="scroll-mt-20 sm:scroll-mt-24">
      <SectionContainer maxWidth="560px" className="space-y-8 sm:space-y-10 md:space-y-12">
        <div className="h-px w-full bg-[#E8D5D0] opacity-60 mb-8 sm:mb-10 md:mb-12"></div>
        <SectionFadeIn>
          <div className="space-y-3 sm:space-y-4 text-center mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto">
            <h2 className={cn(typography.h2.mobile, "font-the-seasons font-semibold text-[#462324] mb-6 sm:mb-8 md:mb-10")}>
              {dict.waitlist.heading}
            </h2>
            <p className={cn(typography.body.mobile, "font-league-spartan font-normal text-[#4E4A48] leading-relaxed")}>
              {dict.waitlist.intro}
            </p>
          </div>
          <div className="space-y-3 sm:space-y-4 md:space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="rounded-xl sm:rounded-2xl bg-white border border-[#E8D5D0] p-5 sm:p-6 md:p-7 lg:p-8 shadow-sm hover:shadow-lg hover:border-[#D96D46]/30 transition-all duration-300 space-y-3 sm:space-y-4 group"
            >
              <h3 className="text-base sm:text-lg md:text-xl font-the-seasons text-[#462324] mb-3 sm:mb-4 text-center group-hover:text-[#D96D46] transition-colors">
                {dict.waitlist.form.title}
              </h3>
              <WaitlistForm
                locale={locale}
                labels={{
                  title: dict.waitlist.form.title,
                  description: dict.waitlist.form.description,
                  firstNamePlaceholder: dict.waitlist.form.firstNamePlaceholder,
                  emailPlaceholder: dict.waitlist.form.emailPlaceholder,
                  buttonIdle: dict.waitlist.form.buttonIdle,
                  buttonLoading: dict.waitlist.form.buttonLoading,
                  success: dict.waitlist.form.success,
                  duplicateError: dict.waitlist.form.duplicateError,
                  genericError: dict.waitlist.form.genericError,
                  validationError: dict.waitlist.form.validationError,
                  emptyError: dict.waitlist.form.emptyError,
                  firstNameError: dict.waitlist.form.firstNameError,
                }}
              />
            </motion.div>
            {dict.waitlist.trust && (
              <p className={cn(typography.small.mobile, "font-league-spartan font-normal text-center opacity-80 text-[#4E4A48] leading-relaxed")}>
                {dict.waitlist.trust}
              </p>
            )}
          </div>
        </SectionFadeIn>
      </SectionContainer>
    </PageSection>
  );
}


export default function HomeClient({ dict, locale }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Handle hash scrolling on landing page
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  }, [pathname, searchParams]);

  return (
    <div className="min-h-screen relative bg-[#FFFBF7]">
      <Header locale={locale} />
      <HeroSection dict={dict} locale={locale} />
      <ProblemVariationSection dict={dict} />
      <PhasesDataSection dict={dict} />
      <FeaturesSection dict={dict} />
      <ForEveryoneStepsSection dict={dict} />
      <FinalCtaSection dict={dict} />
      <WaitlistSection dict={dict} locale={locale} />
      <Footer dict={dict} locale={locale} />
    </div>
  );
}
