"use client";

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export function CardTitle({ 
  children, 
  className = "", 
  as: Component = "h3" 
}: CardTitleProps) {
  return (
    <Component className={`text-xl font-the-seasons font-semibold text-[#5A6B5D] ${className}`}>
      {children}
    </Component>
  );
}


