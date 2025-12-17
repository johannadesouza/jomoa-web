"use client";

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return (
    <div className={`flex items-center pt-4 border-t border-[rgba(232,229,224,0.4)] ${className}`}>
      {children}
    </div>
  );
}


