"use client";

import WaitlistForm from "@/components/WaitlistForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

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

type Dict = Awaited<ReturnType<typeof import("@/lib/i18n/getDictionary").getDictionary>>;

type Props = {
  dict: Dict;
  locale: "en" | "sv";
};

export default function HomeClient({ dict, locale }: Props) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-jomoa-bg">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          {/* Language Switcher */}
          <div className="flex justify-end mb-8 lg:mb-0 lg:absolute lg:top-8 lg:right-8">
            <LanguageSwitcher />
          </div>

          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerChildren}
              className="space-y-6"
            >
              <motion.p
                variants={fadeInUp}
                className="text-sm font-medium text-jomoa-muted uppercase tracking-wider"
              >
                {dict.hero.eyebrow}
              </motion.p>
              <motion.h1
                variants={fadeInUp}
                className="text-4xl font-bold leading-tight text-jomoa-text sm:text-5xl lg:text-6xl"
              >
                {dict.hero.h1}
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                className="text-lg leading-relaxed text-jomoa-text2 sm:text-xl"
              >
                {dict.hero.subheadline}
              </motion.p>
              <motion.div variants={fadeInUp}>
                <Button
                  asChild
                  className={cn(
                    "rounded-xl h-12 px-6",
                    "bg-jomoa-accent hover:bg-jomoa-accent2",
                    "text-white font-medium",
                    "transition-colors duration-200"
                  )}
                >
                  <a href="#waitlist" className="inline-flex items-center gap-2">
                    {dict.hero.cta}
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:pl-8"
            >
              <Card
                className={cn(
                  "rounded-2xl border-0 shadow-soft",
                  "bg-white/80 backdrop-blur-sm",
                  "p-6"
                )}
              >
                <p className="text-jomoa-text2 leading-relaxed">
                  {dict.hero.card}
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PROBLEM → SOLUTION SECTION */}
      <section className="bg-jomoa-bg2 py-20 lg:py-32">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
            className="grid gap-6 sm:grid-cols-2"
          >
            <motion.div variants={fadeInUp}>
              <Card
                className={cn(
                  "rounded-2xl border-0 shadow-soft",
                  "bg-white/80 backdrop-blur-sm",
                  "h-full"
                )}
              >
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-jomoa-text">
                    {dict.problemSolution.cardA.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-jomoa-text2 leading-relaxed">
                    {dict.problemSolution.cardA.body}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card
                className={cn(
                  "rounded-2xl border-0 shadow-soft",
                  "bg-white/80 backdrop-blur-sm",
                  "h-full"
                )}
              >
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-jomoa-text">
                    {dict.problemSolution.cardB.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-jomoa-text2 leading-relaxed">
                    {dict.problemSolution.cardB.body}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* BUILT FOR COACHES SECTION */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl font-bold text-jomoa-text mb-12 text-center sm:text-4xl"
            >
              {dict.builtForCoaches.h2}
            </motion.h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {dict.builtForCoaches.items.map((text, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card
                    className={cn(
                      "rounded-2xl border-0 shadow-soft",
                      "bg-white/80 backdrop-blur-sm",
                      "h-full"
                    )}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="mt-1.5 h-2 w-2 rounded-full bg-jomoa-accent flex-shrink-0" />
                        <p className="text-jomoa-text2 leading-relaxed text-sm sm:text-base">
                          {text}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="bg-jomoa-bg2 py-20 lg:py-32">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl font-bold text-jomoa-text mb-12 text-center sm:text-4xl"
            >
              {dict.howItWorks.h2}
            </motion.h2>

            <div className="grid gap-6 sm:grid-cols-3 mb-8">
              {dict.howItWorks.steps.map((title, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card
                    className={cn(
                      "rounded-2xl border-0 shadow-soft",
                      "bg-white/80 backdrop-blur-sm",
                      "h-full"
                    )}
                  >
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="text-2xl font-bold text-jomoa-accent">
                          {index + 1}
                        </div>
                        <p className="text-jomoa-text2 leading-relaxed">{title}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.p
              variants={fadeInUp}
              className="text-center text-jomoa-muted italic text-sm sm:text-base"
            >
              {dict.howItWorks.tagline}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* WAITLIST SECTION */}
      <section id="waitlist" className="py-20 lg:py-32">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
            className="max-w-2xl mx-auto"
          >
            <motion.p
              variants={fadeInUp}
              className="text-center text-jomoa-text2 mb-8 text-lg"
            >
              {dict.waitlist.intro}
            </motion.p>
            <motion.div variants={fadeInUp}>
              <WaitlistForm
                labels={{
                  title: dict.waitlist.form.title,
                  description: dict.waitlist.form.description,
                  placeholder: dict.waitlist.form.placeholder,
                  buttonIdle: dict.waitlist.form.buttonIdle,
                  buttonLoading: dict.waitlist.form.buttonLoading,
                  success: dict.waitlist.form.success,
                  duplicateError: dict.waitlist.form.duplicateError,
                  genericError: dict.waitlist.form.genericError,
                  validationError: dict.waitlist.form.validationError,
                  emptyError: dict.waitlist.form.emptyError,
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-jomoa-bg2 border-t border-jomoa-muted/20 py-12">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center gap-4 text-center text-sm text-jomoa-muted">
            <p>© {currentYear} {dict.footer.copyright}</p>
            <p className="max-w-md">{dict.footer.privacy}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

