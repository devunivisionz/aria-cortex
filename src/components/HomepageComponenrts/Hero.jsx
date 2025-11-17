export default function Hero(){
  return (
    <section className="max-w-6xl mx-auto px-4 py-20 md:py-28">
      <div className="grid md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-7">
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
            See opportunity <span className="text-emeraldCore">before the market does</span>.
          </h1>
          <p className="mt-5 text-lg text-muted max-w-2xl">
            Aria Cortex is an AI‑powered origination system. It unifies best‑in‑class data sources and uses an
            investor‑grade matching engine to deliver verified, thesis‑fit opportunities—every week.
          </p>
          <div className="mt-8 flex gap-3">
            <a href="#demo" className="px-5 py-3 rounded-2xl bg-emeraldCore text-white font-medium shadow-soft">Request a demo</a>
            <a href="#how" className="px-5 py-3 rounded-2xl border border-white/20 hover:border-white/40">How it works</a>
          </div>
          <div className="mt-6 text-sm text-muted">
            5–10 seats • SSO • Explain‑why matches • Human verification
          </div>
        </div>
        <div className="md:col-span-5">
          <div className="card rounded-2xl p-6">
            <div className="text-sm text-muted mb-2">Live preview</div>
            <div className="rounded-xl p-4 bg-black/40 border border-white/10">
              <div className="text-xs text-muted">Investment DNA → Logic Model</div>
              <div className="mt-2 text-base">AI thinks like your IC.</div>
              <div className="mt-3 text-xs text-muted">Favorites &nbsp;•&nbsp; Request‑a‑Match &nbsp;•&nbsp; Explain‑why</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}