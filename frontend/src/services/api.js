import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Helper — build full URL for uploaded images
export const imgUrl = (path) =>
  path ? `${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}${path}` : null;

// ── Request interceptor — attach JWT ─────────────────────────
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

// ── Response interceptor ─────────────────────────────────────
API.interceptors.response.use(
  (response) => {
    // Unwrap { success: true, data: ... } envelope transparently
    const body = response.data;
    if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
      response.data = body.data;
    }
    return response;
  },
  (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.message || '';

    // Auto-logout on expired / invalid token
    if (status === 401 && (message === 'Token expired' || message === 'Token invalid')) {
      localStorage.removeItem('user');
      // Trigger AuthContext logout via custom event so the React tree reacts
      window.dispatchEvent(new CustomEvent('auth:logout', { detail: { expired: true } }));
    }

    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────
export const register       = (data)       => API.post('/auth/register', data);
export const login          = (data)       => API.post('/auth/login', data);
export const getMe          = ()           => API.get('/auth/me');
export const updatePassword = (data)       => API.put('/auth/password', data);

// ── Disasters ─────────────────────────────────────────────────
export const getDisasters      = (params)  => API.get('/disasters', { params });
export const getDisaster       = (id)      => API.get(`/disasters/${id}`);
export const createDisaster    = (data)    => API.post('/disasters', data);
export const updateDisaster    = (id, data)=> API.put(`/disasters/${id}`, data);
export const deleteDisaster    = (id)      => API.delete(`/disasters/${id}`);
export const addDisasterUpdate = (id, data)=> API.post(`/disasters/${id}/updates`, data);

// ── Relief Requests ───────────────────────────────────────────
export const getReliefRequests    = (params)   => API.get('/relief', { params });
export const createReliefRequest  = (data)     => API.post('/relief', data);
export const updateReliefRequest  = (id, data) => API.put(`/relief/${id}`, data);
export const deleteReliefRequest  = (id)       => API.delete(`/relief/${id}`);

// ── Volunteers ────────────────────────────────────────────────
export const getVolunteers      = ()       => API.get('/volunteers');
export const registerVolunteer  = (data)   => API.post('/volunteers/register', data);
export const assignVolunteer    = (data)   => API.post('/volunteers/assign', data);
export const updateAvailability = (data)   => API.put('/volunteers/availability', data);

// ── Admin ─────────────────────────────────────────────────────
export const getAnalytics = ()           => API.get('/admin/analytics');
export const getUsers     = ()           => API.get('/admin/users');
export const updateUser   = (id, data)   => API.put(`/admin/users/${id}`, data);
export const deleteUser   = (id)         => API.delete(`/admin/users/${id}`);
// Admin — disasters
export const adminGetDisasters    = (params)   => API.get('/admin/disasters', { params });
export const adminUpdateDisaster  = (id, data) => API.put(`/admin/disasters/${id}`, data);
export const adminDeleteDisaster  = (id)       => API.delete(`/admin/disasters/${id}`);
// Admin — relief requests
export const adminGetRequests     = (params)   => API.get('/admin/requests', { params });
export const adminUpdateRequest   = (id, data) => API.put(`/admin/requests/${id}`, data);
export const adminDeleteRequest   = (id)       => API.delete(`/admin/requests/${id}`);

export default API;
