/**
 * components/LoadingSpinner.jsx
 * =============================
 * Purpose:
 *   Displays an animated multi-ring loading indicator while the ETA
 *   API call is in-flight.
 *
 * Design Rationale:
 *   - Extracted into its own component (Single Responsibility) so it can
 *     be reused anywhere in the app that needs a loading state.
 *   - Three concentric rings spinning at different speeds and directions
 *     convey "calculating / processing" rather than a generic loading state,
 *     which reinforces the app's "precision ETA" mental model.
 *   - The `role="status"` and `aria-label` attributes ensure screen readers
 *     announce the loading state — accessibility is not optional.
 *   - The inner pulsing dot adds a heartbeat-like quality — the system is
 *     alive and working.
 */

import { SparklesIcon } from '@heroicons/react/24/outline'

const LoadingSpinner = () => {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 animate-fade-in"
      role="status"
      aria-label="Calculating your delivery ETA"
      aria-live="polite"
    >
      {/* ── Spinner rings ─────────────────────────────────────── */}
      <div className="relative w-24 h-24">
        {/* Outer ring — slow clockwise orange spin */}
        <div className="absolute inset-0 rounded-full border-4 border-slate-700 border-t-brand-orange animate-spin-slow" />

        {/* Middle ring — faster counter-clockwise */}
        <div
          className="absolute inset-3 rounded-full border-4 border-transparent border-b-orange-400"
          style={{ animation: 'spin 1.1s linear infinite reverse' }}
        />

        {/* Inner ring — medium clockwise */}
        <div
          className="absolute inset-6 rounded-full border-2 border-transparent border-r-brand-orange"
          style={{ animation: 'spin 0.8s linear infinite' }}
        />

        {/* Centre dot — pulsing */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-brand-orange animate-pulse-soft" />
        </div>
      </div>

      {/* ── Labels ───────────────────────────────────────────── */}
      <p className="mt-8 text-slate-300 text-sm font-bold tracking-widest uppercase">
        Calculating ETA...
      </p>
      <p className="mt-2 text-slate-500 text-xs flex items-center gap-1.5 font-medium">
        Crunching the numbers <SparklesIcon className="w-4 h-4 text-brand-orange" />
      </p>

      {/* ── Animated dots ─────────────────────────────────────── */}
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
