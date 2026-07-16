const Navbar = () => (
  <header className="sticky top-0 z-50 bg-gray-950 border-b border-gray-800">
    <div className="max-w-screen-xl mx-auto px-6 h-12 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-orange-500 font-bold text-base tracking-tight">DeliverIQ</span>
        <span className="text-gray-600 text-xs mt-0.5">/ ETA Estimator</span>
      </div>

      <nav className="flex items-center gap-1">
        <a
          href="#"
          className="text-xs text-gray-400 hover:text-gray-100 px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors"
        >
          Docs
        </a>
        <a
          href="http://localhost:8000/docs"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-gray-400 hover:text-gray-100 px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors"
        >
          API
        </a>
        <a
          href="https://github.com/DurgamPoojitha/food-delivery-eta-estimator"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-gray-400 hover:text-gray-100 px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors"
        >
          GitHub
        </a>
        <span className="ml-2 flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Live
        </span>
      </nav>
    </div>
  </header>
)

export default Navbar
