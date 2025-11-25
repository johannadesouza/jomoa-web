"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type TabId = "coach" | "client" | "builder";

type DemoSectionProps = {
  dict: {
    heading: string;
    subtitle: string;
    tabs: {
      coach: string;
      client: string;
      builder: string;
    };
    previews: {
      coach: {
        title: string;
        body: string;
      };
      client: {
        title: string;
        body: string;
      };
      builder: {
        title: string;
        body: string;
      };
    };
  };
  compact?: boolean;
};

export default function DemoSection({ dict, compact = false }: DemoSectionProps) {
  const [activeTab, setActiveTab] = useState<TabId>("coach");

  const tabs: { id: TabId; label: string }[] = [
    { id: "coach", label: dict.tabs.coach },
    { id: "client", label: dict.tabs.client },
    { id: "builder", label: dict.tabs.builder },
  ];

  const getActivePreview = () => {
    switch (activeTab) {
      case "coach":
        return dict.previews.coach;
      case "client":
        return dict.previews.client;
      case "builder":
        return dict.previews.builder;
    }
  };

  const preview = getActivePreview();

  if (compact) {
    // Compact version for hero section
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-jomoa-text">
            {dict.heading}
          </h3>
          <p className="text-sm text-jomoa-text2 leading-relaxed">
            {dict.subtitle}
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                activeTab === tab.id
                  ? "bg-jomoa-accent text-white"
                  : "border border-jomoa-muted/30 bg-white/70 text-jomoa-text2 hover:bg-white hover:border-jomoa-muted/50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Preview Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={cn(
                "rounded-2xl shadow-soft bg-white/80 backdrop-blur-sm",
                "border border-jomoa-muted/10",
                "overflow-hidden"
              )}
            >
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-jomoa-text">
                    {preview.title}
                  </h4>
                  <p className="text-sm text-jomoa-text2 leading-relaxed">
                    {preview.body}
                  </p>
                </div>

                {/* Screenshot Area Placeholder */}
                <div
                  className={cn(
                    "rounded-xl overflow-hidden",
                    "bg-gradient-to-br from-jomoa-bg2 via-jomoa-bg to-jomoa-bg2",
                    "border border-jomoa-muted/20",
                    "aspect-video",
                    "flex items-center justify-center",
                    "relative"
                  )}
                >
                  <span className="text-jomoa-muted text-xs font-medium">
                    {preview.title} Preview
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Full version (original layout)
  return (
    <section className="bg-jomoa-bg py-20 lg:py-32">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-bold text-jomoa-text sm:text-4xl lg:text-5xl">
            {dict.heading}
          </h2>
          <p className="text-lg text-jomoa-text2 leading-relaxed max-w-2xl mx-auto">
            {dict.subtitle}
          </p>
        </div>

        {/* Tab Pills - Centered */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex gap-2 p-1.5 bg-white/70 rounded-full border border-jomoa-muted/20 shadow-soft backdrop-blur-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-jomoa-accent text-white shadow-sm"
                    : "text-jomoa-text2 hover:text-jomoa-text hover:bg-white/50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preview Card - Full Width Centered */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <div
                className={cn(
                  "rounded-2xl shadow-soft bg-white/80 backdrop-blur-sm",
                  "border border-jomoa-muted/10",
                  "overflow-hidden"
                )}
              >
                {/* Preview Content */}
                <div className="p-8 lg:p-12 space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-2xl font-semibold text-jomoa-text">
                      {preview.title}
                    </h3>
                    <p className="text-lg text-jomoa-text2 leading-relaxed">
                      {preview.body}
                    </p>
                  </div>

                  {/* Screenshot Area Placeholder - Larger */}
                  <div
                    className={cn(
                      "rounded-xl overflow-hidden",
                      "bg-gradient-to-br from-jomoa-bg2 via-jomoa-bg to-jomoa-bg2",
                      "border border-jomoa-muted/20",
                      "aspect-[16/10]",
                      "flex items-center justify-center",
                      "relative group"
                    )}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-jomoa-accent/5" />
                    <span className="text-jomoa-muted text-base font-medium relative z-10">
                      {preview.title} Preview
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

