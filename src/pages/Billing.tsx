import React, { useState } from "react";
import { Check } from "lucide-react";

// UI Components with inline styles
function Button({
  className = "",
  variant = "default",
  children,
  style = {},
  ...props
}) {
  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    transition: "all 0.2s",
    cursor: "pointer",
    border: "none",
  };

  const variantStyles = {
    default: {
      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      color: "white",
      boxShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.39)",
    },
    outline: {
      backgroundColor: "rgba(23, 23, 23, 0.8)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      color: "#d1d5db",
    },
    ghost: {
      backgroundColor: "transparent",
      color: "#d1d5db",
    },
  };

  return (
    <button
      style={{ ...baseStyle, ...variantStyles[variant], ...style }}
      {...props}
    >
      {children}
    </button>
  );
}

function Card({ className = "", children, style = {}, ...props }) {
  const cardStyle = {
    border: "1px solid rgba(255, 255, 255, 0.08)",
    backgroundColor: "rgba(23, 23, 23, 0.6)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    transition: "all 0.3s ease",
  };

  return (
    <div style={{ ...cardStyle, ...style }} {...props}>
      {children}
    </div>
  );
}

function CardContent({ children, style = {}, ...props }) {
  return (
    <div style={style} {...props}>
      {children}
    </div>
  );
}

// Feature Lists
const FEATURES = {
  free: [
    "Clay Explorer integration (read-only 1k/mo)",
    "Basic investor/company matching (caps)",
    "DNA template + 1 saved segment",
    "Community & docs",
  ],
  pro: [
    "5k AI credits/mo + 250 matches",
    "Clay Explorer sync + enrich API",
    "DNA builder + 20 saved segments",
    "Explain-why-matched + notes",
    "Email intro workflows (manual)",
  ],
  growth: [
    "50k AI credits/mo + 2,500 matches",
    "Advanced Signal Fusion (hiring, tech, news)",
    "Sequenced outreach + Lemlist integration",
    "Multi-user seats (5) + roles",
    "Priority support + SLA",
  ],
  enterprise: [
    "Unlimited seats + SSO (SAML/SCIM)",
    "Private data lakes + on-prem options",
    "Custom models + success-fee rails",
    "Premium support, DPA, audit trail",
    "Dedicated solutions engineer",
  ],
};

