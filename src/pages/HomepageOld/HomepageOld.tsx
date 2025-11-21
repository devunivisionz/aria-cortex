import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * ARIA CORTEX — FULL HOMEPAGE
 * Enterprise-grade layout, inspired by Grata / PitchBook / Gain.pro
 * - Tailwind CSS
 * - Black + Emerald aesthetic
 */

export default function Home() {
  return (
    <div className="bg-black text-white font-inter min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <HeroSection />
        <TrustStrip />
        <ProductStrip />
        <InvestmentDNA />
        <WorkflowSection />
        <SolutionsSection />
        <GlobalCoverage />
        <ComparisonPreview />
        <TestimonialsSection />
        <PricingTeaser />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}

/* ============ HEADER ============ */

function Header() {
  const navigate = useNavigate();
  return (
    <header className="border-b border-white/10 bg-black/80 backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-sm bg-emerald-500" />
          <span className="font-semibold tracking-wide text-sm md:text-base">
            Aria Cortex
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
          <a href="#product" className="hover:text-white">
            Product
          </a>
          <a href="#solutions" className="hover:text-white">
            Solutions
          </a>
          <a href="#dna" className="hover:text-white">
            Investment DNA
          </a>
          <a href="#compare" className="hover:text-white">
            Compare
          </a>
          <a href="#pricing" className="hover:text-white">
            Pricing
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="hidden md:inline-flex px-3 py-1.5 rounded-full text-xs border border-white/20 text-white/80 hover:border-emerald-400 hover:text-white transition"
          >
            Log in
          </button>
          <button className="px-4 py-2 rounded-full text-xs md:text-sm bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition">
            Request a demo
          </button>
        </div>
      </div>
    </header>
  );
}

/* ============ HERO ============ */

function HeroSection() {
  return (
    <section className="border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-xs text-emerald-200 mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            AI Origination Engine for Private Markets & Distribution
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight mb-4">
            Turn global private markets
            <span className="text-emerald-400"> into a deal machine</span>.
          </h1>

          <p className="text-sm md:text-base text-white/70 mb-6 max-w-xl">
            Aria Cortex unifies company data, distributors, investors, and
            outreach into one engine. Search, score, and contact the right
            counterparties globally — without stitching together 10 different
            tools.
          </p>

          <ul className="text-xs md:text-sm text-white/70 space-y-2 mb-8">
            <li>• AI-scored Investment & Go-to-Market DNA for every lead</li>
            <li>
              • Global coverage across Europe, MEA, Americas, India & LATAM
            </li>
            <li>• Built from thousands of hours of live origination work</li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-3">
            <button className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold transition">
              Request a live demo
            </button>
            <button className="px-5 py-2.5 rounded-full border border-white/20 text-sm text-white/80 hover:border-emerald-400 hover:text-white transition">
              Explore the platform
            </button>
          </div>
        </div>

        {/* Mock product preview */}
        <div className="relative">
          <div className="absolute -top-10 -left-6 h-24 w-24 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative bg-zinc-950 border border-white/10 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Cortex Origination View
              </div>
              <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                Live scoring
              </span>
            </div>

            <div className="flex gap-3 mb-4 text-[11px]">
              <button className="px-3 py-1 rounded-full bg-white/5 border border-white/15 text-white">
                Companies
              </button>
              <button className="px-3 py-1 rounded-full bg-transparent border border-white/10 text-white/60">
                Investors
              </button>
              <button className="px-3 py-1 rounded-full bg-transparent border border-white/10 text-white/60">
                Distributors
              </button>
            </div>

            <div className="mb-3">
              <div className="flex items-center gap-2 bg-zinc-900/80 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70">
                <span className="text-white/40">Search</span>
                <span className="text-white/60">
                  "B2B packaging companies · EBITDA &gt; €5M · DACH + Benelux"
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {mockLeads.map((lead) => (
                <div
                  key={lead.name}
                  className="flex justify-between items-center bg-zinc-900/60 border border-white/10 rounded-lg px-3 py-2"
                >
                  <div>
                    <div className="text-xs font-medium">{lead.name}</div>
                    <div className="text-[10px] text-white/50">
                      {lead.region} · {lead.sector}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="text-white/40">DNA Fit</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
                        {lead.dnaFit}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-white/50">
                      Dealability:{" "}
                      <span className="text-emerald-300">
                        {lead.dealability}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-[10px] text-white/50">
              <span>12,483 targets in this thesis</span>
              <span className="text-emerald-300">Sync to outreach →</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const mockLeads = [
  {
    name: "NordPack Solutions",
    region: "DACH",
    sector: "Sustainable Packaging",
    dnaFit: 89,
    dealability: "High",
  },
  {
    name: "Benelux FlexiPack",
    region: "Benelux",
    sector: "Industrial Packaging",
    dnaFit: 82,
    dealability: "Medium",
  },
  {
    name: "Iberia Retail Supply",
    region: "Iberia",
    sector: "Retail Distribution",
    dnaFit: 77,
    dealability: "High",
  },
];

/* ============ TRUST STRIP ============ */

function TrustStrip() {
  return (
    <section className="border-b border-white/10 bg-black">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <p className="text-xs md:text-sm text-white/40 mb-4">
          Built from real mandates for investors, corporates, and distributors
          across:
        </p>
        <div className="flex flex-wrap gap-6 md:gap-10 items-center text-white/40 text-xs md:text-sm">
          <span>Mid-market PE funds</span>
          <span>Corporate M&amp;A teams</span>
          <span>Consumer &amp; beauty brands</span>
          <span>Industrial distributors</span>
          <span>Real estate investors</span>
        </div>
      </div>
    </section>
  );
}

/* ============ PRODUCT STRIP ============ */

function ProductStrip() {
  return (
    <section
      id="product"
      className="border-b border-white/10 bg-gradient-to-b from-black to-zinc-950"
    >
      <div className="max-w-7xl mx-auto px-6 py-14 md:py-18">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-2">
              One platform.
              <span className="text-emerald-400"> Zero fragmentation.</span>
            </h2>
            <p className="text-sm text-white/70 max-w-xl">
              Aria Cortex replaces the patchwork of PitchBook, Grata, ZoomInfo,
              Apollo, Clay, Lemlist, and spreadsheets with one origination
              engine.
            </p>
          </div>
          <p className="text-xs text-white/50 max-w-sm">
            From search to signed mandate, keep your team in a single
            environment built for dealmakers — not marketers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <ProductCard
            title="Global Company & Counterparty Search"
            description="Search companies, investors, distributors, brands, and real estate owners with advanced thesis filters."
            items={[
              "Keywords + NAICS-style filters",
              "Revenue / EBITDA / headcount bands",
              "Ownership, geography, and ESG tags",
            ]}
          />
          <ProductCard
            title="Investment & GTM DNA Scoring"
            description="AI scores every lead on fit, timing, and dealability — for both capital and distribution."
            items={[
              "Investment DNA for investors",
              "Go-to-Market DNA for distributors",
              "Red flags & fraud indicators",
            ]}
          />
          <ProductCard
            title="Pipeline & Mandate Management"
            description="Move from chaos to clarity with a live pipeline linked to your theses and campaigns."
            items={[
              "Mandate-level views",
              "Stage tracking & notes",
              "Export or sync to CRM",
            ]}
          />
          <ProductCard
            title="Outreach & Introductions"
            description="Trigger multi-channel outreach directly from Cortex and track replies by mandate."
            items={[
              "Sequenced outreach",
              "Per-mandate inbox view",
              "Intro tracking & reporting",
            ]}
          />
        </div>
      </div>
    </section>
  );
}

function ProductCard({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <div className="bg-zinc-950 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-semibold mb-2">{title}</h3>
        <p className="text-xs text-white/60 mb-3">{description}</p>
      </div>
      <ul className="text-[11px] text-white/55 space-y-1">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

/* ============ INVESTMENT DNA ============ */

function InvestmentDNA() {
  return (
    <section id="dna" className="border-b border-white/10 bg-black">
      <div className="max-w-7xl mx-auto px-6 py-14 md:py-18 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-3">
            Investment DNA and Dealability,
            <span className="text-emerald-400"> scored for you.</span>
          </h2>
          <p className="text-sm text-white/70 mb-4">
            Cortex doesn’t just tell you who exists. It tells you who is likely
            to transact, how, and with whom — across capital and distribution.
          </p>
          <ul className="text-xs text-white/70 space-y-2 mb-6">
            <li>• Fit Score: sector, size, geography, business model</li>
            <li>• Timing Score: growth trajectory, maturity, and signals</li>
            <li>• Dealability Score: ownership, complexity, friction</li>
            <li>• ESG & impact levers for sustainable mandates</li>
          </ul>
          <p className="text-xs text-white/50">
            All mapped to each mandate’s custom DNA profile — configurable for
            PE, growth, VC, corporates, distributors, and real estate.
          </p>
        </div>

        <div className="bg-zinc-950 border border-white/10 rounded-2xl p-4 text-xs">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-white/70">Mandate: EU Consumer Roll-up</span>
            <span className="text-emerald-300 text-[11px]">
              DNA model: Cortex-PE-Consumer-01
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Fit Score", value: "88%", tone: "High" },
              { label: "Timing", value: "76%", tone: "Good" },
              { label: "Dealability", value: "81%", tone: "High" },
              { label: "ESG Leverage", value: "69%", tone: "Moderate" },
            ].map((metric) => (
              <div
                key={metric.label}
                className="bg-zinc-900/80 border border-white/10 rounded-xl p-3"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] text-white/60">
                    {metric.label}
                  </span>
                  <span className="text-[11px] text-emerald-300">
                    {metric.tone}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400"
                    style={{ width: metric.value }}
                  />
                </div>
                <div className="mt-1 text-[10px] text-white/50">
                  {metric.value}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-3 mt-2 text-[11px] text-white/60">
            <div className="flex justify-between mb-1">
              <span>Top segments flagged</span>
              <span className="text-emerald-300">View 327 matches →</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                "Beauty & personal care",
                "Premium packaging",
                "Omnichannel brands",
              ].map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[10px]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ WORKFLOW SECTION ============ */

function WorkflowSection() {
  return (
    <section className="border-b border-white/10 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6 py-14 md:py-18">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-2">
              From thesis to meetings,
              <span className="text-emerald-400"> in one workflow.</span>
            </h2>
            <p className="text-sm text-white/70 max-w-xl">
              Cortex is built to get you in the room faster — not just give you
              more rows in a spreadsheet.
            </p>
          </div>
          <p className="text-xs text-white/50 max-w-sm">
            Align your team on one source of truth, one pipeline, and one
            outreach rhythm — across investors, targets, and distributors.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 md:gap-6 text-xs">
          <StepCard
            step="01"
            title="Define mandate & DNA"
            text="Set sector, size, geography, and strategic filters for your mandate. Cortex builds a custom DNA model."
          />
          <StepCard
            step="02"
            title="Map global opportunities"
            text="Search companies, investors, and distributors that match your DNA, globally — not just where legacy tools have data."
          />
          <StepCard
            step="03"
            title="Score & prioritize"
            text="Rank leads by fit, timing, dealability, and ESG. Focus on the 5–10% most likely to convert."
          />
          <StepCard
            step="04"
            title="Launch outreach & track intros"
            text="Trigger multi-touch campaigns, track replies by mandate, and measure meetings and conversions."
          />
        </div>
      </div>
    </section>
  );
}

function StepCard({
  step,
  title,
  text,
}: {
  step: string;
  title: string;
  text: string;
}) {
  return (
    <div className="bg-black border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
      <span className="text-[11px] text-emerald-300 font-mono">
        Step {step}
      </span>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="text-xs text-white/60">{text}</p>
    </div>
  );
}

/* ============ SOLUTIONS SECTION ============ */

function SolutionsSection() {
  return (
    <section id="solutions" className="border-b border-white/10 bg-black">
      <div className="max-w-7xl mx-auto px-6 py-14 md:py-18">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-2">
              Built for the way
              <span className="text-emerald-400"> modern deal teams</span> work.
            </h2>
            <p className="text-sm text-white/70 max-w-xl">
              Whether you deploy capital, acquire companies, or build
              distribution, Cortex adapts to your playbook.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6 text-xs">
          <SolutionCard
            title="Private Equity & Growth"
            body="Originate theses, build roll-up maps, and surface founder-led and sponsor-backed targets before your competitors."
            bullets={[
              "Thesis maps",
              "Add-on tracking",
              "Global private company search",
            ]}
          />
          <SolutionCard
            title="Corporate Development"
            body="Generate strategic target lists by product, tech, brand, or channel — plus market snapshots for your board."
            bullets={["Market maps", "Competitive landscapes", "M&A pipeline"]}
          />
          <SolutionCard
            title="Distributors, Brands & Real Estate"
            body="Find distributors, suppliers, brands, and properties that match your expansion DNA — and contact them in one place."
            bullets={[
              "Distributor mapping",
              "Brand & buyer data",
              "Owner & operator discovery",
            ]}
          />
        </div>
      </div>
    </section>
  );
}

function SolutionCard({
  title,
  body,
  bullets,
}: {
  title: string;
  body: string;
  bullets: string[];
}) {
  return (
    <div className="bg-zinc-950 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-semibold mb-2">{title}</h3>
        <p className="text-xs text-white/60 mb-3">{body}</p>
      </div>
      <ul className="text-[11px] text-white/55 space-y-1">
        {bullets.map((b) => (
          <li key={b}>• {b}</li>
        ))}
      </ul>
    </div>
  );
}

/* ============ GLOBAL COVERAGE ============ */

function GlobalCoverage() {
  return (
    <section className="border-b border-white/10 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6 py-14 md:py-18 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-3">
            Global by design,
            <span className="text-emerald-400"> not by marketing slide.</span>
          </h2>
          <p className="text-sm text-white/70 mb-4">
            Cortex is engineered from real mandates across Europe, the Middle
            East, Africa, India, the Americas, and LATAM — not just US-centric
            venture data.
          </p>
          <ul className="text-xs text-white/70 space-y-2 mb-6">
            <li>
              • Europe: DACH, Benelux, Nordics, UK &amp; Ireland, Iberia, CEE
            </li>
            <li>• MENA &amp; Africa: GCC, North &amp; Sub-Saharan Africa</li>
            <li>• Americas: US, Canada, Mexico, selected LATAM hubs</li>
            <li>• India &amp; selected APAC markets</li>
          </ul>
          <p className="text-xs text-white/50">
            Use Cortex to discover overlooked counterparties where legacy
            databases are blind — especially in emerging markets and fragmented
            sectors.
          </p>
        </div>

        <div className="bg-black border border-white/10 rounded-2xl p-5 text-xs">
          <p className="text-white/60 mb-3">
            Example: Distributor mapping mandate
          </p>
          <ul className="space-y-2 text-white/70">
            <li>• 42 countries covered in one search</li>
            <li>• 3,200+ distributors mapped for a single corporate mandate</li>
            <li>• 200+ high-fit targets prioritized by Dealability Score</li>
            <li>
              • Outreach launched directly from Cortex, not exported to CSV
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ============ COMPARISON PREVIEW ============ */

function ComparisonPreview() {
  return (
    <section id="compare" className="border-b border-white/10 bg-black">
      <div className="max-w-7xl mx-auto px-6 py-14 md:py-18">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-2">
              How Aria Cortex compares to
              <span className="text-emerald-400"> PitchBook &amp; Grata.</span>
            </h2>
            <p className="text-sm text-white/70 max-w-xl">
              Cortex doesn’t replace one tool. It replaces the patchwork behind
              your whole origination stack.
            </p>
          </div>
          <a
            href="/compare"
            className="text-xs text-emerald-300 hover:text-emerald-200 underline underline-offset-4"
          >
            View full comparison →
          </a>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="min-w-full border border-white/10 rounded-xl overflow-hidden">
            <thead className="bg-zinc-950/80">
              <tr>
                <th className="text-left px-4 py-3 border-b border-white/10 text-white/60">
                  Capability
                </th>
                <th className="text-left px-4 py-3 border-b border-white/10 text-white/60">
                  PitchBook
                </th>
                <th className="text-left px-4 py-3 border-b border-white/10 text-white/60">
                  Grata
                </th>
                <th className="text-left px-4 py-3 border-b border-white/10 text-emerald-300">
                  Aria Cortex
                </th>
              </tr>
            </thead>
            <tbody className="bg-black/80">
              {comparisonRows.map((row, idx) => (
                <tr
                  key={row.capability}
                  className={idx % 2 === 0 ? "bg-black" : "bg-zinc-950/60"}
                >
                  <td className="px-4 py-3 border-b border-white/10 text-white/70">
                    {row.capability}
                  </td>
                  <td className="px-4 py-3 border-b border-white/10 text-white/60">
                    {row.pitchbook}
                  </td>
                  <td className="px-4 py-3 border-b border-white/10 text-white/60">
                    {row.grata}
                  </td>
                  <td className="px-4 py-3 border-b border-white/10 text-emerald-300">
                    {row.cortex}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

const comparisonRows = [
  {
    capability: "Global private company coverage",
    pitchbook: "Strong in US/UK, limited elsewhere",
    grata: "Good mid-market coverage",
    cortex: "Global + distributors + emerging markets",
  },
  {
    capability: "Distributor & channel intelligence",
    pitchbook: "No",
    grata: "No",
    cortex: "Yes – built-in",
  },
  {
    capability: "Investment & GTM DNA scoring",
    pitchbook: "No",
    grata: "No",
    cortex: "Native engine",
  },
  {
    capability: "Outreach & introductions",
    pitchbook: "Requires external tools",
    grata: "Requires external tools",
    cortex: "Integrated",
  },
  {
    capability: "Emerging market fit",
    pitchbook: "Weak",
    grata: "Limited",
    cortex: "Designed for it",
  },
];

/* ============ TESTIMONIALS ============ */

function TestimonialsSection() {
  return (
    <section className="border-b border-white/10 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6 py-14 md:py-18">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">
          What dealmakers say about
          <span className="text-emerald-400"> this way of working.</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6 text-xs">
          <TestimonialCard
            quote="We used to jump between three data tools and two outreach platforms. Cortex compresses that into one pipeline."
            role="Partner, mid-market PE (EU)"
          />
          <TestimonialCard
            quote="For distributor mapping across 20+ countries, legacy databases were blind. Cortex actually shows you who exists and who is relevant."
            role="Head of International, consumer brand"
          />
          <TestimonialCard
            quote="Dealability scoring is what makes the difference. Our team finally starts with the right 10% of leads."
            role="Director, corporate development"
          />
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ quote, role }: { quote: string; role: string }) {
  return (
    <div className="bg-black border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
      <p className="text-xs text-white/80 mb-3">“{quote}”</p>
      <p className="text-[11px] text-white/50">{role}</p>
    </div>
  );
}

/* ============ PRICING TEASER ============ */

function PricingTeaser() {
  return (
    <section id="pricing" className="border-b border-white/10 bg-black">
      <div className="max-w-7xl mx-auto px-6 py-14 md:py-18">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-2">
              Pricing that reflects
              <span className="text-emerald-400"> value created</span>, not
              seats.
            </h2>
            <p className="text-sm text-white/70 max-w-xl mb-3">
              Cortex is structured for serious teams who care about net new
              dealflow — not vanity logins.
            </p>
            <p className="text-xs text-white/50 max-w-md">
              Engagements typically combine a platform subscription with aligned
              success fees for closed deals. Exact pricing depends on team size,
              geographies, and mandate complexity.
            </p>
          </div>

          <div className="bg-zinc-950 border border-emerald-500/40 rounded-2xl p-5 text-xs max-w-sm">
            <p className="text-[11px] text-emerald-300 mb-2 uppercase tracking-wide">
              Typical starting points
            </p>
            <ul className="space-y-2 text-white/70 mb-4">
              <li>• Platform subscription from €2.5K–€10K / month</li>
              <li>• Optional success fee overlays (1–2% typical)</li>
              <li>• Add-ons for social, landing pages, and revamp work</li>
            </ul>
            <p className="text-[11px] text-white/60 mb-3">
              One good recurring client or transaction typically pays for the
              platform several times over.
            </p>
            <button className="w-full mt-2 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition">
              Discuss pricing &amp; structure
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ FINAL CTA ============ */

function FinalCTA() {
  return (
    <section className="border-b border-white/10 bg-gradient-to-r from-emerald-500/10 via-black to-emerald-500/10">
      <div className="max-w-7xl mx-auto px-6 py-14 md:py-18 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-2">
            Ready to see Aria Cortex
            <span className="text-emerald-400"> on your mandates?</span>
          </h2>
          <p className="text-sm text-white/70 max-w-xl">
            Share your current focus — sector, region, and ticket range — and
            we’ll show you how Cortex would map and score your universe.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold transition">
            Book a 30-minute demo
          </button>
          <button className="px-5 py-2.5 rounded-full border border-white/20 text-sm text-white/80 hover:border-emerald-400 hover:text-white transition">
            Get sample deal map
          </button>
        </div>
      </div>
    </section>
  );
}

/* ============ FOOTER ============ */

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12">
        {/* PRODUCTS */}
        <div>
          <h3 className="text-emerald-400 font-semibold mb-4 uppercase tracking-wide text-sm">
            Products
          </h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li>Origination Engine</li>
            <li>Market Intelligence</li>
            <li>AI Investment DNA</li>
            <li>Global Company Search</li>
            <li>Live Mandates</li>
            <li>Pipeline Manager</li>
            <li>Cortex API</li>
            <li>Data Warehouse</li>
          </ul>
        </div>

        {/* SOLUTIONS */}
        <div>
          <h3 className="text-emerald-400 font-semibold mb-4 uppercase tracking-wide text-sm">
            Solutions
          </h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li>Private Equity</li>
            <li>Growth Equity</li>
            <li>Venture Investors</li>
            <li>Investment Banking</li>
            <li>Corporate Development</li>
            <li>Distributors &amp; Brands</li>
            <li>Real Estate Investors</li>
            <li>Family Offices</li>
            <li>Private Credit</li>
            <li>Consulting</li>
          </ul>
        </div>

        {/* FEATURES */}
        <div>
          <h3 className="text-emerald-400 font-semibold mb-4 uppercase tracking-wide text-sm">
            Features
          </h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li>Smart Deal Sourcing</li>
            <li>Buyer &amp; Investor Matching</li>
            <li>Distributor Mapping</li>
            <li>Conference Intelligence</li>
            <li>Live Deal Signals</li>
            <li>CRM Sync</li>
            <li>Pipeline Management</li>
            <li>Fraud &amp; Red Flag Checks</li>
            <li>Public &amp; Private Comps</li>
            <li>Market Opportunity Maps</li>
            <li>Industry Research</li>
            <li>Relationship Intelligence</li>
          </ul>
        </div>

        {/* COMPANY */}
        <div>
          <h3 className="text-emerald-400 font-semibold mb-4 uppercase tracking-wide text-sm">
            Company
          </h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li>About Aria Ventures</li>
            <li>Why Aria Cortex</li>
            <li>Careers</li>
            <li>Partners</li>
            <li>Press &amp; Media</li>
            <li>Market Insights</li>
            <li>Referral Program</li>
            <li>Terms &amp; Pricing</li>
          </ul>
        </div>

        {/* COMPARE / TECH / DATA */}
        <div>
          <h3 className="text-emerald-400 font-semibold mb-4 uppercase tracking-wide text-sm">
            Compare
          </h3>
          <ul className="space-y-2 text-sm text-white/80 mb-6">
            <li>
              <a href="/compare" className="hover:text-emerald-400">
                Aria Cortex vs PitchBook vs Grata
              </a>
            </li>
            <li>Aria Cortex vs PitchBook</li>
            <li>Aria Cortex vs Grata</li>
            <li>Aria Cortex vs SourceScrub</li>
            <li>Aria Cortex vs ZoomInfo</li>
            <li>Aria Cortex vs Dealroom</li>
          </ul>

          <h3 className="text-emerald-400 font-semibold mb-4 uppercase tracking-wide text-sm">
            Technology
          </h3>
          <ul className="space-y-2 text-sm text-white/80 mb-6">
            <li>AI Technology</li>
            <li>The Cortex Engine</li>
            <li>Matching Algorithm</li>
            <li>ESG &amp; Dealability Models</li>
          </ul>

          <h3 className="text-emerald-400 font-semibold mb-4 uppercase tracking-wide text-sm">
            Data
          </h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li>Global Coverage</li>
            <li>Data Sources</li>
            <li>Data Quality</li>
            <li>Compliance &amp; Privacy</li>
          </ul>
        </div>

        {/* PLATFORM */}
        <div>
          <h3 className="text-emerald-400 font-semibold mb-4 uppercase tracking-wide text-sm">
            Platform
          </h3>
          <ul className="space-y-2 text-sm text-white/80 mb-6">
            <li>Log In</li>
            <li>Get Started</li>
          </ul>

          <h3 className="text-emerald-400 font-semibold mb-4 uppercase tracking-wide text-sm">
            Get the App
          </h3>
          <div className="flex flex-col gap-3 mt-4">
            <div className="h-10 w-32 bg-white/10 rounded-md flex items-center justify-center text-xs text-white/60">
              App Store (Soon)
            </div>
            <div className="h-10 w-32 bg-white/10 rounded-md flex items-center justify-center text-xs text-white/60">
              Google Play (Soon)
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 mt-10 py-6 text-center text-sm text-white/60">
        ©2025 Aria Ventures. All Rights Reserved.
      </div>
    </footer>
  );
}
