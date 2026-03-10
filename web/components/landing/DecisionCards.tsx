"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export type DecisionCardType = "increase" | "hold" | "adjust";

const styles: Record<DecisionCardType, { bg: string; border: string; label: string }> = {
  increase: {
    bg: "bg-[#F0FDF4]",
    border: "border-[#22C55E]/50",
    label: "text-[#166534]",
  },
  hold: {
    bg: "bg-[#FFFBF7]",
    border: "border-[#462324]/15",
    label: "text-[#462324]",
  },
  adjust: {
    bg: "bg-[#FFF5F0]",
    border: "border-[#D96D46]/50",
    label: "text-[#462324]",
  },
};

type DecisionCardsProps = {
  increaseLabel: string;
  holdLabel: string;
  adjustLabel: string;
  className?: string;
  /** When set, this card is visually highlighted (e.g. for day carousel) */
  activeType?: DecisionCardType;
};

export default function DecisionCards({
  increaseLabel,
  holdLabel,
  adjustLabel,
  className,
  activeType,
}: DecisionCardsProps) {
  const cards: { type: DecisionCardType; label: string }[] = [
    { type: "increase", label: increaseLabel },
    { type: "hold", label: holdLabel },
    { type: "adjust", label: adjustLabel },
  ];

  return (
    <motion.div
      className={cn("grid grid-cols-1 gap-3", className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.1 } },
      }}
    >
      {cards.map(({ type, label }) => {
        const s = styles[type];
        const isActive = activeType === type;
        return (
          <motion.div
            key={type}
            variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0 } }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            animate={{
              scale: isActive ? 1.02 : 1,
              boxShadow: isActive ? "0 4px 14px rgba(217, 109, 70, 0.2)" : "0 1px 3px rgba(0,0,0,0.06)",
            }}
            whileHover={{ scale: isActive ? 1.03 : 1.02, x: 4 }}
            className={cn(
              "rounded-lg border px-4 py-3 font-inter font-semibold cursor-default",
              isActive && "ring-2 ring-[#D96D46] ring-offset-2 ring-offset-[#FFFBF7]",
              s.bg,
              s.border,
              s.label
            )}
          >
            {label}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
