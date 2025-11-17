export default function Pricing(){
  return (
    <section id="pricing" className="max-w-6xl mx-auto px-4 py-16">
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold">Pricing</h2>
          <p className="mt-3 text-muted text-sm">Core subscription — <span className="text-white font-medium">€10K/month</span></p>
          <ul className="mt-4 text-sm text-muted space-y-2">
            <li>Includes: unified data, AI‑matching, Favorites + Request‑a‑Match, explain‑why, verified opportunities, saved segments, monthly reporting.</li>
            <li>5–10 seats, SSO, role permissions; focused match quota; first verified matches within 10 business days; weekly drops.</li>
            <li>Outcome economics (optional): 1–2% success fee or milestone fees per LOI/term sheet.</li>
            <li>Enterprise & API: private tenant, custom connectors, GDPR, audit trails (+€3K–€6K/mo).</li>
            <li>Geography & Thesis Packs: +€1.5K–€2.5K/mo each; White‑Glove Origination Pod: +€3K–€8K/mo.</li>
          </ul>
        </div>
        <div className="card rounded-2xl p-6">
          <h3 className="font-medium">Commercial guardrails</h3>
          <ul className="mt-3 text-sm text-muted space-y-2">
            <li>3–6 month initial term, then monthly.</li>
            <li>No exclusivity unless negotiated per vertical/geo.</li>
            <li>You own all relationships and data generated.</li>
          </ul>
          <a href="#demo" className="mt-6 inline-block px-5 py-3 rounded-2xl bg-emeraldCore text-white font-medium shadow-soft">Start your precision plan</a>
        </div>
      </div>
    </section>
  )
}