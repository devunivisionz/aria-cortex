import React, { useState, useEffect, useRef } from "react";

// Reusable Input Component for OTP
function OTPInput({ value, onChange, index, onKeyDown, id }) {
  return (
    <input
      id={id}
      type="text"
      maxLength={1}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      style={{
        width: "56px",
        height: "56px",
        textAlign: "center",
        fontSize: "1.5rem",
        fontWeight: 700,
        backgroundColor: "rgba(23, 23, 23, 0.6)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "12px",
        color: "white",
        outline: "none",
        transition: "all 0.2s",
      }}
      onFocus={(e) => {
        e.target.style.borderColor = "#10b981";
        e.target.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.1)";
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
        e.target.style.boxShadow = "none";
      }}
    />
  );
}

// Button Component
function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  style = {},
}) {
  const baseStyle = {
    padding: "0.875rem 1.5rem",
    borderRadius: "12px",
    fontSize: "0.9375rem",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    border: "none",
    transition: "all 0.2s",
    width: "100%",
    opacity: disabled ? 0.5 : 1,
  };

  const variantStyles = {
    primary: {
      background: disabled
        ? "#6b7280"
        : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      color: "white",
      boxShadow: disabled ? "none" : "0 4px 14px 0 rgba(16, 185, 129, 0.39)",
    },
    secondary: {
      backgroundColor: "transparent",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      color: "#10b981",
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...baseStyle, ...variantStyles[variant], ...style }}
      onMouseEnter={(e) => {
        if (!disabled && variant === "primary") {
          e.target.style.transform = "translateY(-2px)";
          e.target.style.boxShadow = "0 6px 20px 0 rgba(16, 185, 129, 0.5)";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.target.style.transform = "translateY(0)";
          e.target.style.boxShadow =
            variant === "primary"
              ? "0 4px 14px 0 rgba(16, 185, 129, 0.39)"
              : "none";
        }
      }}
    >
      {children}
    </button>
  );
}

