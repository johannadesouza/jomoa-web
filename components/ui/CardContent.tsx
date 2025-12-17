"use client";

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return (
    <div className={`pt-0 ${className}`}>
      {children}
    </div>
  );
}


