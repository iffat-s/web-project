import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';
// Add this before your axios calls or in main.jsx


// Add a request interceptor to log all outgoing requests
axios.interceptors.request.use(request => {
  console.log('🚀 Making request to:', request.method.toUpperCase(), request.url);
  console.log('📦 With data:', request.data);
  return request;
});

// Add response interceptor to catch 404s specifically
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 404) {
      console.error('❌ 404 Error:', error.config?.method, error.config?.url);
      console.error('📍 Full URL:', error.config?.baseURL + error.config?.url);
    }
    return Promise.reject(error);
  }
);
const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  logout: (refreshToken) => api.post('/logout', { refreshToken }),
};

// ─── USERS ───────────────────────────────────────────────────────────────────
export const usersApi = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// ─── BRANDS ──────────────────────────────────────────────────────────────────
export const brandsApi = {
  getAll: () => api.get('/brands'),
  getById: (id) => api.get(`/brands/${id}`),
  create: (data) => api.post('/brands', data),
  update: (id, data) => api.put(`/brands/${id}`, data),
  delete: (id) => api.delete(`/brands/${id}`),
};

// ─── CAMPAIGNS ───────────────────────────────────────────────────────────────
export const campaignsApi = {
  getByBrand: (brandId) => api.get(`/brands/${brandId}/campaigns`),
  create: (brandId, data) => api.post(`/brands/${brandId}/campaigns`, data),
  update: (brandId, id, data) => api.put(`/brands/${brandId}/campaigns/${id}`, data),
  toggle: (brandId, id) => api.patch(`/brands/${brandId}/campaigns/${id}/toggle`),
  delete: (brandId, id) => api.delete(`/brands/${brandId}/campaigns/${id}`),
};

// ─── TIERS ───────────────────────────────────────────────────────────────────
export const tiersApi = {
  getByBrand: (brandId) => api.get(`/brands/${brandId}/tiers`),
  create: (brandId, data) => api.post(`/brands/${brandId}/tiers`, data),
  update: (brandId, id, data) => api.put(`/brands/${brandId}/tiers/${id}`, data),
  delete: (brandId, id) => api.delete(`/brands/${brandId}/tiers/${id}`),
};

// ─── EARNING RULES ───────────────────────────────────────────────────────────
export const rulesApi = {
  getByBrand: (brandId) => api.get(`/brands/${brandId}/rules`),
  create: (brandId, data) => api.post(`/brands/${brandId}/rules`, data),
  update: (brandId, id, data) => api.put(`/brands/${brandId}/rules/${id}`, data),
  delete: (brandId, id) => api.delete(`/brands/${brandId}/rules/${id}`),
};

// ─── REWARDS ─────────────────────────────────────────────────────────────────
export const rewardsApi = {
  getByBrand: (brandId) => api.get(`/brands/${brandId}/rewards`),
  getById: (brandId, id) => api.get(`/brands/${brandId}/rewards/${id}`),
  create: (brandId, data) => api.post(`/brands/${brandId}/rewards`, data),
  update: (brandId, id, data) => api.put(`/brands/${brandId}/rewards/${id}`, data),
  delete: (brandId, id) => api.delete(`/brands/${brandId}/rewards/${id}`),
};

// ─── TRANSACTIONS ────────────────────────────────────────────────────────────
export const transactionsApi = {
  earn: (data) => api.post('/transactions/earn', data),
  getMy: () => api.get('/transactions/my'),
  getAll: () => api.get('/transactions'),
};

// ─── LOYALTY PROFILE ─────────────────────────────────────────────────────────
export const loyaltyApi = {
  getMe: () => api.get('/loyalty-profiles/me'),
  getById: (id) => api.get(`/loyalty-profiles/${id}`),
  getAll: () => api.get('/loyalty-profiles'),
};

// ─── REDEMPTIONS ─────────────────────────────────────────────────────────────
export const redemptionsApi = {
  redeem: (data) => api.post('/redemptions', data),
  getMy: () => api.get('/redemptions/my'),
  getAll: () => api.get('/redemptions'),
  updateStatus: (id, status) => api.patch(`/redemptions/${id}/status`, { status }),
};

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
export const dashboardApi = {
  admin: () => api.get('/dashboard/admin'),
  brand: (brandId) => api.get(`/dashboard/brand/${brandId}`),
};
