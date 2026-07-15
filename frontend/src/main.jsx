/**
 * main.jsx
 * ========
 * Purpose:
 *   React application entry point. Mounts the root <App /> component into
 *   the DOM node with id="root" (defined in index.html).
 *
 * Design Rationale:
 *   - React.StrictMode is enabled deliberately:
 *       • Double-invokes lifecycle methods in development to surface impure
 *         render functions, unexpected side effects, and deprecated APIs.
 *       • Has ZERO impact on the production build — it's stripped out.
 *       • This is a senior engineer habit: catch issues early, not in prod.
 *   - index.css is imported here (not in App.jsx) so Tailwind's global base
 *     styles and our custom layers load before any component renders.
 */

import React    from 'react'
import ReactDOM from 'react-dom/client'
import App      from './App'
import 'leaflet/dist/leaflet.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
