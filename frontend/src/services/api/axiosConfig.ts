import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 60000, // Increased to 60 seconds for file processing and AI analysis
  headers: {
    'Content-Type': 'application/json',
  },
  // Enable credentials for CORS
  withCredentials: true,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    // Get token from localStorage first, only call Clerk if not available
    let token = localStorage.getItem('auth_token');
    
    if (!token) {
      token = await getClerkToken();
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Adding auth token to request:', config.url, 'Token length:', token.length);
    } else {
      console.log('⚠️ No auth token available for request:', config.url);
    }
    
    // Add CORS headers
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle CORS errors
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      console.error('CORS/Network Error:', error.message);
      return Promise.reject(new Error('Network error - please check your connection and CORS configuration'));
    }
    
    // Handle authentication errors - REMOVED AUTOMATIC LOGOUT
    if (error.response?.status === 401) {
      console.error('Authentication error:', error.response?.data);
      // Don't automatically logout - let the calling code decide
      return Promise.reject(new Error('Authentication failed - token may be invalid or expired'));
    }
    
    // Handle CORS errors
    if (error.response?.status === 403 && (error.response?.data as any)?.error === 'CORS Error') {
      console.error('CORS Error:', error.response?.data);
      return Promise.reject(new Error('CORS Error - Origin not allowed'));
    }
    
    // Handle forbidden errors
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response?.data);
      return Promise.reject(new Error('Access forbidden - you don\'t have permission for this action'));
    }
    
    // Handle not found errors
    if (error.response?.status === 404) {
      console.error('Resource not found:', error.response?.data);
      return Promise.reject(new Error('Resource not found'));
    }
    
    // Handle server errors
    if (error.response?.status && error.response.status >= 500) {
      console.error('Server error:', error.response?.data);
      return Promise.reject(new Error('Server error - please try again later'));
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error.message);
      return Promise.reject(new Error('Request timeout - please try again'));
    }
    
    // Handle other errors
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Helper function to get Clerk token
const getClerkToken = async (): Promise<string | null> => {
  try {
    const token = await (window as any).Clerk?.session?.getToken();
    if (token) {
      localStorage.setItem('auth_token', token);
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error getting Clerk token:', error);
    return null;
  }
};

// Helper function to set auth token
export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

// Helper function to clear auth token
export const clearAuthToken = () => {
  localStorage.removeItem('auth_token');
};

// Helper function to get auth token
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Helper function to test API connection
export const testApiConnection = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/health');
    console.log('API connection test successful:', response.data);
    return true;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};

export default apiClient; 