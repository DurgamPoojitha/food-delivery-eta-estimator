/**
 * App.jsx
 * =======
 * Purpose:
 *   Root application component. Currently renders the single Home page.
 *
 * Design Rationale (Thin App Shell):
 *   - App.jsx is deliberately minimal — it's the right place to add:
 *       • A router (react-router-dom) if the app grows to multiple pages
 *       • A global error boundary (React.ErrorBoundary)
 *       • A global context provider (theme, auth state, etc.)
 *   - Keeping it empty now avoids premature abstraction while establishing
 *     the correct architectural seam.
 */

import Home from './pages/Home'

function App() {
  return <Home />
}

export default App
