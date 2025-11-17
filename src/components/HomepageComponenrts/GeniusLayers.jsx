export default function GeniusLayers(){
  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <h2 className="text-2xl md:text-3xl font-semibold">The “Genius” layers</h2>
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="card rounded-2xl p-6">
          <h3 className="font-medium">Adaptive Learning Loop</h3>
          <p className="mt-2 text-muted text-sm">Each action updates weights on 30+ features (sector, size, signals, similarity) with lightweight boosting + reinforcement feedback.</p>
        </div>
        <div className="card rounded-2xl p-6">
          <h3 className="font-medium">Explainability Layer</h3>
          <p className="mt-2 text-muted text-sm">Every match carries a human‑readable “why‑matched” vector (growth, tech overlap, funding recency). Transparency builds trust.</p>
        </div>
        <div className="card rounded-2xl p-6">
          <h3 className="font-medium">Relational Intelligence Graph</h3>
          <p className="mt-2 text-muted text-sm">Graph database linking investors ↔ companies ↔ advisors ↔ distributors; enables Request‑a‑Match replication in one click.</p>
        </div>
        <div className="card rounded-2xl p-6">
          <h3 className="font-medium">Continuous Signal Fusion</h3>
          <p className="mt-2 text-muted text-sm">APIs monitor funding, hiring, press, expansion; momentum signals feed scoring (De Prado‑style quantitative factors).</p>
        </div>
        <div className="card rounded-2xl p-6">
          <h3 className="font-medium">Self‑Optimizing Mandate Logic</h3>
          <p className="mt-2 text-muted text-sm">System proposes refinements: “Based on your last 50 approvals, you favor founder‑led firms &lt; 50 employees in DACH.”</p>
        </div>
        <div className="card rounded-2xl p-6">
          <h3 className="font-medium">Design & Commercials</h3>
          <p className="mt-2 text-muted text-sm">Dalio logic • Hassabis AI • Hoffman networks • De Prado stats. €10K/mo core, optional success fees, enterprise/API add‑ons.</p>
        </div>
      </div>
    </section>
  )
}