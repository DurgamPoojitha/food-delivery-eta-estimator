import { MapIcon, ArrowTrendingUpIcon, ClockIcon } from '@heroicons/react/24/outline'

const HOW_IT_WORKS = [
  {
    icon:  <MapIcon className="w-8 h-8" />,
    title: 'Haversine Base',
    desc:  'Calculates the exact great-circle distance between the restaurant and your location.',
  },
  {
    icon:  <ArrowTrendingUpIcon className="w-8 h-8" />,
    title: 'Traffic Modifiers',
    desc:  'Base travel time scales dynamically based on live traffic conditions (1x to 2x).',
  },
  {
    icon:  <ClockIcon className="w-8 h-8" />,
    title: 'Advanced Delays',
    desc:  'Adds flat delays for peak hours, busy kitchens, weekend surges, and heavy weather.',
  },
]

const Hero = () => (
  <>
    
    <div className="text-center mb-16 animate-fade-in">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
        Rules Engine v3.0 Active
      </div>
      <h2 className="text-white text-5xl sm:text-6xl font-black leading-tight mb-5 tracking-tight">
        Next-Gen Delivery
        <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-yellow-400">
          Routing Intelligence
        </span>
      </h2>
      <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
        Enter your coordinates and delivery conditions to get a precise, real-world ETA 
        powered by our advanced business rules engine.
      </p>
    </div>

    
    <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fade-in pb-10">
      {HOW_IT_WORKS.map(({ icon, title, desc }) => (
        <div key={title} className="glass-panel rounded-2xl p-6 text-center group hover:-translate-y-1 transition-all duration-300">
          <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-slate-800/50 border border-white/5 flex items-center justify-center text-brand-orange group-hover:scale-110 group-hover:bg-brand-orange/10 group-hover:border-brand-orange/20 transition-all duration-300">
            {icon}
          </div>
          <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
        </div>
      ))}
    </div>
  </>
)

export default Hero
