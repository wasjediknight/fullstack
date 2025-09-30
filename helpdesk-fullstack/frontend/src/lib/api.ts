import axios from 'axios'
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333'
})

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('auth')
  if (raw) {
    const { accessToken } = JSON.parse(raw)
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})
