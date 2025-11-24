// components/ui/alert.tsx (Simple Version)
import React from "react";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

type AlertVariant = "default" | "destructive" | "success" | "warning" | "info";

const variantStyles: Record<AlertVariant, string> = {
  default: "bg-white border-gray-200 text-gray-900",
  destructive: "bg-red-50 border-red-200 text-red-900",
  success: "bg-green-50 border-green-200 text-green-900",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
  info: "bg-blue-50 border-blue-200 text-blue-900",
};

const iconMap: Record<AlertVariant, React.ElementType> = {
  default: AlertCircle,
  destructive: XCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
};

// Alert Component
export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  icon?: boolean;
  children?: React.ReactNode;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    { className = "", variant = "default", icon = false, children, ...props },
    ref
  ) => {
    const Icon = iconMap[variant];
    const variantClass = variantStyles[variant];

    return (
      <div
        ref={ref}
        role="alert"
        className={`relative w-full rounded-lg border p-4 ${variantClass} ${className}`}
        {...props}
      >
        {icon && <Icon className="absolute left-4 top-4 h-4 w-4" />}
        <div className={icon ? "ml-7" : ""}>{children}</div>
      </div>
    );
  }
);

Alert.displayName = "Alert";

// AlertTitle Component
export interface AlertTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode;
}

export const AlertTitle = React.forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <h5
        ref={ref}
        className={`mb-2 font-semibold leading-none tracking-tight ${className}`}
        {...props}
      >
        {children}
      </h5>
    );
  }
);

AlertTitle.displayName = "AlertTitle";

// AlertDescription Component
export interface AlertDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode;
}

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  AlertDescriptionProps
>(({ className = "", children, ...props }, ref) => {
  return (
    <p ref={ref} className={`text-sm leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
});

AlertDescription.displayName = "AlertDescription";
