export default function HowItWorks(){
  return (
    <section id="how" className="max-w-6xl mx-auto px-4 py-16">
      <h2 className="text-2xl md:text-3xl font-semibold">How it works</h2>
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <div className="card rounded-2xl p-6">
          <h3 className="font-medium">1) DNA Mapping → Logic Model</h3>
          <p className="mt-2 text-muted text-sm">
            Define sector, size, stage, geo, ownership, growth profile, exclusions. Cortex transforms this into a multi‑variable logic model of “fit”.
          </p>
        </div>
        <div className="card rounded-2xl p-6">
          <h3 className="font-medium">2) Signal Fusion Layer</h3>
          <p className="mt-2 text-muted text-sm">
            Financials, hiring, funding, tech stacks, partnerships, web signals (press, RFPs, expansion). The AI fuses these into live opportunity vectors.
          </p>
        </div>
        <div className="card rounded-2xl p-6">
          <h3 className="font-medium">3) Verified Delivery</h3>
          <p className="mt-2 text-muted text-sm">
            Matches are explainable and human‑verified before they land in your queue—no noise, only live, high‑fit targets.
          </p>
        </div>
      </div>
    </section>
  )
}