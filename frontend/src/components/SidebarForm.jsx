import { useState, useEffect } from 'react'
import { MapPin, Clock, ChevronDown, ArrowRight, Shield, AlertCircle } from 'lucide-react'

const TRAFFIC_OPTIONS  = ['Low', 'Medium', 'High']
const BUSY_OPTIONS     = [
  { value: 'low',    label: 'Normal Hours' },
  { value: 'medium', label: 'Slightly Busy' },
  { value: 'high',   label: 'Dinner Peak' },
]
const PEAK_OPTIONS     = [
  { value: 'none',   label: 'No Peak' },
  { value: 'lunch',  label: 'Lunch Rush' },
  { value: 'dinner', label: 'Dinner Rush' },
]

const INITIAL = {
  restaurant_name: '',
  prep_time:       '20',
  traffic:         'medium',
  busy_level:      'medium',
  peak_hour:       'none',
  is_weekend:      false,
}

const isValidLat  = (v) => v !== '' && !isNaN(Number(v)) && Number(v) >= -90  && Number(v) <= 90
const isValidLon  = (v) => v !== '' && !isNaN(Number(v)) && Number(v) >= -180 && Number(v) <= 180
const isValidPrep = (v) => v !== '' && !isNaN(Number(v)) && parseInt(v, 10) >= 0 && parseInt(v, 10) <= 180

const validate = (form, coords) => {
  const e = {}
  if (!form.restaurant_name.trim())      e.restaurant_name = 'Required'
  if (!isValidLat(coords.restaurantLat)) e.restaurantLat   = 'Invalid latitude'
  if (!isValidLon(coords.restaurantLon)) e.restaurantLon   = 'Invalid longitude'
  if (!isValidLat(coords.deliveryLat))   e.deliveryLat     = 'Invalid latitude'
  if (!isValidLon(coords.deliveryLon))   e.deliveryLon     = 'Invalid longitude'
  if (!isValidPrep(form.prep_time))      e.prep_time       = '0–180 min'
  return e
}

const CoordInput = ({ id, label, value, onChange, error, placeholder }) => (
  <div>
    <label className="field-label" htmlFor={id}>{label}</label>
    <input
      id={id}
      type="number"
      step="any"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`field ${error ? 'field-error' : ''}`}
    />
    {error && (
      <p className="flex items-center gap-1 mt-1 text-xs" style={{ color: 'var(--color-danger)' }}>
        <AlertCircle size={11} />{error}
      </p>
    )}
  </div>
)

const SectionHeader = ({ number, title }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="section-number">{number}</div>
    <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{title}</h3>
  </div>
)

