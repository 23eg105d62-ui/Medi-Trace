import axios from 'axios';

const api = axios.create({ baseURL: 'http://127.0.0.1:5001/api' });

api.interceptors.request.use(cfg => {
    const token = localStorage.getItem('token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

// Auth
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// Pharmacies
export const getNearbyPharmacies = (lat, lng, radius = 5000) =>
    api.get(`/pharmacies/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
export const getPharmacyById = (id) => api.get(`/pharmacies/${id}`);

// Reports
export const submitReport = (data) => api.post('/reports', data);
export const verifyReport = (id, coords) =>
    api.post(`/reports/${id}/verify`, coords);