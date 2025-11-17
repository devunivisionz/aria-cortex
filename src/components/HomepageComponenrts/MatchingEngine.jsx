export default function MatchingEngine(){
  return (
    <section id="data" className="max-w-6xl mx-auto px-4 py-16">
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold">AI‑matching that thinks like an investor</h2>
          <ul className="mt-5 space-y-3 text-sm text-muted">
            <li><span className="text-white">Adaptive scoring:</span> strategic fit, timing, similarity, geography, thematic alignment.</li>
            <li><span className="text-white">Feedback learning:</span> Favorites, Rejects, Request‑a‑Match continuously refine internal weights.</li>
            <li><span className="text-white">Symmetric matching:</span> companies ↔ investors ↔ distributors ↔ partners.</li>
            <li><span className="text-white">Explainable results:</span> shared growth, tech adoption, expansion, investor overlap, ESG profile.</li>
          </ul>
        </div>
        <div className="card rounded-2xl p-6">
          <h3 className="font-medium">Data coverage</h3>
          <p className="mt-2 text-muted text-sm">
            100+ providers via Clay + licensed partners, plus live web signals (press, hiring, RFPs). Millions of private entities across EU/UK/US (+ selected LATAM/MEA/APAC).
          </p>
          <div className="mt-4 text-xs text-muted">
            The power isn’t raw volume—it’s the AI layer that learns your mandate and serves only high‑fit, live targets.
          </div>
        </div>
      </div>
    </section>
  )
}