const SidebarForm = ({
  onSubmit,
  isLoading,
  restaurantLat,
  restaurantLon,
  deliveryLat,
  deliveryLon,
  onRestaurantLatChange,
  onRestaurantLonChange,
  onDeliveryLatChange,
  onDeliveryLonChange,
}) => {
  const [form,   setForm]   = useState(INITIAL)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const buildPayload = () => ({
    restaurant_name: form.restaurant_name.trim(),
    restaurant_lat:  parseFloat(restaurantLat),
    restaurant_lon:  parseFloat(restaurantLon),
    delivery_lat:    parseFloat(deliveryLat),
    delivery_lon:    parseFloat(deliveryLon),
    prep_time:       parseInt(form.prep_time || 0, 10),
    traffic:         form.traffic,
    busy_level:      form.busy_level,
    peak_hour:       form.peak_hour,
    is_weekend:      form.is_weekend,
  })

  useEffect(() => {
    if (restaurantLat && restaurantLon && deliveryLat && deliveryLon && form.restaurant_name.trim()) {
      const coords = { restaurantLat, restaurantLon, deliveryLat, deliveryLon }
      if (Object.keys(validate(form, coords)).length === 0) onSubmit(buildPayload())
    }
  }, [restaurantLat, restaurantLon, deliveryLat, deliveryLon, form.traffic, form.busy_level, form.peak_hour, form.is_weekend])

  const handleSubmit = (e) => {
    e.preventDefault()
    const coords = { restaurantLat, restaurantLon, deliveryLat, deliveryLon }
    const errs = validate(form, coords)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    onSubmit(buildPayload())
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card h-full flex flex-col overflow-hidden">
      <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>Estimate Delivery Time</h2>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Enter locations and delivery conditions</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
        <div>
          <SectionHeader number="1" title="Pickup Location (Restaurant)" />
          <div className="flex flex-col gap-3">
            <div>
              <label className="field-label" htmlFor="restaurant_name">Restaurant name</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-sub)' }} />
                <input
                  id="restaurant_name"
                  name="restaurant_name"
                  type="text"
                  value={form.restaurant_name}
                  onChange={handleChange}
                  placeholder="Search for a place or click on map"
                  className={`field pl-8 ${errors.restaurant_name ? 'field-error' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.restaurant_name && (
                <p className="flex items-center gap-1 mt-1 text-xs" style={{ color: 'var(--color-danger)' }}>
                  <AlertCircle size={11} />{errors.restaurant_name}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <CoordInput id="r_lat" label="Latitude"  value={restaurantLat} onChange={(e) => { onRestaurantLatChange(e.target.value); setErrors((p) => ({ ...p, restaurantLat: undefined })) }} error={errors.restaurantLat} placeholder="17.3850" />
              <CoordInput id="r_lon" label="Longitude" value={restaurantLon} onChange={(e) => { onRestaurantLonChange(e.target.value); setErrors((p) => ({ ...p, restaurantLon: undefined })) }} error={errors.restaurantLon} placeholder="78.4867" />
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
          <SectionHeader number="2" title="Delivery Location (Customer)" />
          <div className="flex flex-col gap-3">
            <div>
              <label className="field-label" htmlFor="delivery_search">Delivery address</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-primary)' }} />
                <input
                  id="delivery_search"
                  type="text"
                  placeholder="Search for a place or click on map"
                  className="field pl-8"
                  disabled={isLoading}
                  readOnly
                  value={deliveryLat ? `${Number(deliveryLat).toFixed(4)}, ${Number(deliveryLon).toFixed(4)}` : ''}
                  style={{ cursor: 'default' }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <CoordInput id="d_lat" label="Latitude"  value={deliveryLat} onChange={(e) => { onDeliveryLatChange(e.target.value); setErrors((p) => ({ ...p, deliveryLat: undefined })) }} error={errors.deliveryLat} placeholder="17.4065" />
              <CoordInput id="d_lon" label="Longitude" value={deliveryLon} onChange={(e) => { onDeliveryLonChange(e.target.value); setErrors((p) => ({ ...p, deliveryLon: undefined })) }} error={errors.deliveryLon} placeholder="78.4590" />
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
          <SectionHeader number="3" title="Delivery Conditions" />
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="field-label" htmlFor="prep_time">Preparation time (mins)</label>
                <div className="relative">
                  <Clock size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-sub)' }} />
                  <input
                    id="prep_time"
                    name="prep_time"
                    type="number"
                    min="0"
                    max="180"
                    value={form.prep_time}
                    onChange={handleChange}
                    className={`field pl-8 ${errors.prep_time ? 'field-error' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.prep_time && <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.prep_time}</p>}
              </div>
              <div>
                <label className="field-label" htmlFor="traffic">Traffic level</label>
                <div className="relative">
                  <select
                    id="traffic"
                    name="traffic"
                    value={form.traffic}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="select-field"
                  >
                    {TRAFFIC_OPTIONS.map((t) => (
                      <option key={t} value={t.toLowerCase()}>{t}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-sub)' }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="field-label" htmlFor="busy_level">Busy hours</label>
                <div className="relative">
                  <select
                    id="busy_level"
                    name="busy_level"
                    value={form.busy_level}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="select-field"
                  >
                    {BUSY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="field-label" htmlFor="peak_hour">Peak hour</label>
                <div className="relative">
                  <select
                    id="peak_hour"
                    name="peak_hour"
                    value={form.peak_hour}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="select-field"
                  >
                    {PEAK_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                name="is_weekend"
                checked={form.is_weekend}
                onChange={handleChange}
                disabled={isLoading}
                className="w-4 h-4 rounded"
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Weekend surge <span style={{ color: 'var(--color-text-sub)' }}>(+5 min)</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 flex flex-col gap-3" style={{ borderTop: '1px solid var(--color-border)' }}>
        <button id="estimate-btn" type="submit" disabled={isLoading} className="btn-primary w-full">
          {isLoading
            ? <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Calculating...
              </>
            : <><ArrowRight size={15} /> Estimate Delivery Time</>
          }
        </button>
        <div className="flex items-center justify-center gap-1.5 text-xs" style={{ color: 'var(--color-text-sub)' }}>
          <Shield size={11} />
          Your data is secure and never stored
        </div>
      </div>
    </form>
  )
}

export default SidebarForm
