"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import WaitlistForm from "@/components/WaitlistForm";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
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
import PhoneMockup from "@/components/landing/PhoneMockup";

// JOMOA app palette – clean, product-first (matches jomoa-mobile theme)
const colors = {
  bg: "#FFFBF7",              // softLightPink
  bgAlt: "#FFF5F0",            // card
  surface: "#F0D6D7",          // dustyMauveLighter
  text: "#EDE8E6",            // light text on dark
  textPrimary: "#462324",     // deepPlumBrown
  textSecondary: "#976568",    // deepPlumBrownLighter
  accent: "#D96D46",           // warmTerracotta
  border: "rgba(70, 35, 36, 0.12)",
  dark: "#462324",            // B2B block (deepPlumBrown)
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
                  bgColor === colors.bgAlt ? "bg-[#FFF5F0]" :
                  bgColor === colors.surface ? "bg-[#F0D6D7]" :
                  bgColor === colors.dark ? "bg-[#462324]" :
                  undefined;
  const bgStyle = bgClass ? undefined : (bgColor ? { backgroundColor: bgColor } : undefined);
  const needsOverlay = !bgClass && bgColor;
  return (
    <section
      id={id}
      className={cn("relative py-20 md:py-28 lg:py-36 overflow-hidden", bgClass, className)}
      style={!bgClass && bgColor ? { backgroundColor: bgColor } : undefined}
    >
      {needsOverlay && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: bgColor }} aria-hidden />
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

const Prose = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("max-w-[600px]", className)}>{children}</div>
);

const ChapterHeading = ({ children }: { children: React.ReactNode }) => (
  <h2 className={cn(typography.h2.mobile, "font-inter font-bold text-[#462324] mb-10 md:mb-12")}>
    {children}
  </h2>
);

const BlockDivider = () => (
  <div className="border-t border-[#462324]/10 my-12 md:my-16" aria-hidden />
);

const AccentBand = () => (
  <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#D96D46]/40 to-transparent" aria-hidden />
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    className="mb-6 md:mb-8"
    initial={{ opacity: 0, x: -8 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.35 }}
  >
    <span className="inline-block text-xs font-inter font-semibold uppercase tracking-widest text-[#D96D46]">
      {children}
    </span>
    <motion.div
      className="mt-2 h-0.5 w-8 bg-[#D96D46]/60 rounded-full"
              aria-hidden
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      style={{ originX: 0 }}
    />
  </motion.div>
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

const PrimaryCTA = ({ children, href = "#waitlist", scrollId }: { children: React.ReactNode; href?: string; scrollId?: string }) => (
  <Button
    asChild
    className={cn(
      "rounded-lg font-inter font-semibold",
      "text-white bg-[#D96D46] hover:bg-[#C45D36]",
      "px-6 sm:px-8 py-3 text-base",
      "transition-all duration-200 w-full sm:w-auto hover:scale-[1.03] active:scale-[0.98] hover:shadow-lg"
    )}
  >
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        const id = scrollId ?? (href?.replace("#", "") || "waitlist");
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
    >
      {children}
    </a>
  </Button>
);

// App-like placeholders for How it works steps (plan, check-in, decision)
function ScreenshotPlaceholder({ alt, step }: { alt: string; step: number }) {
  const isPlan = step === 1;
  const isCheckin = step === 2;
  const isDecision = step === 3;
  return (
    <div
      className="aspect-[9/19] max-h-[420px] w-full max-w-[280px] mx-auto rounded-2xl overflow-hidden border border-[#462324]/10 bg-[#FFF5F0]"
      role="img"
      aria-label={alt}
    >
      <div className="h-full flex flex-col p-3">
        {isPlan && (
          <>
            <div className="h-5 rounded-lg bg-[#D96D46]/15 mb-3 w-3/4" />
            <div className="space-y-2 flex-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 rounded-xl border border-[#462324]/12 bg-white/80" />
              ))}
            </div>
            <p className="text-[9px] font-inter text-[#976568] mt-2">Välj plan</p>
          </>
        )}
        {isCheckin && (
          <>
            <div className="h-2 w-2/3 rounded-full bg-[#462324]/10 mb-3" />
            <div className="space-y-2 flex-1">
              <div className="h-8 rounded-lg border border-[#462324]/15 bg-white/80" />
              <div className="h-8 rounded-lg border border-[#462324]/15 bg-white/80" />
              <div className="h-9 rounded-full bg-[#D96D46]/20" />
            </div>
            <p className="text-[9px] font-inter text-[#976568] mt-2">Logga pass · Check-in</p>
          </>
        )}
        {isDecision && (
          <>
            <div className="h-2 w-3/4 rounded-full bg-[#462324]/10 mb-4" />
            <div className="flex flex-col gap-2 flex-1 justify-center">
              <div className="h-8 rounded-lg bg-[#462324]/10" />
              <div className="h-8 rounded-lg bg-[#D96D46]/25 border border-[#D96D46]/40" />
              <div className="h-8 rounded-lg bg-[#462324]/10" />
            </div>
            <p className="text-[9px] font-inter text-[#976568] mt-2">Öka · Behåll · Justera</p>
          </>
        )}
        {!isPlan && !isCheckin && !isDecision && (
          <>
            <div className="h-2 w-3/4 rounded-full bg-[#D96D46]/20 mb-4" />
            <div className="space-y-2 flex-1">
              <div className="h-2 w-full rounded bg-[#462324]/10" />
              <div className="h-2 w-5/6 rounded bg-[#462324]/10" />
            </div>
            <p className="text-[10px] font-inter text-[#976568] mt-2">Step {step}</p>
          </>
        )}
      </div>
    </div>
  );
}

const staggerContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const staggerItem = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

function HeroSection({ dict }: { dict: Dict }) {
  return (
    <PageSection className="min-h-[85vh] flex flex-col justify-center pt-20 pb-16 md:pt-24 md:pb-20 lg:pt-28 lg:pb-24">
      <SectionContainer maxWidth="1200px">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.1fr] gap-12 lg:gap-16 items-center">
          <motion.div
            className="order-2 lg:order-1"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            <Prose className="space-y-6">
              <motion.h1
                variants={staggerItem}
                className={cn("text-4xl sm:text-5xl lg:text-6xl font-inter font-bold text-[#462324] leading-[1.1] tracking-tight")}
              >
                {dict.hero.h1}
              </motion.h1>
              <motion.p variants={staggerItem} className={cn("text-lg sm:text-xl font-inter font-normal text-[#976568] leading-relaxed")}>
                {dict.hero.subheadline}
              </motion.p>
              {dict.hero.body && (
                <motion.p variants={staggerItem} className={cn("font-inter text-[#462324] leading-relaxed")}>{dict.hero.body}</motion.p>
              )}
              <motion.div variants={staggerItem} className="flex flex-col sm:flex-row gap-3 pt-2">
                <PrimaryCTA scrollId="waitlist">{dict.hero.ctaB2C}</PrimaryCTA>
                <Button
                  asChild
                  variant="outline"
                  className={cn(
                    "rounded-lg font-inter font-semibold border-[#462324]/25 text-[#462324] hover:bg-[#462324]/5 px-6 py-3 w-full sm:w-auto transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  )}
                >
                  <a href="#b2b" onClick={(e) => { e.preventDefault(); document.getElementById("b2b")?.scrollIntoView({ behavior: "smooth" }); }}>
                    {dict.hero.ctaB2B}
                  </a>
                </Button>
              </motion.div>
            </Prose>
          </motion.div>
          <motion.div
            className="order-1 lg:order-2 flex justify-center"
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="flex justify-center"
            >
              <PhoneMockup src={null} alt="JOMOA app" height={640} />
            </motion.div>
          </motion.div>
        </div>
      </SectionContainer>
    </PageSection>
  );
}

function ValueSection({ dict }: { dict: Dict }) {
  return (
    <PageSection id="value" bgColor={colors.bg} className="scroll-mt-20">
      <SectionContainer>
        <SectionFadeIn>
          <SectionLabel>{dict.whyJomoa.heading}</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,minmax(200px,320px)] gap-10 lg:gap-16 items-start">
            <Prose className="space-y-4">
              <motion.h2
                className={cn(typography.h2.mobile, "font-inter font-bold text-[#462324]")}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                {dict.whyJomoa.problem}
              </motion.h2>
              <motion.p
                className={cn("font-inter font-medium text-[#462324] leading-relaxed")}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.08 }}
              >
                {dict.whyJomoa.solution}
              </motion.p>
            </Prose>
            <motion.div
              className="hidden lg:block h-48 rounded-xl bg-[#462324]/5 border border-[#462324]/10"
              aria-hidden
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            />
          </div>
        </SectionFadeIn>
      </SectionContainer>
    </PageSection>
  );
}

