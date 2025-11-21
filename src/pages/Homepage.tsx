import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * Aria Cortex – Homepage (Killer-level PMF clarity)
 * - Hero ICP: Mid-market PE / growth funds (then corporate M&A, then brands/distributors, then advisors).
 * - Seriousness filter: funds €50M+ AUM; corporates/brands €30M+ revenue.
 * - Geography: Europe, Middle East, USA, global markets.
 * - Product-first: platform as origination engine, services as performance-aligned add-on.
 */

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="bg-black text-white font-inter">
      {/* NAVBAR */}
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-sm bg-emerald-500" />
            <span className="font-semibold tracking-wide">Aria Cortex</span>
          </div>

          <nav className="hidden md:flex gap-8 text-sm">
            <a href="#who" className="hover:text-emerald-400">
              Who it’s for
            </a>
            <a href="#pain" className="hover:text-emerald-400">
              Why change
            </a>
            <a href="#how" className="hover:text-emerald-400">
              How it works
            </a>
            <a href="#dna" className="hover:text-emerald-400">
              Investment DNA
            </a>
            <a href="#proof" className="hover:text-emerald-400">
              Proof
            </a>
            <a href="#pricing" className="hover:text-emerald-400">
              Pricing
            </a>
          </nav>
          <button
            onClick={() => navigate("/login")}
            className="hidden md:inline-flex px-3 py-1.5 rounded-full text-xs border border-white/20 text-white/80 hover:border-emerald-400 hover:text-white transition"
          >
            Log in
          </button>
          <button className="px-4 py-2 rounded-md bg-emerald-500 hover:bg-emerald-600 text-sm font-medium">
            Request a Demo
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="pt-24 md:pt-32 pb-20 max-w-7xl mx-auto px-6 text-center md:text-left">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              AI Origination Engine
              <span className="block text-emerald-400 mt-2">
                for mid-market funds & acquirers
              </span>
            </h1>

            <p className="mt-6 text-base md:text-lg text-white/70 max-w-xl">
              Aria Cortex replaces manual, noisy deal sourcing with an AI engine
              that scores every company against your{" "}
              <span className="font-medium text-white">Investment DNA</span> —
              so your team works a disciplined pipeline of targets you might
              actually close, not just whatever happens to reach your inbox.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button className="px-6 py-3 rounded-md bg-emerald-500 hover:bg-emerald-600 text-base font-medium">
                Talk to Sales
              </button>
              <button className="px-6 py-3 rounded-md border border-white/20 hover:border-white/40 text-base">
                Watch Product Walkthrough
              </button>
            </div>

            <p className="mt-4 text-xs text-white/45 max-w-xl">
              Built for mid-market PE & growth funds first, then corporate
              M&amp;A teams and brands/distributors expanding across{" "}
              <span className="text-white font-medium">
                Europe, the Middle East, the USA and global markets.
              </span>
            </p>
            <p className="mt-1 text-xs text-white/45">
              We typically work with funds managing{" "}
              <span className="font-medium text-white">€50M+ AUM</span> and
              corporates/brands with{" "}
              <span className="font-medium text-white">
                €30M+ in annual revenue.
              </span>
            </p>
          </div>

          {/* Simple “engine” visual */}
          <div className="md:justify-self-end">
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
              <p className="text-xs uppercase tracking-wide text-white/40">
                Aria Cortex · Origination Flow
              </p>
              <div className="mt-4 space-y-4 text-sm">
                <EngineRow
                  label="Inputs"
                  items={[
                    "Mandates & investment thesis",
                    "Regions, ticket sizes, ownership constraints",
                    "Signals from Clay / Apollo / web & internal notes",
                  ]}
                />
                <EngineRow
                  label="Engine"
                  items={[
                    "Investment DNA weighting per mandate",
                    "Multi-layer company signals & anomaly checks",
                    "Explain-why matching & ranking logic",
                  ]}
                />
                <EngineRow
                  label="Outputs"
                  items={[
                    "Ranked target lists per mandate",
                    "IC-ready snapshots for each company",
                    "Live pipeline by stage, region and sponsor",
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section id="who" className="py-16 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-semibold">
            Who Aria Cortex is for
          </h2>
          <p className="mt-3 text-white/65 max-w-2xl text-sm md:text-base">
            This is not a prosumer tool. Aria Cortex is built for teams that
            treat origination as a core, repeatable discipline.
          </p>

          <p className="mt-3 text-xs md:text-sm text-white/50">
            Typical clients: funds managing{" "}
            <span className="font-medium text-white">€50M+</span> AUM, and
            corporates/brands above{" "}
            <span className="font-medium text-white">€30M</span> annual revenue.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <WhoCard
              title="Mid-market PE & growth funds"
              text="Deal teams running 1–5 live mandates and needing a consistent, thesis-aligned pipeline instead of one-off lists."
            />
            <WhoCard
              title="Corporate M&A & strategy"
              text="Strategic acquirers and corporate development teams mapping targets across regions, products and business units."
            />
            <WhoCard
              title="Manufacturers & distributors"
              text="Brands and manufacturers looking for new distributors, suppliers or partners with clear financial and operational fit."
            />
            <WhoCard
              title="Advisors & transaction services"
              text="Law firms, accounting and intelligence/marketing firms that need dealflow and partner mapping for their clients."
            />
          </div>
        </div>
      </section>

      {/* PAIN / WHY CHANGE */}
      <section
        id="pain"
        className="py-20 bg-neutral-950 border-t border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold">
              Why your current origination is broken
            </h2>
            <p className="mt-4 text-white/70 text-sm md:text-base">
              Most teams rely on a messy mix of databases, bankers, inbound and
              spreadsheets. The result: noisy deal flow, reactive decisions and
              a lot of time wasted on opportunities that were never executable
              in the first place.
            </p>
          </div>

          <div className="space-y-4 text-sm md:text-base">
            <PainPoint
              title="Fragmented data"
              text="Multiple tools, no unified scoring, and no single view of companies across mandates, regions and sponsors."
            />
            <PainPoint
              title="Manual, junior-heavy sourcing"
              text="Associates and analysts spend hundreds of hours clicking around tools instead of progressing real deals."
            />
            <PainPoint
              title="No shared definition of 'good'"
              text="Each deal looks unique; the investment committee has no standardised way to compare or prioritise targets."
            />
            <PainPoint
              title="Random, not systematic"
              text="Deal flow is driven by who emails you and which banker calls that week, not by a deliberate search across your universe."
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-semibold">
            How Aria Cortex works
          </h2>
          <p className="mt-3 text-white/70 max-w-2xl text-sm md:text-base">
            A structured origination system that turns your thesis into a live,
            ranked pipeline instead of a static memo.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10">
            <Step
              number="01"
              title="Define your Investment DNA & mandates"
              text="We codify how your team actually approves deals: sectors, regions, ticket sizes, risk tolerance, ownership, timing and more."
            />
            <Step
              number="02"
              title="Cortex scans and scores your universe"
              text="Signals from financials, hiring, web, funding, tech stack and more are fused into a single score per company per mandate."
            />
            <Step
              number="03"
              title="You work a ranked, explainable pipeline"
              text="Your team sees ranked targets per mandate, with explain-why cards and IC-ready snapshots. No more random lists or gut-feel spreadsheets."
            />
          </div>
        </div>
      </section>

      {/* INVESTMENT DNA ENGINE */}
      <section
        id="dna"
        className="py-24 bg-gradient-to-b from-black to-neutral-900 border-t border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-semibold">
            Investment DNA: your IC logic, quantified
          </h2>
          <p className="mt-3 text-white/70 max-w-2xl text-sm md:text-base">
            The Investment DNA engine mirrors how your investment committee
            thinks — so Aria Cortex doesn’t just match keywords, it matches how
            you actually say “yes”.
          </p>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card
              title="Financial strength"
              text="Revenue, margins, leverage, cash, efficiency and resilience."
            />
            <Card
              title="Strategic fit"
              text="Sector, geography, customer type, product adjacency and market structure."
            />
            <Card
              title="Dealability"
              text="Ownership, readiness, governance, complexity and deal process risk."
            />
            <Card
              title="Operational readiness"
              text="Team depth, scalability, processes and technology maturity."
            />
            <Card
              title="Risk & anomaly checks"
              text="Outliers, inconsistencies and patterns that don’t survive serious scrutiny."
            />
            <Card
              title="Timing & intent"
              text="Hiring moves, web signals, funding behaviour and partner appetite."
            />
          </div>
        </div>
      </section>

      {/* ENGINE / INTELLIGENCE + PROOF */}
      <section id="engine" className="py-24 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-semibold">
            Multi-layer intelligence, one score per target
          </h2>
          <p className="mt-3 text-white/70 max-w-2xl text-sm md:text-base">
            Aria Cortex fuses dozens of datasets into a single, explainable
            score per company — so you can stop debating sources and start
            debating decisions, across Europe, the Middle East, the USA and
            selected global markets.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10">
            <Feature
              title="Real-time signals"
              text="Hiring, web traffic, funding, news and other time-sensitive indicators."
            />
            <Feature
              title="Deep company data"
              text="Structure, ownership, financials and historical performance where available."
            />
            <Feature
              title="Technology stack"
              text="What they run under the hood, from ecommerce tooling to marketing and infra."
            />
            <Feature
              title="Team composition"
              text="Executive depth, key hires and changes that matter for execution."
            />
            <Feature
              title="Competitive context"
              text="Who else plays the same game and how saturated the space really is."
            />
            <Feature
              title="IC-ready snapshots"
              text="Compact, AI-generated profiles you can drop straight into an investment memo."
            />
          </div>
        </div>
      </section>

      {/* PROOF SECTION */}
      <section
        id="proof"
        className="py-24 bg-neutral-950 border-t border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-semibold">
            Proven in live mandates
          </h2>
          <p className="mt-3 text-white/70 max-w-2xl text-sm md:text-base">
            Aria Cortex is built from real mandates, not slides. For over a
            decade, the workflows behind Cortex have delivered hundreds of
            qualified matches per client across funds, corporates and advisors.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm md:text-base">
            <ProofStat
              label="Technology consolidation strategy"
              value="200+ acquisition opportunities sourced for a single technology roll-up strategy."
            />
            <ProofStat
              label="Investment bank mandate"
              value="5,600+ targets mapped across Europe for an investment bank, yielding 3 immediate investor meetings and ~30 warming conversations."
            />
            <ProofStat
              label="Distributors, football & marketing"
              value="50 distributors shortlisted for European expansion; 20 PE groups approached for a European football club sale (10 meetings, 1 close); 100+ qualified meetings generated for a marketing firm."
            />
          </div>
        </div>
      </section>

      {/* PRICING */}
      <PricingSection />

      {/* FINAL CTA */}
      <footer className="py-16 bg-black border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h3 className="text-2xl md:text-3xl font-semibold">
            Ready to stop doing origination by hand?
          </h3>
          <p className="mt-3 text-sm md:text-base text-white/70 max-w-2xl mx-auto">
            If you’re running serious mandates and want a disciplined, AI-driven
            pipeline instead of disconnected tools and spreadsheets, Aria Cortex
            is built for you.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-md font-medium text-sm md:text-base">
              Talk to Sales
            </button>
            <button className="px-6 py-3 rounded-md border border-white/20 hover:border-white/40 text-sm md:text-base">
              Request Product Demo
            </button>
          </div>
          <p className="mt-10 text-xs text-white/35">
            © {new Date().getFullYear()} Aria Cortex. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* SUBCOMPONENTS */

function EngineRow({ label, items }) {
  return (
    <div>
      <p className="text-xs font-semibold text-white/60">{label}</p>
      <ul className="mt-1 space-y-1 text-xs text-white/70">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

function WhoCard({ title, text }) {
  return (
    <div className="bg-neutral-900 border border-white/10 rounded-xl p-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-3 text-sm text-white/70">{text}</p>
    </div>
  );
}

function PainPoint({ title, text }) {
  return (
    <div className="bg-neutral-900 border border-white/10 rounded-xl p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-xs md:text-sm text-white/70">{text}</p>
    </div>
  );
}

function Step({ number, title, text }) {
  return (
    <div className="bg-neutral-900 p-8 rounded-xl border border-white/10">
      <div className="text-emerald-400 font-bold text-xl">{number}</div>
      <h3 className="mt-3 text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-white/70">{text}</p>
    </div>
  );
}

function Card({ title, text }) {
  return (
    <div className="bg-neutral-900 p-8 rounded-xl border border-white/10">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-3 text-sm text-white/70">{text}</p>
    </div>
  );
}

function Feature({ title, text }) {
  return (
    <div className="bg-neutral-900 p-8 rounded-xl border border-white/10 h-full">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-3 text-sm text-white/70">{text}</p>
    </div>
  );
}

function ProofStat({ label, value }) {
  return (
    <div className="bg-neutral-900 border border-white/10 rounded-xl p-5">
      <p className="text-xs uppercase tracking-wide text-white/40">{label}</p>
      <p className="mt-2 text-sm text-white/80">{value}</p>
    </div>
  );
}

/* PRICING SECTION – platform-first, performance-aligned services */

function PricingSection() {
  const tiers = [
    {
      name: "Analyst",
      price: "€1,500 / month",
      billing: "Billed annually · €18,000 / year",
      description:
        "For solo investors and small teams validating a focused thesis with a disciplined pipeline.",
      outcome:
        "Designed to support ~1 live mandate with a steady stream of qualified, scored targets each month.",
      features: [
        "1–2 named user seats",
        "1 active mandate (sector / region)",
        "Focused region coverage",
        "Structured pipeline of scored companies each month",
        "Core signals & Investment DNA scoring",
        "Standard support via email",
      ],
      highlighted: false,
    },
    {
      name: "Fund",
      price: "€4,500 / month",
      billing: "Billed annually · €54,000 / year",
      description:
        "For funds and M&A teams running multiple mandates across regions and strategies.",
      outcome:
        "Designed to support 2–3 live mandates with a continuous flow of ranked, IC-ready opportunities.",
      features: [
        "Up to 5 named user seats",
        "Up to 3 active mandates in parallel",
        "Multi-region coverage",
        "Institutional-grade signals (tech, hiring, funding, web)",
        "Portfolio tagging, segments & custom views",
        "Priority support & quarterly strategy reviews",
      ],
      highlighted: true,
    },
    {
      name: "Institutional",
      price: "From €9,000 / month",
      billing: "Typical contracts €100k+ / year",
      description:
        "For institutions standardising origination across desks, geographies and product lines.",
      outcome:
        "Designed to embed a shared origination engine across multiple teams, regions and strategies.",
      features: [
        "10+ named user seats",
        "Unlimited mandates (by strategy, region or product line)",
        "Global coverage across defined universes",
        "High-volume scoring with fair-use safeguards",
        "Custom Investment DNA models per strategy",
        "API, SSO & enterprise governance",
        "Dedicated success team & SLA",
      ],
      highlighted: false,
    },
  ];

  return (
    <section
      id="pricing"
      className="py-32 bg-neutral-900 border-t border-white/5"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold">
            Pricing for institutional origination
          </h2>
          <p className="mt-4 text-sm md:text-base text-white/60">
            Aria Cortex is the origination layer for investors, funds and
            corporate M&amp;A teams. Plans are sold on annual contracts, and we
            onboard a limited number of new teams each quarter.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10">
          {tiers.map((tier) => (
            <PricingCard key={tier.name} tier={tier} />
          ))}
        </div>

        <div className="mt-10 max-w-3xl mx-auto text-center text-sm md:text-base text-white/55">
          <p>
            For most clients,{" "}
            <span className="text-white font-medium">
              one additional closed deal per year
            </span>{" "}
            more than covers the annual Aria Cortex subscription.
          </p>
        </div>

        <div className="mt-8 max-w-3xl mx-auto text-center text-sm md:text-base text-white/60">
          <p>
            Need full{" "}
            <span className="text-white font-medium">
              Origination-as-a-Service
            </span>{" "}
            — including mapping, outreach and introductions on top of the
            platform, with a{" "}
            <span className="text-emerald-400 font-medium">
              performance-aligned retainer + upside model
            </span>
            ? Request a custom proposal.
          </p>
        </div>
      </div>
    </section>
  );
}

function PricingCard({ tier }) {
  const { name, price, billing, description, outcome, features, highlighted } =
    tier;

  return (
    <div
      className={
        "flex flex-col h-full rounded-xl border bg-neutral-900 p-8 md:p-10 " +
        (highlighted
          ? "border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.35)]"
          : "border-white/10")
      }
    >
      <div className="flex-1">
        <h3 className="text-xl font-semibold">{name}</h3>

        <p className="mt-6 text-3xl font-bold">{price}</p>
        <p className="mt-2 text-xs uppercase tracking-wide text-white/40">
          {billing}
        </p>

        <p className="mt-4 text-sm text-white/70">{description}</p>
        <p className="mt-3 text-sm text-white/80 italic">{outcome}</p>

        <ul className="mt-6 space-y-2 text-sm text-white/70">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        className={
          "mt-8 w-full py-3 rounded-md text-sm font-medium " +
          (highlighted
            ? "bg-emerald-500 hover:bg-emerald-600 text-black"
            : "bg-white/5 hover:bg-white/10 text-white")
        }
      >
        {name === "Institutional" ? "Speak to Aria Team" : "Talk to Sales"}
      </button>
    </div>
  );
}
