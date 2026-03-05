"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

const ASPECT = 9 / 19;
const DEFAULT_HEIGHT = 520;

type PhoneMockupProps = {
  src?: string | null;
  alt: string;
  className?: string;
  height?: number;
};

export default function PhoneMockup({ src, alt, className, height = DEFAULT_HEIGHT }: PhoneMockupProps) {
  const width = Math.round(height * ASPECT);

  return (
    <div
      className={cn("relative mx-auto flex justify-center", className)}
      style={{ maxWidth: width + 24 }}
    >
      <div
        className="relative rounded-[2.25rem] border-[10px] border-[#462324] bg-[#462324] shadow-xl"
        style={{ width, height }}
      >
        <div className="absolute inset-[6px] overflow-hidden rounded-[1.5rem] bg-[#FFF5F0]">
          {src ? (
            <Image
              src={src}
              alt={alt}
              width={width - 12}
              height={height - 12}
              className="h-full w-full object-cover object-top"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full flex-col justify-center p-6 text-center bg-[#FFFBF7]">
              <div className="mx-auto h-2 w-3/4 rounded-full bg-[#D96D46]/20 mb-4" />
              <div className="space-y-2">
                <div className="h-2 w-full rounded bg-[#462324]/10" />
                <div className="h-2 w-5/6 rounded bg-[#462324]/10 mx-auto" />
                <div className="h-2 w-4/5 rounded bg-[#462324]/10 mx-auto" />
              </div>
              <p className="mt-6 text-xs font-medium text-[#976568]">App screenshot</p>
            </div>
          )}
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#462324] rounded-b-xl" />
      </div>
    </div>
  );
}