// Plan Card Component
function PlanCard({ name, priceEUR, blurb, features, cta, tier, highlight }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleCheckout = () => {
    alert(`Checkout initiated for ${tier} plan`);
  };

  const cardStyle = {
    borderRadius: "20px",
    boxShadow: highlight
      ? "0 20px 60px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(16, 185, 129, 0.5)"
      : "0 4px 20px rgba(0, 0, 0, 0.3)",
    border: highlight
      ? "2px solid rgba(16, 185, 129, 0.8)"
      : "1px solid rgba(255, 255, 255, 0.08)",
    transform: isHovered
      ? "translateY(-8px) scale(1.02)"
      : "translateY(0) scale(1)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  };

  return (
    <Card
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent style={{ padding: "2rem" }}>
        {highlight && (
          <div
            style={{
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              color: "#10b981",
              fontSize: "0.75rem",
              fontWeight: 600,
              padding: "0.25rem 0.75rem",
              borderRadius: "12px",
              display: "inline-block",
              marginBottom: "1rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Most Popular
          </div>
        )}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <h3
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "white",
              margin: 0,
            }}
          >
            {name}
          </h3>
          <span style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
            {blurb}
          </span>
        </div>
        <div
          style={{
            marginTop: "1.5rem",
            display: "flex",
            alignItems: "baseline",
            gap: "0.5rem",
          }}
        >
          {name === "Enterprise" ? (
            <span
              style={{
                fontSize: "3rem",
                fontWeight: 800,
                color: "white",
                letterSpacing: "-0.02em",
              }}
            >
              Custom
            </span>
          ) : (
            <>
              <span
                style={{
                  fontSize: "3rem",
                  fontWeight: 800,
                  color: "white",
                  letterSpacing: "-0.02em",
                }}
              >
                €{priceEUR.toLocaleString()}
              </span>
              <span style={{ fontSize: "1rem", color: "#6b7280" }}>/mo</span>
            </>
          )}
        </div>
        <ul
          style={{
            marginTop: "2rem",
            listStyle: "none",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {features.map((f, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
              }}
            >
              <Check
                style={{
                  height: "20px",
                  width: "20px",
                  marginTop: "2px",
                  color: "#10b981",
                  flexShrink: 0,
                  strokeWidth: 2.5,
                }}
              />
              <span
                style={{
                  fontSize: "0.875rem",
                  color: "#d1d5db",
                  lineHeight: "1.5",
                }}
              >
                {f}
              </span>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: "2rem" }}>
          <Button
            style={{
              width: "100%",
              padding: "0.75rem 1.5rem",
              fontSize: "0.9375rem",
            }}
            onClick={handleCheckout}
          >
            {cta}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Overage Table Component
function OverageTable() {
  return (
    <div style={{ marginTop: "5rem" }}>
      <h4
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          color: "white",
          marginBottom: "0.5rem",
        }}
      >
        Elastic usage & success rails
      </h4>
      <p
        style={{ color: "#9ca3af", marginTop: "0.5rem", marginBottom: "2rem" }}
      >
        Pay only when value is created. Overage resets monthly.
      </p>
      <div
        style={{
          overflow: "hidden",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          backgroundColor: "rgba(23, 23, 23, 0.4)",
        }}
      >
        <table
          style={{
            width: "100%",
            fontSize: "0.875rem",
            borderCollapse: "collapse",
          }}
        >
          <thead style={{ backgroundColor: "rgba(255, 255, 255, 0.03)" }}>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  padding: "1rem",
                  fontWeight: 600,
                  color: "#e5e7eb",
                }}
              >
                Meter
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "1rem",
                  fontWeight: 600,
                  color: "#e5e7eb",
                }}
              >
                Included
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "1rem",
                  fontWeight: 600,
                  color: "#e5e7eb",
                }}
              >
                Overage
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "1rem",
                  fontWeight: 600,
                  color: "#e5e7eb",
                }}
              >
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "AI credits (tokens)",
                "5k / 50k / custom",
                "€0.0002 / token",
                "Elastic with model mix",
              ],
              [
                "Matches computed",
                "250 / 2,500 / custom",
                "€0.90 / match",
                "Explain-why-matched included",
              ],
              [
                "Enrich & verify",
                "Tier-capped",
                "€0.25 / record",
                "Clay Explorer & sources blend",
              ],
              [
                "Success fee (optional)",
                "—",
                "0.5%–2% of realized",
                "Stripe Connect rails",
              ],
            ].map((row, i) => (
              <tr
                key={i}
                style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}
              >
                <td
                  style={{ padding: "1rem", color: "#d1d5db", fontWeight: 500 }}
                >
                  {row[0]}
                </td>
                <td style={{ padding: "1rem", color: "#d1d5db" }}>{row[1]}</td>
                <td
                  style={{ padding: "1rem", color: "#10b981", fontWeight: 600 }}
                >
                  {row[2]}
                </td>
                <td
                  style={{
                    padding: "1rem",
                    color: "#9ca3af",
                    fontSize: "0.8125rem",
                  }}
                >
                  {row[3]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Main Pricing Page Component
function PricingPage() {
  const [billingCycle, setBilling] = useState("monthly");

  const price = (m, y) => (billingCycle === "monthly" ? m : y);

  const pageStyle = {
    minHeight: "100vh",
    background:
      "linear-gradient(to bottom, #000000 0%, #0a0a0a 50%, #000000 100%)",
    position: "relative",
  };

  return (
    <div style={pageStyle}>
      {/* Background decorative elements */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "10%",
          width: "400px",
          height: "400px",
          background:
            "radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      <section
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "5rem 1.5rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 800,
              background: "linear-gradient(to right, #ffffff, #d1d5db)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "1rem",
              letterSpacing: "-0.02em",
            }}
          >
            Aria Cortex Pricing
          </h1>
          <p
            style={{
              fontSize: "1.125rem",
              color: "#9ca3af",
              maxWidth: "700px",
              margin: "0 auto",
              lineHeight: "1.7",
            }}
          >
            Start free, scale as value compounds. Elastic AI credits + optional
            success-fee rails. Designed for PE, FO, venture, and corporates.
          </p>

          <div
            style={{
              marginTop: "2.5rem",
              display: "inline-flex",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "4px",
              backgroundColor: "rgba(23, 23, 23, 0.6)",
              backdropFilter: "blur(20px)",
            }}
          >
            <Button
              variant={billingCycle === "monthly" ? "default" : "ghost"}
              onClick={() => setBilling("monthly")}
              style={{ padding: "0.625rem 1.5rem" }}
            >
              Monthly
            </Button>
            <Button
              variant={billingCycle === "yearly" ? "default" : "ghost"}
              onClick={() => setBilling("yearly")}
              style={{ padding: "0.625rem 1.5rem" }}
            >
              Yearly{" "}
              <span
                style={{
                  marginLeft: "0.5rem",
                  fontSize: "0.75rem",
                  opacity: 0.8,
                }}
              >
                (save 15%)
              </span>
            </Button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2rem",
            marginBottom: "3rem",
          }}
        >
          <PlanCard
            name="Free"
            priceEUR={price(0, 0)}
            blurb="Evaluate the engine"
            features={FEATURES.free}
            cta="Start free"
            tier="free"
          />
          <PlanCard
            name="Pro"
            priceEUR={price(390, 331)}
            blurb="Solo investor / scout"
            features={FEATURES.pro}
            cta="Choose Pro"
            tier="pro"
          />
          <PlanCard
            name="Growth"
            priceEUR={price(1490, 1267)}
            blurb="Deal team scale"
            features={FEATURES.growth}
            cta="Choose Growth"
            tier="growth"
            highlight
          />
          <PlanCard
            name="Enterprise"
            priceEUR={price(0, 0)}
            blurb="Custom & compliance"
            features={FEATURES.enterprise}
            cta="Talk to sales"
            tier="enterprise"
          />
        </div>

        <OverageTable />
      </section>
    </div>
  );
}

