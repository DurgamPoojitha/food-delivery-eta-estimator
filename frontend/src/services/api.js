/**
 * services/api.js
 * ===============
 * Purpose:
 *   Centralised Axios HTTP client and typed API call for the DeliverIQ backend.
 *
 * Design Rationale (Service Layer Pattern):
 *   - Components should NEVER call axios.post() directly. All HTTP logic lives
 *     here so we can change the backend URL, add auth headers, or mock responses
 *     in one place without touching any component.
 *   - A single Axios instance with a shared baseURL means the backend origin
 *     is configured once: via VITE_API_URL in production, or via Vite's proxy
 *     (empty base URL = same-origin) in development.
 *   - The 15-second timeout is intentionally explicit: fail fast and surface
 *     network issues to users rather than spinning forever.
 *
 * Dev vs Prod URL strategy:
 *   Development:
 *     VITE_API_URL is empty → baseURL = '' → requests go to the same origin
 *     → Vite proxy intercepts /api/* and forwards to http://localhost:8000
 *
 *   Production (Vercel):
 *     VITE_API_URL = 'https://deliveriq-api.onrender.com'
 *     → requests go directly to Render backend
 *     → CORS_ORIGINS on the backend must include the Vercel domain
 */

import axios from 'axios'

// ── Axios instance ────────────────────────────────────────────────────────────
const apiClient = axios.create({
  // Empty string in dev (proxy handles routing), full URL in prod
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
  timeout: 15_000, // 15 seconds — generous enough for cold-start on Render free tier
})


// ── API functions ─────────────────────────────────────────────────────────────

/**
 * estimateETA
 * -----------
 * Sends a POST /api/estimate request to the DeliverIQ backend.
 *
 * @param {Object} payload
 * @param {string}  payload.restaurant_name  - Restaurant display name
 * @param {number}  payload.restaurant_lat   - Restaurant latitude (-90 to 90)
 * @param {number}  payload.restaurant_lon   - Restaurant longitude (-180 to 180)
 * @param {number}  payload.delivery_lat     - Delivery latitude (-90 to 90)
 * @param {number}  payload.delivery_lon     - Delivery longitude (-180 to 180)
 * @param {number}  payload.prep_time        - Food prep time in minutes (0–180)
 * @param {string}  payload.traffic          - 'low' | 'medium' | 'high'
 *
 * @returns {Promise<{
 *   restaurant_name: string,
 *   distance_km: number,
 *   travel_time_minutes: number,
 *   prep_time_minutes: number,
 *   total_eta: number,
 *   delivery_status: string
 * }>}
 *
 * @throws {AxiosError} On network failure, timeout, or non-2xx HTTP status.
 *   The caller (Home.jsx) is responsible for catching and displaying errors.
 */
export const estimateETA = async (payload) => {
  const response = await apiClient.post('/api/estimate', payload)
  return response.data
}

export default apiClient
