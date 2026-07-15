import { BoltIcon } from '@heroicons/react/24/solid'
import { SparklesIcon } from '@heroicons/react/24/outline'

const Navbar = () => (
  <header className="sticky top-0 z-50 border-b border-white/5 glass bg-navy-900/80 backdrop-blur-xl">
    <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
      
      
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-orange to-orange-600 flex items-center justify-center shadow-glow-orange shrink-0">
          <BoltIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-white font-black text-xl tracking-tight leading-none">
            Deliver<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-orange-400">IQ</span>
          </h1>
          <p className="text-slate-400 text-xs font-medium leading-none mt-1">
            Pro Routing Engine
          </p>
        </div>
      </div>

      
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/20">
        <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse-soft" />
        <span className="text-brand-orange text-xs font-semibold tracking-wide">Live Estimator</span>
        <SparklesIcon className="w-4 h-4 text-brand-orange/70" />
      </div>
    </div>
  </header>
)

export default Navbar
