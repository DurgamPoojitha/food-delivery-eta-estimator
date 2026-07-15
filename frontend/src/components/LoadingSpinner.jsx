import { SparklesIcon } from '@heroicons/react/24/outline'

const LoadingSpinner = () => {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 animate-fade-in"
      role="status"
      aria-label="Calculating your delivery ETA"
      aria-live="polite"
    >
      
      <div className="relative w-24 h-24">
        
        <div className="absolute inset-0 rounded-full border-4 border-slate-700 border-t-brand-orange animate-spin-slow" />

        
        <div
          className="absolute inset-3 rounded-full border-4 border-transparent border-b-orange-400"
          style={{ animation: 'spin 1.1s linear infinite reverse' }}
        />

        
        <div
          className="absolute inset-6 rounded-full border-2 border-transparent border-r-brand-orange"
          style={{ animation: 'spin 0.8s linear infinite' }}
        />

        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-brand-orange animate-pulse-soft" />
        </div>
      </div>

      
      <p className="mt-8 text-slate-300 text-sm font-bold tracking-widest uppercase">
        Calculating ETA...
      </p>
      <p className="mt-2 text-slate-500 text-xs flex items-center gap-1.5 font-medium">
        Crunching the numbers <SparklesIcon className="w-4 h-4 text-brand-orange" />
      </p>

      
      <div className="flex items-center gap-1.5 mt-4">
        {[0, 0.2, 0.4].map((delay, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-brand-orange/60 animate-pulse-soft"
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </div>
    </div>
  )
}

export default LoadingSpinner
