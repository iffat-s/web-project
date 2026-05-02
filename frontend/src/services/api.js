// src/services/api.js
import axios from 'axios'

// Direct connection to your backend
const API_URL = 'http://localhost:3000'  // Your backend URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        // Note: Your refresh endpoint is at /refresh
        const response = await axios.post(`${API_URL}/refresh`, { refreshToken })
        
        localStorage.setItem('token', response.data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`
        
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('/register', userData),
  login: (credentials) => api.post('/login', credentials),
  logout: () => api.post('/logout'),
  refresh: (refreshToken) => api.post('/refresh', { refreshToken }),
}

// User APIs
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
}

// Reward APIs
export const rewardAPI = {
  getAll: () => api.get('/rewards'),
}

// Loyalty APIs
export const loyaltyAPI = {
  getMyProfile: () => api.get('/loyalty-profiles/me'),
  getTransactions: () => api.get('/transactions'),
  getStats: () => api.get('/dashboard/stats'),
}

// Redemption APIs
export const redemptionAPI = {
  redeem: (rewardId) => api.post('/redemptions', { rewardId }),
}

// Brand APIs (if needed)
export const brandAPI = {
  getAll: () => api.get('/brands'),
}

export default api