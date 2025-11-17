import React, { useState } from "react";

// Inline CSS styles
const styles = {
  gradientEmerald: {
    background: "linear-gradient(to bottom, #000000, #0a0a0a, #050505)",
    position: "relative",
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  headerContainer: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "0 1rem",
  },
  headerInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "64px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  logoIcon: {
    height: "32px",
    width: "32px",
    borderRadius: "8px",
    backgroundColor: "#10b981",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    marginLeft: "8px",
    color: "white",
    fontWeight: 600,
    fontSize: "1.125rem",
  },
  nav: {
    display: "none",
    "@media (min-width: 768px)": {
      display: "flex",
      alignItems: "center",
      gap: "2rem",
    },
  },
  navLink: {
    color: "#d1d5db",
    padding: "0.5rem 0.75rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    textDecoration: "none",
    transition: "color 0.2s",
    cursor: "pointer",
  },
  navLinkHover: {
    color: "white",
  },
  ctaButton: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.5rem 1rem",
    border: "none",
    fontSize: "0.875rem",
    fontWeight: 500,
    borderRadius: "12px",
    color: "white",
    backgroundColor: "#059669",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },
  ctaButtonHover: {
    backgroundColor: "#047857",
  },
  mobileMenuButton: {
    display: "block",
    padding: "0.5rem",
    color: "white",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    "@media (min-width: 768px)": {
      display: "none",
    },
  },
  mobileMenu: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    padding: "1rem",
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  section: {
    padding: "4rem 1rem",
  },
  sectionTitle: {
    fontSize: "2.5rem",
    fontWeight: 700,
    color: "white",
    marginBottom: "1rem",
    textAlign: "center",
  },
  sectionSubtitle: {
    fontSize: "1.125rem",
    color: "#9ca3af",
    textAlign: "center",
    maxWidth: "600px",
    margin: "0 auto 3rem",
  },
  card: {
    backgroundColor: "rgba(23, 23, 23, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "16px",
    padding: "2rem",
    transition: "all 0.3s",
  },
  cardHover: {
    borderColor: "rgba(16, 185, 129, 0.5)",
    transform: "translateY(-4px)",
  },
  footer: {
    backgroundColor: "#000000",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "3rem 1rem",
    marginTop: "auto",
  },
  footerContent: {
    maxWidth: "1280px",
    margin: "0 auto",
    textAlign: "center",
    color: "#9ca3af",
  },
};

const navigation = [
  { name: "How it works", href: "#how" },
  { name: "Data coverage", href: "#data" },
  { name: "Pricing", href: "#pricing" },
];

