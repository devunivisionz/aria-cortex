export default function Button({
  children,
  onClick,
  variant = "primary",
  fullWidth = true,
  disabled = false,
  style = {},
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  const baseStyle = {
    padding: "0.875rem 1.5rem",
    borderRadius: "12px",
    fontSize: "0.9375rem",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    transition: "all 0.2s",
    width: fullWidth ? "100%" : "auto",
  };

  const variantStyles = {
    primary: {
      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      color: "white",
      boxShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.39)",
    },
    secondary: {
      backgroundColor: "rgba(23, 23, 23, 0.6)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      color: "#d1d5db",
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...baseStyle, ...variantStyles[variant], ...style }}
      onMouseEnter={(e) => {
        if (variant === "primary") {
          e.target.style.transform = "translateY(-2px)";
          e.target.style.boxShadow = "0 6px 20px 0 rgba(16, 185, 129, 0.5)";
        } else {
          e.target.style.backgroundColor = "rgba(23, 23, 23, 0.9)";
        }
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "translateY(0)";
        e.target.style.boxShadow =
          variant === "primary"
            ? "0 4px 14px 0 rgba(16, 185, 129, 0.39)"
            : "none";
        if (variant === "secondary") {
          e.target.style.backgroundColor = "rgba(23, 23, 23, 0.6)";
        }
      }}
    >
      {children}
    </button>
  );
}