// Verification Code Page Component
export default function OTPinput({
  email = "user@example.com",
  onVerified,
  onResend,
}: {
  email: string;
  onVerified: (code: string) => void;
  onResend: () => void;
}) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isExpired, setIsExpired] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const timerRef = useRef(null);

  // Initialize and manage timer
  useEffect(() => {
    const initializeTimer = () => {
      const storedExpiry = sessionStorage.getItem("verificationExpiry");
      const now = Date.now();

      if (storedExpiry) {
        const expiryTime = parseInt(storedExpiry, 10);
        const remainingMs = expiryTime - now;
        const remainingSeconds = Math.floor(remainingMs / 1000);

        if (remainingSeconds > 0) {
          // Code is still valid
          setTimeLeft(remainingSeconds);
          setIsExpired(false);
        } else {
          // Code has expired
          setTimeLeft(0);
          setIsExpired(true);
        }
      } else {
        // First time - create new expiry
        const expiryTime = now + 120000; // 2 minutes from now
        sessionStorage.setItem("verificationExpiry", expiryTime.toString());
        setTimeLeft(120);
        setIsExpired(false);
      }
    };

    initializeTimer();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle OTP input change
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = pastedData.split("");
    setCode([...newCode, ...Array(6 - newCode.length).fill("")]);

    // Focus last filled input
    const lastIndex = Math.min(newCode.length - 1, 5);
    setTimeout(() => {
      const input = document.getElementById(`otp-${lastIndex}`);
      if (input) input.focus();
    }, 0);
  };

  // Verify code
  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      alert("Please enter all 6 digits");
      return;
    }

    if (isExpired) {
      alert("Verification code has expired. Please request a new one.");
      return;
    }

    setIsVerifying(true);

    // Simulate API call
    setTimeout(() => {
      setIsVerifying(false);

      // Clear expiry on successful verification
      sessionStorage.removeItem("verificationExpiry");

      alert(`Verification successful! Code: ${fullCode}`);
      if (onVerified) onVerified(fullCode);
    }, 1500);
  };

  // Resend code
  const handleResend = () => {
    // Clear old code
    setCode(["", "", "", "", "", ""]);

    // Set new expiration time (2 minutes from now)
    const newExpiryTime = Date.now() + 120000;
    sessionStorage.setItem("verificationExpiry", newExpiryTime.toString());

    // Reset timer states
    setTimeLeft(120);
    setIsExpired(false);

    // Focus first input
    setTimeout(() => {
      const firstInput = document.getElementById("otp-0");
      if (firstInput) firstInput.focus();
    }, 0);

    alert("New verification code sent!");
    if (onResend) onResend();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background:
          "linear-gradient(to bottom, #000000 0%, #0a0a0a 50%, #000000 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {/* Background decorative elements */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "10%",
          width: "400px",
          height: "400px",
          background:
            "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          right: "10%",
          width: "350px",
          height: "350px",
          background:
            "radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "rgba(23, 23, 23, 0.6)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "24px",
          padding: "3rem",
          position: "relative",
          zIndex: 1,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              color: "white",
              fontSize: "1.25rem",
              boxShadow: "0 8px 20px rgba(16, 185, 129, 0.4)",
            }}
          >
            AC
          </div>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: "white",
            textAlign: "center",
            marginBottom: "0.5rem",
          }}
        >
          Verify your email
        </h1>
        <p
          style={{
            color: "#9ca3af",
            textAlign: "center",
            marginBottom: "1rem",
            fontSize: "0.9375rem",
          }}
        >
          We've sent a 6-digit code to
        </p>
        <p
          style={{
            color: "#10b981",
            textAlign: "center",
            marginBottom: "2.5rem",
            fontSize: "0.9375rem",
            fontWeight: 600,
          }}
        >
          {email}
        </p>

        {/* Timer */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              borderRadius: "12px",
              backgroundColor: isExpired
                ? "rgba(239, 68, 68, 0.1)"
                : "rgba(16, 185, 129, 0.1)",
              border: `1px solid ${
                isExpired ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)"
              }`,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isExpired ? "#ef4444" : "#10b981"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: isExpired ? "#ef4444" : "#10b981",
              }}
            >
              {isExpired
                ? "Code expired"
                : `Expires in ${formatTime(timeLeft)}`}
            </span>
          </div>
        </div>

        {/* OTP Input */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "center",
            marginBottom: "2.5rem",
          }}
          onPaste={handlePaste}
        >
          {code.map((digit, index) => (
            <OTPInput
              key={index}
              id={`otp-${index}`}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              index={index}
            />
          ))}
        </div>

        {/* Verify Button */}
        <Button
          onClick={handleVerify}
          disabled={code.join("").length !== 6 || isVerifying || isExpired}
        >
          {isVerifying ? "Verifying..." : "Verify Email"}
        </Button>

        {/* Resend Code */}
        <div
          style={{
            textAlign: "center",
            marginTop: "2rem",
          }}
        >
          <p
            style={{
              color: "#9ca3af",
              fontSize: "0.875rem",
              marginBottom: "0.5rem",
            }}
          >
            Didn't receive the code?
          </p>
          <button
            onClick={handleResend}
            disabled={!isExpired && timeLeft > 0}
            style={{
              background: "none",
              border: "none",
              color: isExpired || timeLeft <= 0 ? "#10b981" : "#6b7280",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: isExpired || timeLeft <= 0 ? "pointer" : "not-allowed",
              textDecoration: "none",
              padding: 0,
            }}
            onMouseEnter={(e) => {
              if (isExpired || timeLeft <= 0) {
                e.target.style.textDecoration = "underline";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.textDecoration = "none";
            }}
          >
            Resend code
          </button>
        </div>

        {/* Back to login */}
        <div
          style={{
            textAlign: "center",
            marginTop: "2rem",
            paddingTop: "2rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <a
            href="#"
            style={{
              color: "#9ca3af",
              fontSize: "0.875rem",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              e.target.style.color = "#10b981";
            }}
            onMouseLeave={(e) => {
              e.target.style.color = "#9ca3af";
            }}
          >
            ← Back to login
          </a>
        </div>
      </div>
    </div>
  );
}
