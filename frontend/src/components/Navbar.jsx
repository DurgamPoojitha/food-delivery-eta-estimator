import { MapPin } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

const NAV_LINKS = ['Estimator', 'How it Works', 'Features', 'About']

const Navbar = ({ theme, onToggle, activeSection, onNavClick }) => (
  <header
    className="sticky top-0 z-50"
    style={{
      backgroundColor: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}
  >
    <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
      <div className="flex items-center gap-2.5 shrink-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <MapPin size={15} color="white" strokeWidth={2.5} />
        </div>
        <div className="leading-none">
          <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>DeliverIQ</span>
          <span className="text-xs block" style={{ color: 'var(--color-text-muted)' }}>Smart Delivery ETA</span>
        </div>
      </div>

      <nav className="hidden md:flex items-center gap-1">
        {NAV_LINKS.map((link) => (
          <button
            key={link}
            onClick={() => onNavClick?.(link)}
            className={`nav-link ${activeSection === link ? 'active' : ''}`}
          >
            {link}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2 shrink-0">
        <div
          className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-muted)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-success-500" style={{ backgroundColor: 'var(--color-success)' }} />
          Live Status
        </div>
        <ThemeToggle theme={theme} onToggle={onToggle} />
      </div>
    </div>
  </header>
)

export default Navbar
