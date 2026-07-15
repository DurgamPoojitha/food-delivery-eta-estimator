import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
  timeout: 15_000,
})

export const estimateETA = async (payload) => {
  const response = await apiClient.post('/api/estimate', payload)
  return response.data
}

export default apiClient
