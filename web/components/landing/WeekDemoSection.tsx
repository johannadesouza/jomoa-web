"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import DecisionCards from "./DecisionCards";
import PhoneMockup from "./PhoneMockup";
import type { DecisionCardType } from "./DecisionCards";

export type WeekDemoDict = {
  title: string;
  chooseDayLabel?: string;
  appSuggestsLabel?: string;
  badgeLabel?: string;
  defaultLine: string;
  days: { day: string; entry: string }[];
  increase: string;
  hold: string;
  adjust: string;
};

type WeekDemoSectionProps = {
  dict: WeekDemoDict;
  className?: string;
};

/** Map day index to which decision applies (from current copy: Mon=Hold, Wed=Adjust, Fri=Increase) */
const DAY_DECISION: DecisionCardType[] = ["hold", "adjust", "increase"];

export default function WeekDemoSection({ dict, className }: WeekDemoSectionProps) {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const activeDay = dict.days[activeDayIndex];
  const activeDecision = DAY_DECISION[activeDayIndex] ?? "hold";

  return (
    <section
      className={cn(
        "py-20 md:py-28 lg:py-36 bg-[#FFFBF7] flex flex-col justify-center",
        "lg:min-h-[90vh]",
        className
      )}
    >
      <div className="mx-auto max-w-5xl w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-inter font-bold text-[#462324] mb-10 md:mb-12 lg:mb-14"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          {dict.title}
        </motion.h2>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 xl:gap-16 items-center lg:items-stretch">
          <div className="flex-1 min-w-0 w-full order-2 lg:order-1">
            {dict.chooseDayLabel && (
              <p className="text-xs font-inter font-semibold uppercase tracking-wide text-[#976568] mb-3">
                {dict.chooseDayLabel}
              </p>
            )}
            <div className="flex gap-2 mb-6" role="tablist" aria-label={dict.chooseDayLabel ?? "Välj veckodag"}>
              {dict.days.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={activeDayIndex === i}
                  aria-controls={`week-day-panel-${i}`}
                  id={`week-day-tab-${i}`}
                  onClick={() => setActiveDayIndex(i)}
                  className={cn(
                    "flex-1 sm:flex-none px-4 py-3 rounded-lg font-inter font-semibold text-sm uppercase tracking-wide transition-all",
                    activeDayIndex === i
                      ? "bg-[#462324] text-[#EDE8E6] shadow-md"
                      : "bg-[#462324]/10 text-[#462324] hover:bg-[#462324]/20"
                  )}
                >
                  {d.day}
                </button>
              ))}
            </div>
            <div
              id={`week-day-panel-${activeDayIndex}`}
              role="tabpanel"
              aria-labelledby={`week-day-tab-${activeDayIndex}`}
              className="rounded-xl border-2 border-[#462324]/15 bg-[#FFF5F0] p-6 md:p-8 min-h-[140px] shadow-sm"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeDayIndex}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="font-inter text-[#462324] leading-relaxed text-lg">
                    {activeDay?.entry}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
            <p className="mt-4 text-xs font-inter text-[#976568] leading-relaxed">
              {dict.defaultLine}
            </p>
          </div>

          <div className="order-1 lg:order-2 flex flex-col items-center gap-6 lg:w-[320px] xl:w-[340px] flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="relative scale-90 origin-top sm:scale-100"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <PhoneMockup src={null} alt="JOMOA dagens beslut" height={280} />
                {dict.badgeLabel && (
                  <motion.span
                    className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full px-2.5 py-1 rounded-md bg-[#D96D46] text-white text-[10px] font-inter font-semibold whitespace-nowrap"
                    animate={{ opacity: [0.88, 1, 0.88] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {dict.badgeLabel}
                  </motion.span>
                )}
              </motion.div>
            </motion.div>
            <div className="w-full max-w-[280px] lg:max-w-none">
              {dict.appSuggestsLabel && (
                <p className="text-xs font-inter font-semibold uppercase tracking-wide text-[#D96D46] mb-3">
                  {dict.appSuggestsLabel}
                </p>
              )}
              <DecisionCards
                increaseLabel={dict.increase}
                holdLabel={dict.hold}
                adjustLabel={dict.adjust}
                activeType={activeDecision}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
