    import axios from 'axios';
import { toast } from 'react-toastify';

// 1. Base URL Configuration (Change this once for the whole app)
const API_BASE_URL = 'http://localhost:5000/api';

// 2. Create Axios Instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 3. Request Interceptor: Auto-attach Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 4. Response Interceptor: Global Error Handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || "Something went wrong";
        
        // Auto-logout if token expired (401)
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            toast.error("Session expired. Please login again.");
        } else {
            toast.error(message);
        }
        return Promise.reject(error);
    }
);

export default api;