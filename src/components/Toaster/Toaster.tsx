// components/Toaster/Toaster.tsx
import React, { useEffect, useState } from "react";
import { X, CheckCircle, AlertTriangle, Info as InfoIcon } from "lucide-react";

type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right";

type ToasterProps = {
  msg: string;
  error?: boolean;
  variant?: "success" | "error" | "info" | "warning";
  duration?: number;
  position?: Position;
  show?: boolean;
  onClose?: () => void;
};

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

  // Sync with prop changes
  useEffect(() => {
    setVisible(propShow);
  }, [propShow]);

  // Auto-dismiss timer
  useEffect(() => {
    if (!visible || duration === 0) return;

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
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
      className={`fixed z-[100] ${posClass} flex items-start max-w-xs`}
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
