"use client";

import WaitlistForm from "@/components/WaitlistForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  ChevronRight, 
  Check,
  Calendar,
  Heart,
  Activity,
  Shield,
  Baby,
  TrendingUp,
  Utensils,
  Brain,
  Waves,
  Target,
  Zap,
  ShieldCheck,
  TrendingDown
} from "lucide-react";
import Header from "@/components/Header";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerChildren = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  calendar: Calendar,
  heart: Heart,
  activity: Activity,
  shield: Shield,
  baby: Baby,
  "trending-up": TrendingUp,
  utensils: Utensils,
  brain: Brain,
  waves: Waves,
  target: Target,
  zap: Zap,
  "shield-check": ShieldCheck,
  "trending-down": TrendingDown,
};

type Dict = Awaited<ReturnType<typeof import("@/lib/i18n/getDictionary").getDictionary>>;

type Props = {
  dict: Dict;
  locale: "en" | "sv";
};

export default function HomeClient({ dict, locale }: Props) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-soft-pink">
      {/* HEADER */}
      <Header locale={locale} />

      {/* HERO SECTION - Soft Light Pink with wave-form */}
      <section className="relative overflow-hidden bg-soft-pink py-24 lg:py-32">
        {/* Organic wave-form background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute bottom-0 w-full h-64" viewBox="0 0 1200 400" preserveAspectRatio="none">
            <path
              d="M0,200 Q300,100 600,200 T1200,200 L1200,400 L0,400 Z"
              fill="#976568"
              fillOpacity="0.1"
              style={{ animation: "wave 8s ease-in-out infinite" }}
            />
          </svg>
        </div>
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerChildren}
            className="text-center space-y-8"
          >
            <motion.h1
              variants={fadeInUp}
              className="text-5xl sm:text-6xl lg:text-7xl font-the-seasons font-semibold text-plum leading-[1.15]"
            >
              {dict.hero.h1}
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-xl sm:text-2xl leading-[1.25] text-plum max-w-3xl mx-auto font-league-spartan font-normal"
            >
              {dict.hero.subheadline}
            </motion.p>
            <motion.p
              variants={fadeInUp}
              className="text-lg leading-[1.25] text-[#4E4A48] max-w-2xl mx-auto font-league-spartan font-normal"
            >
              {dict.hero.body}
            </motion.p>
            <motion.div variants={fadeInUp} className="pt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                className={cn(
                  "group relative rounded-[24px] h-16 px-12 text-lg font-league-spartan font-semibold",
                  "bg-terracotta hover:bg-terracotta/95 text-white",
                  "transition-all duration-300 ease-out",
                  "shadow-[0_4px_20px_rgba(217,109,70,0.3)] hover:shadow-[0_8px_40px_rgba(217,109,70,0.4)]",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  "overflow-hidden"
                )}
              >
                <a 
                  href="#waitlist" 
                  className="inline-flex items-center gap-3 relative z-10"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  <span>👉 {dict.hero.cta}</span>
                  <ChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  <div className="absolute inset-0 bg-gradient-to-r from-terracotta-light/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className={cn(
                  "group rounded-[24px] h-16 px-12 text-lg font-league-spartan font-semibold",
                  "border-2 border-mauve text-mauve hover:bg-mauve/10 hover:border-mauve-dark",
                  "transition-all duration-300 ease-out",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  "bg-white/50 backdrop-blur-sm"
                )}
              >
                <a 
                  href="#value" 
                  className="inline-flex items-center gap-2"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('value')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  {dict.hero.ctaSecondary}
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* VALUE SECTION - Sand 10% opacity */}
      <section id="value" className="bg-sand/10 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-league-spartan font-semibold text-plum leading-[1.15] mb-8 whitespace-pre-line"
            >
              {dict.value.heading}
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg leading-[1.25] text-[#4E4A48] mb-4 font-league-spartan font-normal"
            >
              {dict.value.body1}
            </motion.p>
            <motion.p
              variants={fadeInUp}
              className="text-lg leading-[1.25] text-[#4E4A48] mb-8 font-league-spartan font-normal"
            >
              {dict.value.body2}
            </motion.p>
            <motion.p
              variants={fadeInUp}
              className="text-lg leading-[1.25] text-[#4E4A48] mb-12 font-league-spartan font-normal whitespace-pre-line"
            >
              {dict.value.body3}
            </motion.p>
            
            {/* 4 icon cards in terracotta */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {dict.value.benefits.map((benefit, idx) => {
                const icons = [Target, ShieldCheck, Zap, TrendingUp];
                const Icon = icons[idx] || Target;
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.05, y: -4 }}
                    className="group relative bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-full p-6 border border-pink-light/50 text-center transition-all duration-300 hover:shadow-warm hover:border-terracotta/30 overflow-hidden aspect-square flex flex-col items-center justify-center"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-terracotta/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Icon className="h-8 w-8 text-terracotta mb-3 relative z-10" />
                    <p className="text-sm font-league-spartan font-semibold text-plum relative z-10">
                      {benefit}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* INSIGHTS BLOCK - Plum text on Soft Pink */}
      <section className="bg-soft-pink py-20 relative overflow-hidden">
        {/* Small graphic waves in background */}
        <div className="absolute inset-0 opacity-5">
          <svg className="absolute top-10 left-10 w-32 h-32" viewBox="0 0 100 100">
            <path d="M0,50 Q25,20 50,50 T100,50" stroke="#462324" strokeWidth="2" fill="none" />
          </svg>
          <svg className="absolute bottom-20 right-20 w-40 h-40" viewBox="0 0 100 100">
            <path d="M0,50 Q25,80 50,50 T100,50" stroke="#462324" strokeWidth="2" fill="none" />
          </svg>
        </div>
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-league-spartan font-semibold text-plum leading-[1.15] mb-6"
            >
              {dict.insights.heading}
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl leading-[1.25] text-plum mb-8 font-league-spartan font-semibold whitespace-pre-line"
            >
              {dict.insights.subheading}
            </motion.p>
            
            <motion.ul
              variants={fadeInUp}
              className="space-y-4"
            >
              {dict.insights.items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-4 text-lg text-plum leading-[1.25] font-league-spartan font-normal">
                  <Check className="h-6 w-6 text-mauve mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </section>

      {/* PHASES & CONDITIONS - Dusty Mauve 10% */}
      <section className="bg-mauve-dark/10 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-league-spartan font-semibold text-plum leading-[1.15] mb-6"
            >
              {dict.phases.heading}
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg leading-[1.25] text-[#4E4A48] mb-4 font-league-spartan font-normal"
            >
              {dict.phases.body1}
            </motion.p>
            <motion.p
              variants={fadeInUp}
              className="text-lg leading-[1.25] text-[#4E4A48] mb-8 font-league-spartan font-normal"
            >
              {dict.phases.body2}
            </motion.p>
            <motion.p
              variants={fadeInUp}
              className="text-lg leading-[1.25] text-plum mb-8 font-league-spartan font-semibold"
            >
              {dict.phases.subheading}
            </motion.p>
            
            <div className="grid sm:grid-cols-2 gap-8">
              {/* Left column - text list */}
              <motion.ul
                variants={fadeInUp}
                className="space-y-4"
              >
                {dict.phases.items.map((item, idx) => {
                  const Icon = iconMap[item.icon] || Calendar;
                  return (
                    <li key={idx} className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-plum/5">
                        <Icon className="h-5 w-5 text-plum/60" />
                      </div>
                      <span className="text-lg text-[#4E4A48] leading-[1.25] font-league-spartan font-normal flex-1">
                        {item.title}
                      </span>
                    </li>
                  );
                })}
              </motion.ul>
              
              {/* Right column - insight cards */}
              <motion.div
                variants={fadeInUp}
                className="space-y-4"
              >
                <Card className="rounded-[24px] bg-white/80 backdrop-blur-sm border border-pink-light/50 p-6">
                  <CardContent className="p-0">
                    <p className="text-base font-league-spartan font-medium text-plum leading-relaxed">
                      {dict.phases.footer1}
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-[24px] bg-white/80 backdrop-blur-sm border border-pink-light/50 p-6">
                  <CardContent className="p-0">
                    <p className="text-base font-league-spartan font-medium text-plum leading-relaxed">
                      {dict.phases.footer2}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* DATA + HUMAN - Sand */}
      <section className="bg-sand/20 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-league-spartan font-semibold text-plum leading-[1.15] mb-6"
            >
              {dict.data.heading}
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg leading-[1.25] text-[#4E4A48] mb-6 font-league-spartan font-normal"
            >
              {dict.data.body}
            </motion.p>
            
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap gap-3 mb-8"
            >
              {dict.data.patterns.map((pattern, idx) => (
                <motion.span
                  key={idx}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="group px-5 py-2.5 bg-gradient-to-br from-terracotta/15 to-terracotta/10 text-terracotta rounded-full text-base font-league-spartan font-medium border border-terracotta/20 hover:border-terracotta/40 transition-all duration-300 cursor-default"
                >
                  {pattern}
                </motion.span>
              ))}
            </motion.div>
            
            <motion.p
              variants={fadeInUp}
              className="text-lg leading-[1.25] text-[#4E4A48] mb-8 font-league-spartan font-normal"
            >
              {dict.data.insight}
            </motion.p>
            
            {/* Microchart */}
            <motion.div
              variants={fadeInUp}
              className="mb-8 bg-white/60 rounded-[24px] p-6 border border-pink-light/50"
            >
              <div className="h-32 flex items-end justify-center gap-2">
                {[40, 60, 45, 70, 55, 80, 65].map((height, idx) => (
                  <div
                    key={idx}
                    className="w-8 bg-gradient-to-t from-terracotta to-terracotta-light rounded-t-lg transition-all duration-300 hover:opacity-80"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </motion.div>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <motion.div 
                variants={fadeInUp} 
                whileHover={{ scale: 1.02, y: -4 }}
                className="group bg-gradient-to-br from-soft-pink to-white/80 rounded-[28px] p-8 border border-pink-light/50 hover:border-terracotta/30 hover:shadow-warm transition-all duration-300"
              >
                <p className="text-lg font-league-spartan font-medium text-plum mb-3">För klienten:</p>
                <p className="text-xl font-league-spartan font-semibold text-terracotta italic leading-relaxed">
                  {dict.data.client}
                </p>
              </motion.div>
              <motion.div 
                variants={fadeInUp} 
                whileHover={{ scale: 1.02, y: -4 }}
                className="group bg-gradient-to-br from-soft-pink to-white/80 rounded-[28px] p-8 border border-pink-light/50 hover:border-terracotta/30 hover:shadow-warm transition-all duration-300"
              >
                <p className="text-lg font-league-spartan font-medium text-plum mb-3">För coachen:</p>
                <p className="text-xl font-league-spartan font-semibold text-terracotta italic leading-relaxed">
                  {dict.data.coach}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES BLOCK - Soft Pink, icon color Terracotta/Mauve */}
      <section className="bg-soft-pink py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-league-spartan font-semibold text-plum leading-[1.15] mb-12 text-center"
            >
              {dict.features.heading}
            </motion.h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {dict.features.items.map((feature, idx) => {
                const Icon = iconMap[feature.icon] || Calendar;
                const iconColors = ["terracotta", "mauve", "terracotta", "mauve", "terracotta"];
                const iconColor = iconColors[idx % iconColors.length];
                return (
                  <motion.div 
                    key={idx} 
                    variants={fadeInUp}
                    whileHover={{ scale: 1.02, y: -4 }}
                  >
                    <Card className="group rounded-[28px] bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border border-pink-light/50 h-full hover:shadow-warm hover:border-terracotta/30 transition-all duration-300 overflow-hidden">
                      <CardContent className="p-6">
                        <div className="space-y-4 relative z-10">
                          <div className={cn(
                            "p-3 rounded-xl bg-gradient-to-br w-fit",
                            iconColor === "terracotta" ? "from-terracotta/15 to-terracotta/5" : "from-mauve/15 to-mauve/5"
                          )}>
                            <Icon className={cn("h-6 w-6", iconColor === "terracotta" ? "text-terracotta" : "text-mauve")} />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-xl font-league-spartan font-semibold text-plum leading-[1.15]">
                              {idx + 1}. {feature.title}
                            </h3>
                            <p className="text-base leading-[1.25] text-[#4E4A48] font-league-spartan font-normal">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-terracotta/0 to-terracotta/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* EDGE FOR WOMEN - Sand with plum text */}
      <section className="bg-sand/20 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-league-spartan font-semibold text-plum leading-[1.15] mb-6 whitespace-pre-line"
            >
              {dict.edge.heading}
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg leading-[1.25] text-[#4E4A48] mb-8 font-league-spartan font-normal"
            >
              {dict.edge.body}
            </motion.p>
            
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
            >
              {dict.edge.clients.map((client, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="group relative bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-[24px] p-5 border border-pink-light/50 text-center transition-all duration-300 hover:shadow-soft hover:border-mauve/40 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-mauve/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <p className="text-base font-league-spartan font-medium text-plum relative z-10">
                    {client}
                  </p>
                </motion.div>
              ))}
            </motion.div>
            
            <motion.p
              variants={fadeInUp}
              className="text-lg leading-[1.25] text-[#4E4A48] font-league-spartan font-normal"
            >
              {dict.edge.footer}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* STEPS - Terracotta accents on Soft Pink, vertical timeline */}
      <section className="bg-soft-pink py-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-league-spartan font-semibold text-plum leading-[1.15] mb-12 text-center"
            >
              {dict.steps.heading}
            </motion.h2>
            
            <div className="relative">
              {/* Wavy timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 2 300" preserveAspectRatio="none">
                  <path
                    d="M1,0 Q1,50 1,100 T1,200 T1,300"
                    stroke="#BA8E90"
                    strokeWidth="2"
                    fill="none"
                    className="opacity-30"
                  />
                </svg>
              </div>
              
              <div className="space-y-12">
                {dict.steps.items.map((step, idx) => (
                  <motion.div
                    key={idx}
                    variants={fadeInUp}
                    className="relative pl-20"
                  >
                    <div className="absolute left-0 top-0 w-16 h-16 rounded-full bg-gradient-to-br from-terracotta to-terracotta-light text-white text-xl font-league-spartan font-bold shadow-lg flex items-center justify-center">
                      {idx + 1}
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-[28px] p-6 border border-pink-light/50 hover:shadow-warm transition-all duration-300">
                      <h3 className="text-xl font-league-spartan font-semibold text-plum leading-[1.15] mb-3">
                        {step.title}
                      </h3>
                      <p className="text-base leading-[1.25] text-[#4E4A48] font-league-spartan font-normal">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* BIG CTA - Plum with light sand elements */}
      <section className="bg-plum py-24 relative overflow-hidden">
        {/* Organic background wave */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <svg className="absolute bottom-0 w-full h-48" viewBox="0 0 1200 200" preserveAspectRatio="none">
            <path
              d="M0,100 Q300,50 600,100 T1200,100 L1200,200 L0,200 Z"
              fill="#FEE7AB"
            />
          </svg>
        </div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
          >
            <motion.h1
              variants={fadeInUp}
              className="text-5xl sm:text-6xl lg:text-7xl font-the-seasons font-semibold text-sand leading-[1.15] mb-6"
            >
              {dict.ctaFooter.h1}
            </motion.h1>
            <motion.h2
              variants={fadeInUp}
              className="text-2xl sm:text-3xl font-league-spartan font-semibold text-white leading-[1.15] mb-8"
            >
              {dict.ctaFooter.h2}
            </motion.h2>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button
                asChild
                className={cn(
                  "group relative rounded-[24px] h-16 px-12 text-lg font-league-spartan font-semibold",
                  "bg-terracotta hover:bg-terracotta/95 text-white",
                  "transition-all duration-300 ease-out",
                  "shadow-[0_4px_20px_rgba(217,109,70,0.4)] hover:shadow-[0_8px_40px_rgba(217,109,70,0.5)]",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  "overflow-hidden"
                )}
              >
                <a 
                  href="#waitlist" 
                  className="inline-flex items-center gap-3 relative z-10"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  <span>👉 {dict.ctaFooter.cta}</span>
                  <ChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className={cn(
                  "rounded-[24px] h-16 px-12 text-lg font-league-spartan font-semibold",
                  "border-2 border-sand text-sand hover:bg-sand/10",
                  "transition-all duration-300 ease-out",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  "bg-plum/20 backdrop-blur-sm"
                )}
              >
                <a href="#waitlist" className="inline-flex items-center gap-2">
                  {dict.ctaFooter.ctaSecondary}
                </a>
              </Button>
            </motion.div>
            <motion.p
              variants={fadeInUp}
              className="text-base text-sand/80 font-league-spartan font-normal"
            >
              {dict.ctaFooter.placeholder}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* WAITLIST SECTION */}
      <section id="waitlist" className="bg-soft-pink py-20 scroll-mt-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
            className="max-w-xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="text-center mb-8 space-y-3">
              <h2 className="text-3xl font-league-spartan font-semibold text-plum sm:text-4xl leading-[1.15]">
                {dict.waitlist.heading}
              </h2>
              <p className="text-lg text-[#4E4A48] leading-[1.25] font-league-spartan font-normal">
                {dict.waitlist.intro}
              </p>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <div
                className={cn(
                  "rounded-[24px] shadow-soft bg-white/80 backdrop-blur-sm",
                  "border border-pink-light",
                  "p-8",
                  "hover:shadow-warm transition-all duration-300",
                  "hover:border-terracotta/20"
                )}
              >
                <WaitlistForm
                  locale={locale}
                  labels={{
                    title: dict.waitlist.form.title,
                    description: dict.waitlist.form.description,
                    placeholder: dict.ctaFooter.placeholder,
                    buttonIdle: dict.waitlist.form.buttonIdle,
                    buttonLoading: dict.waitlist.form.buttonLoading,
                    success: dict.waitlist.form.success,
                    duplicateError: dict.waitlist.form.duplicateError,
                    genericError: dict.waitlist.form.genericError,
                    validationError: dict.waitlist.form.validationError,
                    emptyError: dict.waitlist.form.emptyError,
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER - Soft Pink */}
      <footer className="bg-soft-pink border-t border-pink-light py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <p className="text-sm text-mauve font-league-spartan font-normal max-w-2xl">
              {dict.footer.research}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-mauve font-league-spartan font-normal">
              <p>© {currentYear} {dict.footer.copyright}</p>
              <span>•</span>
              <a href="#" className="hover:text-plum transition-colors">{dict.footer.links.privacy}</a>
              <span>•</span>
              <a href="#" className="hover:text-plum transition-colors">{dict.footer.links.contact}</a>
            </div>
            <p className="text-xs text-mauve/80 font-league-spartan font-normal max-w-md">
              {dict.footer.privacy}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
