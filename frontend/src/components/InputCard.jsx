import { useState } from 'react'
import {
  MapPinIcon,
  Cog6ToothIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'

const TRAFFIC_OPTIONS = [
  { value: 'low',    label: 'Low (1x)',      icon: <ChartBarIcon className="w-6 h-6" />, activeClass: 'border-green-500 bg-green-500/10 text-green-400' },
  { value: 'medium', label: 'Medium (1.4x)', icon: <ChartBarIcon className="w-6 h-6" />, activeClass: 'border-yellow-500 bg-yellow-500/10 text-yellow-400' },
  { value: 'high',   label: 'High (2x)',     icon: <ChartBarIcon className="w-6 h-6" />, activeClass: 'border-red-500 bg-red-500/10 text-red-400' },
]

const BUSY_OPTIONS = [
  { value: 'low',    label: 'Low (+0 min)' },
  { value: 'medium', label: 'Medium (+5 min)' },
  { value: 'high',   label: 'High (+10 min)' },
]

const PEAK_OPTIONS = [
  { value: 'none',   label: 'None (+0 min)' },
  { value: 'lunch',  label: 'Lunch Rush (+8 min)' },
  { value: 'dinner', label: 'Dinner Rush (+12 min)' },
]


const INITIAL_STATE = {
  restaurant_name: '',
  prep_time:       '',
  traffic:         'medium',
  busy_level:      'medium',
  peak_hour:       'none',
  is_weekend:      false,
}

const isValidLat  = (v) => v !== '' && !isNaN(Number(v)) && Number(v) >= -90  && Number(v) <= 90
const isValidLon  = (v) => v !== '' && !isNaN(Number(v)) && Number(v) >= -180 && Number(v) <= 180
const isValidPrep = (v) => v !== '' && !isNaN(Number(v)) && parseInt(v, 10) >= 0 && parseInt(v, 10) <= 180

const validate = (form, coords) => {
  const errors = {}
  if (!form.restaurant_name.trim())       errors.restaurant_name = 'Required'
  if (!isValidLat(coords.restaurantLat))  errors.restaurantLat  = '−90 to 90'
  if (!isValidLon(coords.restaurantLon))  errors.restaurantLon  = '−180 to 180'
  if (!isValidLat(coords.deliveryLat))    errors.deliveryLat    = '−90 to 90'
  if (!isValidLon(coords.deliveryLon))    errors.deliveryLon    = '−180 to 180'
  if (!isValidPrep(form.prep_time))       errors.prep_time       = '0 – 180 min'
  return errors
}

const Field = ({ label, id, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="field-label">{label}</label>
    {children}
    {error && (
      <p className="text-xs text-red-400 flex items-center gap-1.5 animate-fade-in">
        <span aria-hidden="true">⚠</span><span>{error}</span>
      </p>
    )}
  </div>
)

const SectionHeader = ({ icon, iconBg, title }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
      {icon}
    </div>
    <h2 className="text-white font-bold tracking-wide">{title}</h2>
  </div>
)

const Divider = () => <div className="h-px bg-white/5" />

const InputCard = ({ 
  onSubmit, 
  isLoading,
  restaurantLat,
  restaurantLon,
  deliveryLat,
  deliveryLon,
  onRestaurantLatChange,
  onRestaurantLonChange,
  onDeliveryLatChange,
  onDeliveryLonChange
}) => {
  const [form,   setForm]   = useState(INITIAL_STATE)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value
    setForm((prev) => ({ ...prev, [name]: val }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const clearCoordError = (field) => {
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const handleTraffic = (value) => setForm((prev) => ({ ...prev, traffic: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const coords = { restaurantLat, restaurantLon, deliveryLat, deliveryLon }
    const validationErrors = validate(form, coords)
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    onSubmit({
      restaurant_name: form.restaurant_name.trim(),
      restaurant_lat:  parseFloat(restaurantLat),
      restaurant_lon:  parseFloat(restaurantLon),
      delivery_lat:    parseFloat(deliveryLat),
      delivery_lon:    parseFloat(deliveryLon),
      prep_time:       parseInt(form.prep_time, 10),
      traffic:         form.traffic,
      busy_level:      form.busy_level,
      peak_hour:       form.peak_hour,
      is_weekend:      form.is_weekend,
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="glass-panel rounded-3xl p-8 flex flex-col gap-8 animate-slide-up">
      
      <section>
        <SectionHeader icon={<MapPinIcon className="w-5 h-5" />} iconBg="bg-blue-500/10 text-blue-400 border border-blue-500/20" title="Locations & Prep" />
        <div className="flex flex-col gap-4">
          <Field label="Restaurant Name" id="restaurant_name" error={errors.restaurant_name}>
            <input id="restaurant_name" name="restaurant_name" type="text" value={form.restaurant_name} onChange={handleChange} placeholder="e.g. Burger Palace" className={`field ${errors.restaurant_name ? 'error' : ''}`} disabled={isLoading} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Rest. Lat" id="restaurant_lat" error={errors.restaurantLat}>
              <input id="restaurant_lat" type="number" step="any" value={restaurantLat} onChange={(e) => { onRestaurantLatChange(e.target.value); clearCoordError('restaurantLat') }} placeholder="51.5074" className={`field ${errors.restaurantLat ? 'error' : ''}`} disabled={isLoading} />
            </Field>
            <Field label="Rest. Lon" id="restaurant_lon" error={errors.restaurantLon}>
              <input id="restaurant_lon" type="number" step="any" value={restaurantLon} onChange={(e) => { onRestaurantLonChange(e.target.value); clearCoordError('restaurantLon') }} placeholder="-0.1278" className={`field ${errors.restaurantLon ? 'error' : ''}`} disabled={isLoading} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Deliv. Lat" id="delivery_lat" error={errors.deliveryLat}>
              <input id="delivery_lat" type="number" step="any" value={deliveryLat} onChange={(e) => { onDeliveryLatChange(e.target.value); clearCoordError('deliveryLat') }} placeholder="51.5155" className={`field ${errors.deliveryLat ? 'error' : ''}`} disabled={isLoading} />
            </Field>
            <Field label="Deliv. Lon" id="delivery_lon" error={errors.deliveryLon}>
              <input id="delivery_lon" type="number" step="any" value={deliveryLon} onChange={(e) => { onDeliveryLonChange(e.target.value); clearCoordError('deliveryLon') }} placeholder="-0.0922" className={`field ${errors.deliveryLon ? 'error' : ''}`} disabled={isLoading} />
            </Field>
          </div>
          <Field label="Base Prep Time (min)" id="prep_time" error={errors.prep_time}>
            <input id="prep_time" name="prep_time" type="number" min="0" max="180" value={form.prep_time} onChange={handleChange} placeholder="15" className={`field ${errors.prep_time ? 'error' : ''}`} disabled={isLoading} />
          </Field>
        </div>
      </section>

      <Divider />

      
      <section>
        <SectionHeader icon={<Cog6ToothIcon className="w-5 h-5" />} iconBg="bg-purple-500/10 text-purple-400 border border-purple-500/20" title="Delivery Conditions" />
        <div className="flex flex-col gap-5">
          
          <div>
            <label className="field-label mb-2 block">Traffic Multiplier</label>
            <div className="grid grid-cols-3 gap-3" role="radiogroup">
              {TRAFFIC_OPTIONS.map(({ value, label, icon, activeClass }) => {
                const isActive = form.traffic === value
                return (
                  <button key={value} type="button" onClick={() => handleTraffic(value)} disabled={isLoading} className={`flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-xl border text-sm font-medium transition-all ${isActive ? `${activeClass} scale-[1.02] shadow-lg` : 'border-slate-700/50 bg-slate-800/30 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}>
                    {icon}
                    <span className="text-xs">{label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Restaurant Busy Level" id="busy_level">
              <select name="busy_level" value={form.busy_level} onChange={handleChange} disabled={isLoading} className="field select-icon">
                {BUSY_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-slate-900 text-white">{o.label}</option>)}
              </select>
            </Field>

            <Field label="Peak Hour Dispatch" id="peak_hour">
              <select name="peak_hour" value={form.peak_hour} onChange={handleChange} disabled={isLoading} className="field select-icon">
                {PEAK_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-slate-900 text-white">{o.label}</option>)}
              </select>
            </Field>
          </div>


          <label className="flex items-center gap-4 p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 cursor-pointer hover:bg-slate-700/50 hover:border-slate-600 transition-colors group">
            <input type="checkbox" name="is_weekend" checked={form.is_weekend} onChange={handleChange} disabled={isLoading} className="w-5 h-5 rounded bg-slate-900 border-slate-600 text-brand-orange focus:ring-brand-orange focus:ring-offset-slate-800" />
            <div className="flex flex-col">
              <span className="text-white font-semibold text-sm group-hover:text-brand-orange transition-colors">Weekend Delivery Surge</span>
              <span className="text-slate-400 text-xs mt-0.5">+5 min flat delay</span>
            </div>
          </label>
        </div>
      </section>

      
      <button id="estimate-btn" type="submit" disabled={isLoading} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Estimating...
          </>
        ) : (
          'Estimate Realistic ETA'
        )}
      </button>
    </form>
  )
}

export default InputCard
