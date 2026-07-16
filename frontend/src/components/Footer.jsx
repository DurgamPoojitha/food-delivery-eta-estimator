const Footer = () => (
  <footer className="border-t border-gray-800 mt-8">
    <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
      <p className="text-xs text-gray-600">
        © {new Date().getFullYear()} DeliverIQ — Foodhub Engineering
      </p>
      <div className="flex gap-4 text-xs text-gray-600">
        <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="hover:text-gray-400 transition-colors">API Docs</a>
        <a href="https://github.com/DurgamPoojitha/food-delivery-eta-estimator" target="_blank" rel="noreferrer" className="hover:text-gray-400 transition-colors">GitHub</a>
      </div>
    </div>
  </footer>
)

export default Footer