// Badge Tile Component for Billing Dashboard
function BadgeTile({ label, value }) {
  return (
    <div
      style={{
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        backgroundColor: "rgba(23, 23, 23, 0.6)",
        padding: "1.5rem",
        backdropFilter: "blur(20px)",
      }}
    >
      <div
        style={{
          fontSize: "0.75rem",
          color: "#9ca3af",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "0.5rem",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "white" }}>
        {value}
      </div>
    </div>
  );
}

// Billing Dashboard Component
function BillingDashboard() {
  const [data] = useState({
    plan: "pro",
    roi_ratio: 3.47,
    clv_estimate_eur: 12450,
    suggested_discount_pct: 10,
    suggested_overage_eur: 145.5,
    churn_risk: 0.15,
  });

  const handleRefresh = () => {
    alert("Refreshing pricing brain...");
  };

  const pageStyle = {
    minHeight: "100vh",
    background:
      "linear-gradient(to bottom, #000000 0%, #0a0a0a 50%, #000000 100%)",
    padding: "3rem 1.5rem",
  };

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h2
          style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            color: "white",
            marginBottom: "0.5rem",
          }}
        >
          Billing & Value
        </h2>
        <p style={{ color: "#9ca3af", marginBottom: "3rem" }}>
          Transparent view of plan, usage, ROI, and adaptive pricing
          suggestions.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <Card style={{ borderRadius: "20px", padding: "2rem" }}>
            <h4
              style={{
                fontSize: "0.75rem",
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "0.75rem",
              }}
            >
              Plan
            </h4>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "white" }}>
              {data?.plan?.toUpperCase() || "—"}
            </div>
          </Card>
          <Card style={{ borderRadius: "20px", padding: "2rem" }}>
            <h4
              style={{
                fontSize: "0.75rem",
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "0.75rem",
              }}
            >
              ROI
            </h4>
            <div
              style={{ fontSize: "2rem", fontWeight: 700, color: "#10b981" }}
            >
              {(data?.roi_ratio ?? 0).toFixed(2)}x
            </div>
          </Card>
          <Card style={{ borderRadius: "20px", padding: "2rem" }}>
            <h4
              style={{
                fontSize: "0.75rem",
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "0.75rem",
              }}
            >
              CLV (est.)
            </h4>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "white" }}>
              €{Number(data?.clv_estimate_eur || 0).toLocaleString()}
            </div>
          </Card>
        </div>

        <Card style={{ borderRadius: "20px", padding: "2rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "2rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <h4
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: "white",
                  marginBottom: "0.25rem",
                }}
              >
                Adaptive suggestions
              </h4>
              <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                Your engagement profile informs pricing adjustments.
              </p>
            </div>
            <Button onClick={handleRefresh}>Refresh now</Button>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem",
            }}
          >
            <BadgeTile
              label="Suggested Discount"
              value={`${data?.suggested_discount_pct ?? 0}%`}
            />
            <BadgeTile
              label="Suggested Overage"
              value={`€${Number(data?.suggested_overage_eur || 0).toFixed(2)}`}
            />
            <BadgeTile
              label="Churn Risk"
              value={`${Number((data?.churn_risk ?? 0) * 100).toFixed(1)}%`}
            />
          </div>
        </Card>

        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <Button variant="outline">Open Customer Portal</Button>
          <Button>Upgrade Plan</Button>
        </div>
      </div>
    </div>
  );
}

// Demo App with Tabs
export default function App() {
  const [view, setView] = useState("pricing");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#000000" }}>
      <nav
        style={{
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(20px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "1rem 1.5rem",
            display: "flex",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          <div
            style={{
              marginRight: "auto",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #10b981, #059669)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                color: "white",
                fontSize: "0.875rem",
              }}
            >
              AC
            </div>
            <span
              style={{ color: "white", fontWeight: 600, fontSize: "1.125rem" }}
            >
              Aria Cortex
            </span>
          </div>
          <Button
            variant={view === "pricing" ? "default" : "ghost"}
            onClick={() => setView("pricing")}
          >
            Pricing
          </Button>
          <Button
            variant={view === "billing" ? "default" : "ghost"}
            onClick={() => setView("billing")}
          >
            Billing Dashboard
          </Button>
        </div>
      </nav>

      {view === "pricing" ? <PricingPage /> : <BillingDashboard />}
    </div>
  );
}
