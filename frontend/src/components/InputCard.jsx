import { useState, useEffect } from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'

const TRAFFIC_OPTIONS = [
  { value: 'low',    label: 'Low',    sub: '1x' },
  { value: 'medium', label: 'Medium', sub: '1.4x' },
  { value: 'high',   label: 'High',   sub: '2x' },
]

const BUSY_OPTIONS = [
  { value: 'low',    label: 'Low (+0 min)' },
  { value: 'medium', label: 'Medium (+5 min)' },
  { value: 'high',   label: 'High (+10 min)' },
]

const PEAK_OPTIONS = [
  { value: 'none',   label: 'None' },
  { value: 'lunch',  label: 'Lunch (+8 min)' },
  { value: 'dinner', label: 'Dinner (+12 min)' },
]

const INITIAL = {
  restaurant_name: '',
  prep_time:       '15',
  traffic:         'medium',
  busy_level:      'medium',
  peak_hour:       'none',
  is_weekend:      false,
}

const isValidLat = (v) => v !== '' && !isNaN(Number(v)) && Number(v) >= -90  && Number(v) <= 90
const isValidLon = (v) => v !== '' && !isNaN(Number(v)) && Number(v) >= -180 && Number(v) <= 180
const isValidPrep = (v) => v !== '' && !isNaN(Number(v)) && parseInt(v, 10) >= 0 && parseInt(v, 10) <= 180

const validate = (form, coords) => {
  const errors = {}
  if (!form.restaurant_name.trim())      errors.restaurant_name = 'Required'
  if (!isValidLat(coords.restaurantLat)) errors.restaurantLat   = 'Invalid (−90 to 90)'
  if (!isValidLon(coords.restaurantLon)) errors.restaurantLon   = 'Invalid (−180 to 180)'
  if (!isValidLat(coords.deliveryLat))   errors.deliveryLat     = 'Invalid (−90 to 90)'
  if (!isValidLon(coords.deliveryLon))   errors.deliveryLon     = 'Invalid (−180 to 180)'
  if (!isValidPrep(form.prep_time))      errors.prep_time       = '0–180 min'
  return errors
}

