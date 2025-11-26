import React, { useEffect, useState } from "react";

type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right";

type ToasterProps = {
  msg: string;
  error?: boolean; // shorthand: true = error, false = success/info
  variant?: "success" | "error" | "info" | "warning"; // optional named variants
  duration?: number; // ms before auto-dismiss (0 = sticky)
  position?: Position;
  show?: boolean; // control visibility from parent
  onClose?: () => void; // callback when toast is dismissed
};

// Default icon set using lucide-react (available in many projects). You can replace with your own icons.
import { X, CheckCircle, AlertTriangle, Info as InfoIcon } from "lucide-react";

export default function Toaster({
  msg,
  error,
  variant = "info",
  duration = 3000,
  position = "top-right",
  show: propShow = true,
  onClose,
}: ToasterProps) {
  const [visible, setVisible] = useState(propShow);

  useEffect(() => {
    setVisible(propShow);
  }, [propShow]);

  useEffect(() => {
    if (!visible) return;
    if (duration > 0) {
      const t = setTimeout(() => handleClose(), duration);
      return () => clearTimeout(t);
    }
  }, [visible, duration]);

  function handleClose() {
    setVisible(false);
    onClose?.();
  }

  const resolvedVariant = error ? "error" : variant;

  const posClass = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  }[position];

  const variantStyles = {
    success: "bg-white border-green-300 text-green-800",
    error: "bg-white border-red-300 text-red-800",
    info: "bg-white border-sky-300 text-sky-800",
    warning: "bg-white border-amber-300 text-amber-800",
  }[resolvedVariant];

  const icon = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertTriangle className="w-5 h-5" />,
    info: <InfoIcon className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
  }[resolvedVariant];

  if (!visible) return null;

  return (
    <div
      aria-live="polite"
      className={`fixed z-50 ${posClass} flex items-start max-w-xs`}
    >
      <div
        role="status"
        className={`pointer-events-auto transform transition-all duration-300 ease-in-out rounded-lg border p-3 shadow-lg ${variantStyles} flex gap-3 items-start`}
      >
        <div className="mt-0.5">{icon}</div>
        <div className="flex-1 text-sm leading-snug break-words">{msg}</div>
        <button
          onClick={handleClose}
          aria-label="Close notification"
          className="ml-3 inline-flex p-1 rounded hover:bg-black/5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
