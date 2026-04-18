import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiService = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add session token or Firebase token
apiService.interceptors.request.use(
  async (config) => {
    try {
      // First, try to use JWT session token from localStorage
      const sessionToken = localStorage.getItem('sessionToken');
      if (sessionToken) {
        config.headers.Authorization = `Bearer ${sessionToken}`;
        return config;
      }

      // Fall back to Firebase ID token if no session token
      const { auth } = await import('../config/firebase');
      if (auth.currentUser) {
        const firebaseToken = await auth.currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${firebaseToken}`;
      }
    } catch (error) {
      console.error('Error setting auth token:', error);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiService.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear stored tokens
      localStorage.removeItem('sessionToken');

      // Redirect to login
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response?.data?.message);
    }

    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response?.data?.message);
    }

    return Promise.reject(
      error.response?.data || {
        error: 'Request failed',
        message: error.message,
      }
    );
  }
);

export default apiService;