function HowItWorksSection({ dict }: { dict: Dict }) {
  const steps = [
    { ...dict.howItWorks.step1, alt: (dict.howItWorks.step1 as { screenshotAlt?: string }).screenshotAlt ?? "Step 1" },
    { ...dict.howItWorks.step2, alt: (dict.howItWorks.step2 as { screenshotAlt?: string }).screenshotAlt ?? "Step 2" },
    { ...dict.howItWorks.step3, alt: (dict.howItWorks.step3 as { screenshotAlt?: string }).screenshotAlt ?? "Step 3" },
  ];
  return (
    <PageSection bgColor={colors.bgAlt}>
      <SectionContainer maxWidth="1040px">
        <h2 className={cn(typography.h2.mobile, "font-inter font-semibold text-[#462324] mb-8 md:mb-10")}>
          {dict.howItWorks.heading}
        </h2>
        <div className="space-y-10 md:space-y-14">
          {steps.map((step, idx) => {
            const isImageLeft = idx % 2 === 0;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5 }}
                className={cn(
                  "grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center",
                  !isImageLeft && "md:grid-flow-dense"
                )}
              >
                <div className={!isImageLeft ? "md:col-start-2" : ""}>
                  <ScreenshotPlaceholder alt={step.alt} step={idx + 1} />
                </div>
                <div className={cn("max-w-md", !isImageLeft && "md:col-start-1 md:row-start-1")}>
                  <span className="inline-block w-8 h-8 rounded-full bg-[#D96D46]/[0.12] text-[#D96D46] font-inter font-semibold text-sm flex items-center justify-center mb-4">
                    {idx + 1}
                  </span>
                  <h3 className={cn(typography.h3.mobile, "font-inter font-semibold text-[#462324] mb-3")}>
                    {step.title}
                  </h3>
                  <p className={cn(typography.body.mobile, "font-inter font-normal text-[#976568] leading-relaxed")}>
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </SectionContainer>
    </PageSection>
  );
}

function ReadinessSection({ dict }: { dict: Dict }) {
  return (
    <PageSection bgColor={colors.bg}>
      <SectionContainer>
        <SectionFadeIn className="max-w-[560px]">
          <h2 className={cn(typography.h2.mobile, "font-inter font-semibold text-[#462324] mb-6 md:mb-8")}>
            {dict.readiness.heading}
          </h2>
          <p className={cn(typography.body.mobile, "font-inter font-normal text-[#976568] mb-5 leading-relaxed")}>
            {dict.readiness.intro}
          </p>
          <p className={cn(typography.body.mobile, "font-inter font-medium text-[#462324] mb-5")}>
            {dict.readiness.default}
          </p>
          <p className={cn(typography.body.mobile, "font-inter font-normal text-[#976568] leading-relaxed")}>
            {dict.readiness.vsLinear}
          </p>
        </SectionFadeIn>
      </SectionContainer>
    </PageSection>
  );
}

/** How it works – one flow: step pills + content + compact features + one-line readiness + CTA */
function ChapterHowSection({ dict }: { dict: Dict }) {
  const [stepIndex, setStepIndex] = useState(0);
  const steps = [
    dict.howItWorks.step1,
    dict.howItWorks.step2,
    dict.howItWorks.step3,
  ];
  const step = steps[stepIndex];
  const chapters = (dict as { chapterHeadings?: { how: string; forYou: string; choose: string } }).chapterHeadings;
  const readinessOneLiner = (dict.readiness as { oneLiner?: string })?.oneLiner;
  return (
    <PageSection id="features" bgColor={colors.bgAlt}>
      <SectionContainer maxWidth="1040px" className="space-y-10 md:space-y-12">
        <SectionLabel>{chapters?.how ?? dict.howItWorks.heading}</SectionLabel>

        {/* Step pills: 1. Välj plan | 2. Logga | 3. Få beslut */}
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Steg">
          {steps.map((s, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={stepIndex === i}
              onClick={() => setStepIndex(i)}
              className={cn(
                "px-4 py-2.5 rounded-lg font-inter font-semibold text-sm transition-all",
                stepIndex === i
                  ? "bg-[#462324] text-[#EDE8E6] shadow-md"
                  : "bg-[#462324]/10 text-[#462324] hover:bg-[#462324]/20"
              )}
            >
              {i + 1}. {s.title}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-[#462324]/10 bg-[#FFFBF7] p-6 md:p-8 min-h-[180px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
              className="max-w-[560px]"
            >
              <h3 className="text-xl font-inter font-bold text-[#462324] mb-2">
                {step.title}
              </h3>
              <p className="font-inter text-[#976568] leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* I appen får du: compact strip of feature titles */}
        <div>
          <p className="text-xs font-inter font-semibold uppercase tracking-wide text-[#976568] mb-2">
            {dict.features.heading}
          </p>
          <div className="flex flex-wrap gap-2">
            {dict.features.items.map((feature, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#462324]/08 text-[#462324] font-inter text-sm"
              >
                {feature.title}
              </span>
            ))}
          </div>
        </div>

        {readinessOneLiner && (
          <p className="font-inter text-[#976568] text-sm italic max-w-[560px]">
            {readinessOneLiner}
          </p>
        )}

        <PrimaryCTA scrollId="waitlist">{dict.hero.ctaB2C}</PrimaryCTA>
      </SectionContainer>
    </PageSection>
  );
}

function CalendarSection({ dict }: { dict: Dict }) {
  return (
    <PageSection bgColor={colors.bg}>
      <SectionContainer>
        <div className="h-px w-full bg-[#462324]/10 mb-8 md:mb-10" aria-hidden />
        <Prose>
          <SectionFadeIn>
            <h2 className={cn(typography.h2.mobile, "font-inter font-semibold text-[#462324] mb-4 md:mb-6")}>
              {dict.calendar.heading}
            </h2>
            <p className={cn(typography.body.mobile, "font-inter font-normal text-[#976568] leading-relaxed")}>
              {dict.calendar.body}
            </p>
          </SectionFadeIn>
        </Prose>
      </SectionContainer>
    </PageSection>
  );
}

function OptionalBodySection({ dict }: { dict: Dict }) {
  return (
    <PageSection bgColor={colors.bgAlt}>
      <SectionContainer>
        <SectionFadeIn className="max-w-[560px]">
          <h2 className={cn(typography.h2.mobile, "font-inter font-semibold text-[#462324] mb-4 md:mb-6")}>
            {dict.optionalBody.heading}
          </h2>
          <p className={cn(typography.body.mobile, "font-inter font-normal text-[#976568] mb-3 leading-relaxed")}>
            {dict.optionalBody.intro}
          </p>
          <ul className="list-disc list-inside space-y-2 text-[#976568] font-inter mb-4">
            {dict.optionalBody.items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
          <p className={cn(typography.body.mobile, "font-inter font-normal text-[#976568] italic leading-relaxed")}>
            {dict.optionalBody.footer}
          </p>
        </SectionFadeIn>
      </SectionContainer>
    </PageSection>
  );
}

/** For you + cykel/livsfaser – one section: citat (kvinna/man) + intro + chips */
function ChapterForYouAndHealthSection({ dict }: { dict: Dict }) {
  const chapters = (dict as { chapterHeadings?: { how: string; forYou: string; choose: string } }).chapterHeadings;
  const womenHealth = (dict as { womenHealth?: { heading: string; intro: string; items: { title: string }[] } }).womenHealth;
  const forYouLabel = chapters?.forYou ?? dict.forEveryone?.heading ?? "För dig";

  return (
    <PageSection bgColor={colors.bg}>
      <SectionContainer maxWidth="680px" className="space-y-10 md:space-y-12">
        <SectionLabel>{forYouLabel}</SectionLabel>

        {/* Citat: Som kvinna | Som man */}
        {dict.whoIsItFor && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <motion.blockquote
              className="rounded-xl border border-[#462324]/12 bg-[#FFFBF7] p-5 md:p-6"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-xs font-inter font-semibold uppercase tracking-wide text-[#D96D46] mb-2">Som kvinna</p>
              <p className="font-inter text-[#462324] leading-relaxed text-lg">{dict.whoIsItFor.asWoman}</p>
            </motion.blockquote>
            <motion.blockquote
              className="rounded-xl border border-[#462324]/12 bg-[#FFFBF7] p-5 md:p-6"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
            >
              <p className="text-xs font-inter font-semibold uppercase tracking-wide text-[#D96D46] mb-2">Som man</p>
              <p className="font-inter text-[#462324] leading-relaxed text-lg">{dict.whoIsItFor.asMan}</p>
            </motion.blockquote>
          </div>
        )}

        {/* Cykel och livsfaser: en rad intro + chips */}
        {womenHealth?.items?.length ? (
          <SectionFadeIn>
            {womenHealth.intro && (
              <p className="font-inter text-[#976568] leading-relaxed mb-4 max-w-[560px]">
                {womenHealth.intro}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {womenHealth.items.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#462324]/08 text-[#462324] font-inter text-sm"
                >
                  {item.title}
                </span>
              ))}
            </div>
          </SectionFadeIn>
        ) : null}

        {/* En rad: valfritt stöd / för alla */}
        {(dict.forEveryone?.footer ?? dict.forEveryone?.body) && (
          <p className="font-inter text-sm text-[#976568] italic">
            {dict.forEveryone.footer ?? dict.forEveryone.body}
          </p>
        )}
      </SectionContainer>
    </PageSection>
  );
}

/** Full-bleed dark strip: one line + CTA */
function DarkCTAStrip({ dict }: { dict: Dict }) {
  return (
    <section
      className="relative py-16 md:py-20 bg-[#462324] overflow-hidden"
      aria-label="Call to action"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#D96D46]/10 via-transparent to-[#462324]" aria-hidden />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} aria-hidden />
      <div className="relative mx-auto max-w-[1040px] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 text-center">
        <motion.p
          className="text-xl md:text-2xl font-inter font-bold text-[#EDE8E6] mb-6"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          {dict.waitlist.heading}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <PrimaryCTA scrollId="waitlist">{dict.hero.ctaB2C}</PrimaryCTA>
        </motion.div>
      </div>
    </section>
  );
}

/** Chapter: Choose path – two equal cards B2C | B2B */
function ChapterChooseSection({ dict }: { dict: Dict }) {
  const chapters = (dict as { chapterHeadings?: { how: string; forYou: string; choose: string } }).chapterHeadings;
  const bullets = dict.b2bBlock.bullets ?? [];
  return (
    <PageSection bgColor={colors.bg} id="b2c">
      <SectionContainer>
        <SectionLabel>{chapters?.choose ?? dict.b2bBlock.heading}</SectionLabel>
        <ChapterHeading>{chapters?.choose ?? dict.b2bBlock.heading}</ChapterHeading>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <motion.div
            className="rounded-xl border border-[#462324]/15 bg-[#FFFBF7] p-6 md:p-8 flex flex-col"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h3 className="text-xl font-inter font-bold text-[#462324] mb-4">
              {dict.b2cBlock.heading}
            </h3>
            <p className="font-inter text-[#976568] leading-relaxed flex-1">
              {dict.b2cBlock.plans}
            </p>
            <p className="font-inter text-sm text-[#976568] mt-3 mb-6">
              {dict.b2cBlock.ctaSubtext}
            </p>
            <PrimaryCTA scrollId="waitlist">{dict.b2cBlock.cta}</PrimaryCTA>
          </motion.div>

          <motion.div
            id="b2b"
            className="rounded-xl bg-[#462324] p-6 md:p-8 flex flex-col scroll-mt-20"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.08 }}
          >
            <h3 className="text-xl font-inter font-bold text-[#EDE8E6] mb-4">
              {dict.b2bBlock.heading}
            </h3>
            <ul className="space-y-3 mb-6 flex-1 text-[#EDE8E6] font-inter">
              {bullets.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#D96D46] flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <a
              href={`mailto:${dict.footer.contactEmail}?subject=JOMOA%20–%20företag`}
              className={cn(
                "inline-flex rounded-lg font-inter font-semibold text-white bg-[#D96D46] px-6 py-3.5 w-full sm:w-auto justify-center",
                "hover:bg-[#C45D36] transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] hover:shadow-lg"
              )}
            >
              {dict.b2bBlock.cta}
            </a>
          </motion.div>
        </div>
      </SectionContainer>
    </PageSection>
  );
}

function ChapterCloseSection({ dict, locale }: { dict: Dict; locale: "en" | "sv" }) {
  const faq = dict.faq as { q1: string; a1: string; q2: string; a2: string; q3: string; a3: string; q4?: string; a4?: string };
  const qa = [
    { q: faq.q1, a: faq.a1 },
    { q: faq.q2, a: faq.a2 },
    { q: faq.q3, a: faq.a3 },
    ...(faq.q4 && faq.a4 ? [{ q: faq.q4, a: faq.a4 }] : []),
  ];
  return (
    <PageSection id="waitlist" className="scroll-mt-20 sm:scroll-mt-24" bgColor="#F2E8E6">
      <SectionContainer className="space-y-16 md:space-y-20">
        <SectionFadeIn>
          <Prose className="space-y-6">
            <h2 className={cn("text-2xl font-inter font-bold text-[#462324]")}>
              {dict.faq.heading}
            </h2>
            <motion.dl
              className="space-y-6"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            >
              {qa.map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                  whileHover={{ x: 4 }}
                  className="border-b border-[#462324]/15 pb-4 cursor-default"
                >
                  <dt className="font-inter font-semibold text-[#462324] mb-1">{item.q}</dt>
                  <dd className="font-inter text-[#462324]/90 leading-relaxed">{item.a}</dd>
                </motion.div>
              ))}
            </motion.dl>
          </Prose>
        </SectionFadeIn>

        <BlockDivider />

        <SectionFadeIn>
          <div className="max-w-[560px] mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-inter font-bold text-[#462324]">
                {dict.waitlist.heading}
              </h2>
              <p className="font-inter text-[#462324]/90 leading-relaxed">
                {dict.waitlist.intro}
              </p>
            </div>
            <motion.div
              className="rounded-lg border border-[#462324]/15 bg-[#FFFBF7] p-6 md:p-8 shadow-sm"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              whileHover={{ boxShadow: "0 12px 40px -12px rgba(70,35,36,0.15)" }}
            >
              <h3 className="text-lg font-inter font-semibold text-[#462324] mb-4 text-center">
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
              <p className="font-inter text-sm text-center text-[#6b3a3b] mt-4">
                {dict.waitlist.trust}
              </p>
            )}
          </div>
        </SectionFadeIn>
      </SectionContainer>
    </PageSection>
  );
}

function FeaturesSection({ dict }: { dict: Dict }) {
  return (
    <PageSection id="features" bgColor={colors.bg}>
      <SectionContainer>
        <h2 className={cn(typography.h2.mobile, "font-inter font-semibold text-[#462324] mb-10 md:mb-14")}>
          {dict.features.heading}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {dict.features.items.map((feature, idx) => {
            const Icon = iconMap[feature.icon] || Calendar;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="flex flex-col bg-white border border-[#462324]/10 rounded-xl p-5 md:p-6 space-y-3"
              >
                <Icon className="h-5 w-5 text-[#D96D46] [&>path]:stroke-[1.5]" />
                <h3 className={cn(typography.h3.mobile, "font-inter font-semibold text-[#462324]")}>
                  {feature.title}
                </h3>
                <p className={cn(typography.body.mobile, "font-inter font-normal text-[#976568] leading-relaxed max-w-[320px]")}>
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <PrimaryCTA scrollId="waitlist">{dict.hero.ctaB2C}</PrimaryCTA>
        </div>
      </SectionContainer>
    </PageSection>
  );
}

function WaitlistSection({ dict, locale }: { dict: Dict; locale: "en" | "sv" }) {
  return (
    <PageSection id="waitlist" bgColor={colors.bgAlt} className="scroll-mt-20 sm:scroll-mt-24">
      <SectionContainer maxWidth="560px" className="space-y-8 sm:space-y-10 md:space-y-12">
        <div className="h-px w-full bg-[#462324]/15 mb-8 sm:mb-10 md:mb-12" aria-hidden />
        <SectionFadeIn>
          <div className="space-y-3 sm:space-y-4 text-center mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto">
            <h2 className={cn(typography.h2.mobile, "font-inter font-semibold text-[#462324] mb-6 sm:mb-8 md:mb-10")}>
              {dict.waitlist.heading}
            </h2>
            <p className={cn(typography.body.mobile, "font-inter font-normal text-[#976568] leading-relaxed")}>
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
              className="rounded-xl sm:rounded-2xl bg-white border border-[#462324]/10 p-5 sm:p-6 md:p-7 lg:p-8 shadow-sm hover:shadow-lg hover:border-[#D96D46]/30 transition-all duration-300 space-y-3 sm:space-y-4 group"
            >
              <h3 className="text-base sm:text-lg md:text-xl font-inter text-[#462324] mb-3 sm:mb-4 text-center group-hover:text-[#D96D46] transition-colors">
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
              <p className={cn(typography.small.mobile, "font-inter font-normal text-center opacity-80 text-[#976568] leading-relaxed")}>
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
      <HeroSection dict={dict} />
      <ValueSection dict={dict} />
      <AccentBand />
      <ChapterHowSection dict={dict} />
      <DarkCTAStrip dict={dict} />
      <ChapterForYouAndHealthSection dict={dict} />
      <AccentBand />
      <ChapterChooseSection dict={dict} />
      <ChapterCloseSection dict={dict} locale={locale} />
      <Footer dict={dict} locale={locale} />
    </div>
  );
}
