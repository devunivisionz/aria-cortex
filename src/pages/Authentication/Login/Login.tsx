import { useState } from "react";
import Input from "../../../components/AuthenticationComponents/InputFields";
import Button from "../../../components/Button";
import { Link, useNavigate } from "react-router-dom";
// import { authService } from "../../../lib/supabaseClient";

export function LoginPage({
  onSwitchToSignup,
}: {
  onSwitchToSignup: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (
    e: React.MouseEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    // Reset error message
    setError("");

    // Validation
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);

    try {
      // Call Supabase Edge Function for login
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to sign in");
      }

      // Success - store the session
      if (data.session) {
        // Store the access token
        localStorage.setItem("access_token", data.session.access_token);
        localStorage.setItem("refresh_token", data.session.refresh_token);

        // Store user data if needed
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        // If remember me is checked, store email
        if (rememberMe) {
          localStorage.setItem("remembered_email", email);
        } else {
          localStorage.removeItem("remembered_email");
        }

        // Set authentication flag
        localStorage.setItem("isAuthenticated", "true");

        // Navigate to dashboard
        navigate("/");
      }
    } catch (err: any) {
      console.error("Login error:", err);

      // Handle specific error messages
      if (
        err.message.includes("Invalid login credentials") ||
        err.message.includes("Invalid email or password")
      ) {
        setError("Invalid email or password. Please try again.");
      } else if (err.message.includes("Email not confirmed")) {
        setError("Please verify your email before signing in.");
      } else if (err.message.includes("User not found")) {
        setError("No account found with this email. Please sign up first.");
      } else if (
        err.message.includes("network") ||
        err.message.includes("Failed to fetch")
      ) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(err.message || "Failed to sign in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);

    try {
      // await authService.signInWithGoogle();
      // User will be redirected to Google OAuth
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      setError("Failed to sign in with Google. Please try again.");
      setIsLoading(false);
    }
  };

  // Check for remembered email on component mount
  useState(() => {
    const rememberedEmail = localStorage.getItem("remembered_email");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  });

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
        padding: "0",
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
          Welcome back
        </h1>
        <p
          style={{
            color: "#9ca3af",
            textAlign: "center",
            marginBottom: "2.5rem",
            fontSize: "0.9375rem",
          }}
        >
          Sign in to your Aria Cortex account
        </p>

        {/* Error Message */}
        {error && (
          <div
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              padding: "0.75rem 1rem",
              marginBottom: "1.5rem",
              color: "#f87171",
              fontSize: "0.875rem",
            }}
          >
            {error}
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
                fontSize: "0.875rem",
                color: "#d1d5db",
              }}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                style={{
                  width: "16px",
                  height: "16px",
                  cursor: "pointer",
                  accentColor: "#10b981",
                }}
              />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              style={{
                fontSize: "0.875rem",
                color: "#10b981",
                textDecoration: "none",
                fontWeight: 500,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.textDecoration = "underline")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.textDecoration = "none")
              }
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

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
        <Button
          variant="secondary"
          style={{ marginBottom: "1rem" }}
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
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

        {/* Sign up link */}
        <p
          style={{
            textAlign: "center",
            color: "#9ca3af",
            fontSize: "0.875rem",
            marginTop: "2rem",
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/signup"
            style={{
              color: "#10b981",
              textDecoration: "none",
              fontWeight: 600,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.textDecoration = "underline")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.textDecoration = "none")
            }
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
