/**
 * components/Footer.jsx
 * =====================
 * The standard application footer.
 */

const Footer = () => (
  <footer className="mt-24 border-t border-white/5 py-10 bg-navy-900/50">
    <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex flex-col items-center sm:items-start gap-1">
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()}{' '}
          <span className="text-slate-300 font-semibold tracking-wide">DeliverIQ</span>
        </p>
        <p className="text-slate-600 text-xs">
          Built for Foodhub Engineering
        </p>
      </div>
      
      <div className="flex gap-6 text-sm text-slate-500 font-medium">
        <a href="#" className="hover:text-brand-orange transition-colors">Documentation</a>
        <a href="#" className="hover:text-brand-orange transition-colors">API Reference</a>
        <a href="#" className="hover:text-brand-orange transition-colors">Status</a>
      </div>
    </div>
  </footer>
)

export default Footer
