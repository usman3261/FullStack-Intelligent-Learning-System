import axios from 'axios';
import { BASE_URL } from '../utils/apiPaths';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000, // Increased to 30s because Gemini AI processing can be slow
    headers: {
        'Accept': 'application/json',
        // Removed static 'Content-Type': 'application/json' 
        // This allows Axios to automatically set it for FormData/Uploads
    },
});

// Request Interceptor: Attach JWT to every outgoing request
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Standardizing the Bearer token format
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request Interceptor Error:', error);
        return Promise.reject(error);
    }
);

// Response Interceptor: Global Error Handling
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const originalRequest = error.config;

        if (error.response) {
            // 1. Handle Token Expiration or Invalidity
            if (error.response.status === 401) {
                console.warn('Unauthorized access detected. Clearing session...');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                
                // Only redirect if we aren't already on the login page
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
            
            // 2. Handle Server Side Errors
            if (error.response.status === 500) {
                console.error('Backend Server Error:', error.response.data);
            }
        } 
        // 3. Handle Timeouts (Critical for AI features)
        else if (error.code === 'ECONNABORTED') {
            console.error('The request timed out. The AI model is still processing your file.');
        } 
        // 4. Handle Network Failures
        else {
            console.error('Network error: Unable to reach the API server.');
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;