// Mock Components (replace with your actual components)
const Hero = () => (
  <section
    style={{ ...styles.section, paddingTop: "6rem", paddingBottom: "6rem" }}
  >
    <div style={{ maxWidth: "1280px", margin: "0 auto", textAlign: "center" }}>
      <h1
        style={{
          fontSize: "3.5rem",
          fontWeight: 800,
          color: "white",
          marginBottom: "1.5rem",
          lineHeight: 1.2,
        }}
      >
        AI-Powered Deal Intelligence
      </h1>
      <p
        style={{
          fontSize: "1.25rem",
          color: "#d1d5db",
          maxWidth: "700px",
          margin: "0 auto 2rem",
        }}
      >
        Aria Cortex combines advanced AI with comprehensive market data to
        identify and qualify your next best investment opportunities.
      </p>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <button style={styles.ctaButton}>Get Started</button>
        <button
          style={{
            ...styles.ctaButton,
            backgroundColor: "transparent",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          Watch Demo
        </button>
      </div>
    </div>
  </section>
);

const HowItWorks = () => (
  <section style={{ ...styles.section, backgroundColor: "#0a0a0a" }}>
    <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
      <h2 style={styles.sectionTitle}>How It Works</h2>
      <p style={styles.sectionSubtitle}>
        Three simple steps to transform your deal sourcing process
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
        }}
      >
        {[
          {
            num: "01",
            title: "Define Your Criteria",
            desc: "Set your investment thesis and preferences",
          },
          {
            num: "02",
            title: "AI Analysis",
            desc: "Our engine scans millions of data points",
          },
          {
            num: "03",
            title: "Get Matches",
            desc: "Receive qualified opportunities ranked by fit",
          },
        ].map((step, i) => (
          <div key={i} style={styles.card}>
            <div
              style={{
                fontSize: "3rem",
                fontWeight: 700,
                color: "#10b981",
                marginBottom: "1rem",
              }}
            >
              {step.num}
            </div>
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: 600,
                color: "white",
                marginBottom: "0.5rem",
              }}
            >
              {step.title}
            </h3>
            <p style={{ color: "#9ca3af" }}>{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const MatchingEngine = () => (
  <section style={styles.section}>
    <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
      <h2 style={styles.sectionTitle}>Intelligent Matching Engine</h2>
      <p style={styles.sectionSubtitle}>
        Powered by cutting-edge AI and comprehensive market intelligence
      </p>
      <div style={styles.card}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "2rem",
          }}
        >
          {[
            {
              icon: "🎯",
              title: "Precision Targeting",
              desc: "ML-driven matching algorithms",
            },
            {
              icon: "📊",
              title: "Real-time Data",
              desc: "Live market intelligence feeds",
            },
            {
              icon: "🔍",
              title: "Deep Analysis",
              desc: "Multi-dimensional company profiling",
            },
            {
              icon: "⚡",
              title: "Instant Insights",
              desc: "Automated due diligence reports",
            },
          ].map((feature, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                {feature.icon}
              </div>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  color: "white",
                  marginBottom: "0.5rem",
                }}
              >
                {feature.title}
              </h3>
              <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const GeniusLayers = () => (
  <section style={{ ...styles.section, backgroundColor: "#0a0a0a" }}>
    <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
      <h2 style={styles.sectionTitle}>Multi-Layer Intelligence</h2>
      <p style={styles.sectionSubtitle}>
        Comprehensive data sources working in harmony
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {[
          "Company Financials",
          "Market Signals",
          "Technology Stack",
          "Team Dynamics",
          "Growth Metrics",
          "Competitive Landscape",
        ].map((layer, i) => (
          <div
            key={i}
            style={{ ...styles.card, padding: "1.5rem", textAlign: "center" }}
          >
            <p style={{ color: "white", fontWeight: 500 }}>{layer}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Pricing = () => (
  <section style={styles.section}>
    <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
      <h2 style={styles.sectionTitle}>Simple, Transparent Pricing</h2>
      <p style={styles.sectionSubtitle}>
        Choose the plan that fits your deal flow
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2rem",
        }}
      >
        {[
          {
            name: "Starter",
            price: "€390",
            features: ["5k AI credits", "250 matches/mo", "Basic integrations"],
          },
          {
            name: "Growth",
            price: "€1,490",
            features: [
              "50k AI credits",
              "2,500 matches/mo",
              "Advanced signals",
              "Team seats",
            ],
            highlight: true,
          },
          {
            name: "Enterprise",
            price: "Custom",
            features: [
              "Unlimited everything",
              "Custom models",
              "Dedicated support",
              "SLA",
            ],
          },
        ].map((plan, i) => (
          <div
            key={i}
            style={{
              ...styles.card,
              border: plan.highlight ? "2px solid #10b981" : styles.card.border,
              boxShadow: plan.highlight
                ? "0 0 30px rgba(16, 185, 129, 0.3)"
                : "none",
            }}
          >
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: 600,
                color: "white",
                marginBottom: "0.5rem",
              }}
            >
              {plan.name}
            </h3>
            <div
              style={{
                fontSize: "2.5rem",
                fontWeight: 700,
                color: "#10b981",
                marginBottom: "1.5rem",
              }}
            >
              {plan.price}
            </div>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                color: "#d1d5db",
              }}
            >
              {plan.features.map((feature, j) => (
                <li
                  key={j}
                  style={{
                    padding: "0.5rem 0",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  ✓ {feature}
                </li>
              ))}
            </ul>
            <button
              style={{
                ...styles.ctaButton,
                width: "100%",
                marginTop: "1.5rem",
              }}
            >
              {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const CTA = () => (
  <section style={{ ...styles.section, backgroundColor: "#0a0a0a" }}>
    <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
      <h2
        style={{
          fontSize: "2.5rem",
          fontWeight: 700,
          color: "white",
          marginBottom: "1rem",
        }}
      >
        Ready to Transform Your Deal Flow?
      </h2>
      <p
        style={{ fontSize: "1.125rem", color: "#9ca3af", marginBottom: "2rem" }}
      >
        Join leading investors using AI to find their next big opportunity
      </p>
      <button
        style={{ ...styles.ctaButton, padding: "1rem 2rem", fontSize: "1rem" }}
      >
        Start Free Trial
      </button>
    </div>
  </section>
);

const Footer = () => (
  <footer style={styles.footer}>
    <div style={styles.footerContent}>
      <div style={{ marginBottom: "1rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1rem",
          }}
        >
          <div style={styles.logoIcon}>
            <span
              style={{ color: "white", fontWeight: 700, fontSize: "0.875rem" }}
            >
              AC
            </span>
          </div>
          <span style={{ ...styles.logoText, fontSize: "1rem" }}>
            Aria Cortex
          </span>
        </div>
      </div>
      <p style={{ marginBottom: "1rem" }}>
        © 2024 Aria Cortex. All rights reserved.
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "2rem",
          flexWrap: "wrap",
        }}
      >
        {["Privacy Policy", "Terms of Service", "Contact"].map((link, i) => (
          <a
            key={i}
            href="#"
            style={{
              color: "#9ca3af",
              textDecoration: "none",
              fontSize: "0.875rem",
            }}
          >
            {link}
          </a>
        ))}
      </div>
    </div>
  </footer>
);

export default function Homepage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(false);

  return (
    <div style={styles.gradientEmerald}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContainer}>
          <div style={styles.headerInner}>
            {/* Logo */}
            <div style={styles.logo}>
              <div style={styles.logoIcon}>
                <span
                  style={{
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                  }}
                >
                  AC
                </span>
              </div>
              <span style={styles.logoText}>Aria Cortex</span>
            </div>

            {/* Desktop Navigation */}
            <nav style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
              <div
                style={{
                  display: "none",
                  "@media (min-width: 768px)": { display: "flex" },
                }}
              >
                {navigation.map((item, index) => (
                  <a
                    key={item.name}
                    href={item.href}
                    style={{
                      ...styles.navLink,
                      ...(hoveredNav === index ? styles.navLinkHover : {}),
                    }}
                    onMouseEnter={() => setHoveredNav(index)}
                    onMouseLeave={() => setHoveredNav(null)}
                  >
                    {item.name}
                  </a>
                ))}
              </div>

              {/* CTA Button */}
              <a
                href="#demo"
                style={{
                  ...styles.ctaButton,
                  ...(hoveredButton ? styles.ctaButtonHover : {}),
                }}
                onMouseEnter={() => setHoveredButton(true)}
                onMouseLeave={() => setHoveredButton(false)}
              >
                Request a demo
              </a>

              {/* Mobile Menu Button */}
              <button
                style={{
                  display: "block",
                  padding: "0.5rem",
                  color: "white",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.5rem",
                }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                ☰
              </button>
            </nav>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div style={styles.mobileMenu}>
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  style={{ ...styles.navLink, display: "block" }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        <Hero />
        <div id="how">
          <HowItWorks />
        </div>
        <div id="data">
          <MatchingEngine />
          <GeniusLayers />
        </div>
        <div id="pricing">
          <Pricing />
        </div>
        <CTA />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
