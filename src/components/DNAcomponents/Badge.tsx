// components/ui/badge.tsx
import React from "react";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: "border-transparent bg-gray-900 text-gray-50",
  secondary: "border-transparent bg-gray-100 text-gray-900",
  destructive: "border-transparent bg-red-500 text-gray-50",
  outline: "text-gray-950 border-gray-200",
};

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  className = "",
  children,
  ...props
}) => {
  return (
    <div
      className={`
        inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold 
        transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2
        ${badgeVariants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
