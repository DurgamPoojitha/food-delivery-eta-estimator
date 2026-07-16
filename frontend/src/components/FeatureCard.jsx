const FeatureCard = ({ icon, title, subtitle }) => (
  <div
    className="flex items-start gap-3 p-4 rounded-xl"
    style={{ border: '1px solid var(--color-border)' }}
  >
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
      style={{ backgroundColor: 'var(--color-primary-bg)' }}
    >
      <span style={{ color: 'var(--color-primary)' }}>{icon}</span>
    </div>
    <div>
      <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{title}</p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{subtitle}</p>
    </div>
  </div>
)

export default FeatureCard