const FieldError = ({ message }) => (
  <p className="flex items-center gap-1 text-xs text-red-400 mt-1">
    <ExclamationCircleIcon className="w-3.5 h-3.5 shrink-0" />
    {message}
  </p>
)

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
  onDeliveryLonChange,
}) => {
  const [form,   setForm]   = useState(INITIAL)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value
    setForm((prev) => ({ ...prev, [name]: val }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const clearCoordError = (field) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
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
    if (restaurantLat !== '' && restaurantLon !== '' && deliveryLat !== '' && deliveryLon !== '') {
      if (form.restaurant_name.trim() !== '') {
        const coords = { restaurantLat, restaurantLon, deliveryLat, deliveryLon }
        if (Object.keys(validate(form, coords)).length === 0) {
          onSubmit(buildPayload())
        }
      }
    }
  }, [restaurantLat, restaurantLon, deliveryLat, deliveryLon, form.traffic, form.busy_level, form.peak_hour, form.is_weekend])

  const handleSubmit = (e) => {
    e.preventDefault()
    const coords = { restaurantLat, restaurantLon, deliveryLat, deliveryLon }
    const validationErrors = validate(form, coords)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    onSubmit(buildPayload())
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Location</span>
        </div>
        <div className="px-4 py-4 flex flex-col gap-3">
          <div>
            <label className="input-label block mb-1" htmlFor="restaurant_name">Restaurant name</label>
            <input
              id="restaurant_name"
              name="restaurant_name"
              type="text"
              value={form.restaurant_name}
              onChange={handleChange}
              placeholder="e.g. Burger Palace"
              className={`input-field ${errors.restaurant_name ? 'error' : ''}`}
              disabled={isLoading}
            />
            {errors.restaurant_name && <FieldError message={errors.restaurant_name} />}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label block mb-1" htmlFor="restaurant_lat">Rest. latitude</label>
              <input
                id="restaurant_lat"
                type="number"
                step="any"
                value={restaurantLat}
                onChange={(e) => { onRestaurantLatChange(e.target.value); clearCoordError('restaurantLat') }}
                placeholder="51.5074"
                className={`input-field ${errors.restaurantLat ? 'error' : ''}`}
                disabled={isLoading}
              />
              {errors.restaurantLat && <FieldError message={errors.restaurantLat} />}
            </div>
            <div>
              <label className="input-label block mb-1" htmlFor="restaurant_lon">Rest. longitude</label>
              <input
                id="restaurant_lon"
                type="number"
                step="any"
                value={restaurantLon}
                onChange={(e) => { onRestaurantLonChange(e.target.value); clearCoordError('restaurantLon') }}
                placeholder="-0.1278"
                className={`input-field ${errors.restaurantLon ? 'error' : ''}`}
                disabled={isLoading}
              />
              {errors.restaurantLon && <FieldError message={errors.restaurantLon} />}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label block mb-1" htmlFor="delivery_lat">Customer latitude</label>
              <input
                id="delivery_lat"
                type="number"
                step="any"
                value={deliveryLat}
                onChange={(e) => { onDeliveryLatChange(e.target.value); clearCoordError('deliveryLat') }}
                placeholder="51.5155"
                className={`input-field ${errors.deliveryLat ? 'error' : ''}`}
                disabled={isLoading}
              />
              {errors.deliveryLat && <FieldError message={errors.deliveryLat} />}
            </div>
            <div>
              <label className="input-label block mb-1" htmlFor="delivery_lon">Customer longitude</label>
              <input
                id="delivery_lon"
                type="number"
                step="any"
                value={deliveryLon}
                onChange={(e) => { onDeliveryLonChange(e.target.value); clearCoordError('deliveryLon') }}
                placeholder="-0.0922"
                className={`input-field ${errors.deliveryLon ? 'error' : ''}`}
                disabled={isLoading}
              />
              {errors.deliveryLon && <FieldError message={errors.deliveryLon} />}
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Delivery parameters</span>
        </div>
        <div className="px-4 py-4 flex flex-col gap-4">
          <div>
            <label className="input-label block mb-1" htmlFor="prep_time">Base prep time (min)</label>
            <input
              id="prep_time"
              name="prep_time"
              type="number"
              min="0"
              max="180"
              value={form.prep_time}
              onChange={handleChange}
              className={`input-field ${errors.prep_time ? 'error' : ''}`}
              disabled={isLoading}
            />
            {errors.prep_time && <FieldError message={errors.prep_time} />}
          </div>

          <div>
            <label className="input-label block mb-2">Traffic</label>
            <div className="grid grid-cols-3 gap-2">
              {TRAFFIC_OPTIONS.map(({ value, label, sub }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, traffic: value }))}
                  disabled={isLoading}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors text-center ${
                    form.traffic === value
                      ? 'bg-orange-500/10 border-orange-500/60 text-orange-400'
                      : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300'
                  }`}
                >
                  <div>{label}</div>
                  <div className="text-gray-500 font-normal">{sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label block mb-1" htmlFor="busy_level">Kitchen busy level</label>
              <select
                id="busy_level"
                name="busy_level"
                value={form.busy_level}
                onChange={handleChange}
                disabled={isLoading}
                className="select-field"
              >
                {BUSY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-gray-900">{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label block mb-1" htmlFor="peak_hour">Peak hour</label>
              <select
                id="peak_hour"
                name="peak_hour"
                value={form.peak_hour}
                onChange={handleChange}
                disabled={isLoading}
                className="select-field"
              >
                {PEAK_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-gray-900">{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="is_weekend"
              checked={form.is_weekend}
              onChange={handleChange}
              disabled={isLoading}
              className="w-4 h-4 rounded border-gray-600 bg-gray-900 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-950"
            />
            <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
              Weekend surge <span className="text-gray-600">(+5 min)</span>
            </span>
          </label>
        </div>
      </div>

      <button id="estimate-btn" type="submit" disabled={isLoading} className="btn-primary w-full">
        {isLoading ? 'Calculating...' : 'Calculate ETA'}
      </button>
    </form>
  )
}

export default InputCard
