export default function Footer(){
  return (
    <footer className="border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-10 text-sm text-muted flex items-center justify-between">
        <div>&copy; {new Date().getFullYear()} Aria Ventures — Aria Cortex</div>
        <div className="flex gap-4">
          <a href="#how" className="hover:text-white">How it works</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
          <a href="#demo" className="hover:text-white">Request demo</a>
        </div>
      </div>
    </footer>
  )
}