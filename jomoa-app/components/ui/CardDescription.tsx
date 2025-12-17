"use client";

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardDescription({ children, className = "" }: CardDescriptionProps) {
  return (
    <p className={`text-sm text-[#5A6B5D]/70 leading-relaxed ${className}`}>
      {children}
    </p>
  );
}


