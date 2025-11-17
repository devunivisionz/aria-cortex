import { useState } from "react";
import Input from "../../../components/AuthenticationComponents/InputFields";
import Button from "../../../components/Button";
import { Link } from "react-router-dom";

export default function SignupPage({
  onSwitchToLogin,
}: {
  onSwitchToLogin: () => void;
}) {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const handleSubmit = () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    alert(`Sign up attempted with email: ${email}`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom, #000000 0%, #0a0a0a 50%, #000000 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        position: "relative",
      }}
    >
      {/* Background decorative elements */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          right: "10%",
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
          left: "10%",
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
          maxWidth: "440px",
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
          Create your account
        </h1>
        <p
          style={{
            color: "#9ca3af",
            textAlign: "center",
            marginBottom: "2.5rem",
            fontSize: "0.9375rem",
          }}
        >
          Start your journey with Aria Cortex
        </p>

        {/* Form Fields */}
        <div>
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label="Email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
              cursor: "pointer",
              fontSize: "0.875rem",
              color: "#d1d5db",
              marginBottom: "2rem",
            }}
          >
            <input
              type="checkbox"
              required
              style={{
                width: "16px",
                height: "16px",
                cursor: "pointer",
                accentColor: "#10b981",
                marginTop: "2px",
              }}
            />
            <span>
              I agree to the{" "}
              <a
                href="#"
                style={{
                  color: "#10b981",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                style={{
                  color: "#10b981",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                Privacy Policy
              </a>
            </span>
          </label>

          <Button onClick={handleSubmit}>Create account</Button>
        </div>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: "2rem 0",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            }}
          />
          <span
            style={{
              padding: "0 1rem",
              fontSize: "0.875rem",
              color: "#6b7280",
            }}
          >
            OR
          </span>
          <div
            style={{
              flex: 1,
              height: "1px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            }}
          />
        </div>

        {/* Social Login */}
        <Button variant="secondary">
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </span>
        </Button>

        {/* Sign in link */}
        <p
          style={{
            textAlign: "center",
            color: "#9ca3af",
            fontSize: "0.875rem",
            marginTop: "2rem",
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            // onClick={(e) => {
            //   e.preventDefault();
            //   onSwitchToLogin();
            // }}
            style={{
              color: "#10b981",
              textDecoration: "none",
              fontWeight: 600,
            }}
            onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
