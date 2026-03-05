"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export type AppPlaceholderVariant = "calendar" | "checkin" | "workout" | "decision" | "insights" | "cycle";

export type ScreenshotItem = {
  src: string | null;
  alt: string;
  label?: string;
  variant?: AppPlaceholderVariant;
};

type ScreenshotTourSectionProps = {
  title: string;
  items: ScreenshotItem[];
  className?: string;
};

const DEVICE_FRAME_CLASS =
  "relative rounded-[2rem] border-[8px] border-[#462324] bg-[#462324] overflow-hidden shadow-lg";

function DeviceFrame({
  children,
  className,
  index = 0,
}: {
  children: React.ReactNode;
  className?: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ scale: 1.04, y: -4 }}
      className={cn(
        "aspect-[9/19] w-full max-w-[260px] mx-auto transition-shadow duration-300 hover:shadow-xl hover:shadow-[#462324]/15",
        DEVICE_FRAME_CLASS,
        className
      )}
    >
      <div className="absolute inset-1 overflow-hidden rounded-[1.25rem] bg-[#FFF5F0]">
        {children}
      </div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-[#462324] rounded-b-lg" />
    </motion.div>
  );
}

function PlaceholderCalendar() {
  return (
    <div className="flex h-full w-full flex-col p-3" style={{ background: "linear-gradient(180deg, #FFFBF7 0%, #FFF5F0 100%)" }}>
      <div className="h-6 rounded-lg bg-[#D96D46]/15 mb-3" />
      <div className="grid grid-cols-7 gap-0.5 text-[8px] font-medium text-[#976568] mb-2">
        {["M", "T", "O", "T", "F", "L", "S"].map((d, i) => (
          <div key={i} className="text-center py-0.5">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5 flex-1">
        {Array.from({ length: 28 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "rounded aspect-square flex items-center justify-center text-[9px]",
              i === 5 ? "bg-[#D96D46] text-white" : "bg-[#462324]/08 text-[#462324]/60"
            )}
          >
            {i < 3 ? "" : (i - 2) % 7 === 0 && i >= 10 ? "•" : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

function PlaceholderCheckin() {
  return (
    <div className="flex h-full w-full flex-col p-4" style={{ background: "linear-gradient(180deg, #FFFBF7 0%, #F0D6D7 100%)" }}>
      <div className="h-2 w-2/3 rounded-full bg-[#D96D46]/20 mb-4" />
      <div className="space-y-3 flex-1">
        <div className="h-8 rounded-lg border border-[#462324]/15 bg-white/80" />
        <div className="h-8 rounded-lg border border-[#462324]/15 bg-white/80" />
        <div className="h-10 rounded-full bg-[#D96D46]/20" />
      </div>
      <p className="text-[9px] text-[#976568] mt-2">Hur mår du idag?</p>
    </div>
  );
}

function PlaceholderWorkout() {
  return (
    <div className="flex h-full w-full flex-col p-4" style={{ background: "linear-gradient(180deg, #FFF5F0 0%, #F0D6D7 100%)" }}>
      <div className="h-3 w-1/2 rounded bg-[#462324]/15 mb-4" />
      <div className="flex gap-2 mb-3">
        <div className="flex-1 h-12 rounded-xl bg-[#462324]/10" />
        <div className="flex-1 h-12 rounded-xl bg-[#D96D46]/20 border border-[#D96D46]/30" />
      </div>
      <div className="h-2 w-full rounded bg-[#462324]/10" />
      <div className="h-2 w-4/5 rounded bg-[#462324]/10 mt-1" />
    </div>
  );
}

function PlaceholderDecision() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-4 gap-3" style={{ background: "linear-gradient(180deg, #FFFBF7 0%, #FFF5F0 100%)" }}>
      <div className="h-2 w-3/4 rounded-full bg-[#462324]/10" />
      <div className="flex flex-col gap-2 w-full max-w-[85%]">
        <div className="h-9 rounded-lg bg-[#462324]/10" />
        <div className="h-9 rounded-lg bg-[#D96D46]/25 border border-[#D96D46]/40" />
        <div className="h-9 rounded-lg bg-[#462324]/10" />
      </div>
      <p className="text-[9px] text-[#976568]">Öka · Behåll · Justera</p>
    </div>
  );
}

function PlaceholderInsights() {
  return (
    <div className="flex h-full w-full flex-col p-4" style={{ background: "linear-gradient(180deg, #FFFBF7 0%, #F0D6D7 100%)" }}>
      <div className="h-2 w-1/2 rounded bg-[#462324]/10 mb-4" />
      <div className="flex-1 rounded-lg bg-[#462324]/06 flex items-end justify-around pb-2 gap-1">
        {[40, 65, 45, 80, 55, 70].map((h, i) => (
          <div key={i} className="w-full rounded-t bg-[#D96D46]/30" style={{ height: `${h}%` }} />
        ))}
      </div>
      <p className="text-[9px] text-[#976568] mt-2 text-center">Insikter</p>
    </div>
  );
}

function PlaceholderCycle() {
  return (
    <div className="flex h-full w-full flex-col p-4 items-center justify-center" style={{ background: "linear-gradient(180deg, #FFF5F0 0%, #F0D6D7 100%)" }}>
      <div className="w-20 h-20 rounded-full border-2 border-[#D96D46]/40 border-dashed mb-3" />
      <div className="h-2 w-2/3 rounded-full bg-[#462324]/10 mb-2" />
      <div className="h-1.5 w-1/2 rounded bg-[#462324]/10" />
    </div>
  );
}

function PlaceholderSlide({ label, variant }: { label: string; variant?: AppPlaceholderVariant }) {
  const content = (() => {
    switch (variant) {
      case "calendar":
        return <PlaceholderCalendar />;
      case "checkin":
        return <PlaceholderCheckin />;
      case "workout":
        return <PlaceholderWorkout />;
      case "decision":
        return <PlaceholderDecision />;
      case "insights":
        return <PlaceholderInsights />;
      case "cycle":
        return <PlaceholderCycle />;
      default:
        return (
          <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center" style={{ background: "linear-gradient(180deg, #FFFBF7 0%, #F0D6D7 100%)" }}>
            <div className="h-2 w-2/3 rounded-full bg-[#D96D46]/20 mb-3" />
            <div className="space-y-2 w-full max-w-[80%]">
              <div className="h-1.5 w-full rounded bg-[#462324]/10" />
              <div className="h-1.5 w-4/5 rounded bg-[#462324]/10 mx-auto" />
            </div>
            <p className="mt-4 text-[10px] font-medium text-[#976568]">{label}</p>
          </div>
        );
    }
  })();
  return <div className="h-full w-full flex flex-col">{content}</div>;
}

export default function ScreenshotTourSection({
  title,
  items,
  className,
}: ScreenshotTourSectionProps) {
  return (
    <section className={cn("py-20 md:py-28 lg:py-36 bg-[#FFF5F0]", className)}>
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 max-w-[1600px] mx-auto">
        <motion.h2
          className="text-2xl sm:text-3xl font-inter font-bold text-[#462324] mb-12 md:mb-16 text-center"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          {title}
        </motion.h2>
        {/* Mobile/tablet: grid. Desktop: horizontal scroll carousel */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-8 lg:hidden">
          {items.map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <DeviceFrame index={i}>
                {item.src ? (
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={260}
                    height={520}
                    className="h-full w-full object-cover object-top"
                    unoptimized
                  />
                ) : (
                  <PlaceholderSlide label={item.label ?? item.alt} variant={item.variant} />
                )}
              </DeviceFrame>
              {item.label && (
                <p className="mt-3 text-xs font-inter font-medium text-[#976568] text-center">
                  {item.label}
                </p>
              )}
            </div>
          ))}
        </div>
        <div
          className={cn(
            "hidden lg:flex gap-8 md:gap-10 overflow-x-auto pb-4 -mx-4 px-4 md:-mx-8 md:px-8",
            "snap-x snap-mandatory scroll-smooth scrollbar-thin"
          )}
          style={{ scrollbarWidth: "thin" }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center flex-shrink-0 w-[280px] snap-center"
            >
              <DeviceFrame index={i}>
                {item.src ? (
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={260}
                    height={520}
                    className="h-full w-full object-cover object-top"
                    unoptimized
                  />
                ) : (
                  <PlaceholderSlide label={item.label ?? item.alt} variant={item.variant} />
                )}
              </DeviceFrame>
              {item.label && (
                <p className="mt-3 text-xs font-inter font-medium text-[#976568] text-center">
                  {item.label}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
