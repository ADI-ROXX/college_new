// frontend/utils/axiosInstance.js
import axios from 'axios'
export const NEXT_PUBLIC_BACKEND_URL = 'http://localhost:5080/api'
const axiosInstance = axios.create({
  baseURL: NEXT_PUBLIC_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add a request interceptor to include the JWT token if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default axiosInstance
