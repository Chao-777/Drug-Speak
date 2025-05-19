import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define API URLs for different environments
// In a real app, you'd use environment variables or a config system
const API_URLS = {
  development: 'http://localhost:3000',  // Changed back to localhost for proper API connection
  test: 'http://test-api.example.com',
  production: 'https://api.drugspeak.com', // Would be your actual production URL
};

// Use development by default
const API_ENV = 'development';
const API_BASE_URL = API_URLS[API_ENV];

// Configure axios defaults
const apiClient = axios.create({
   baseURL: API_BASE_URL,
   headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
   },
   timeout: 10000
});

// Request interceptor
apiClient.interceptors.request.use(
   async (config) => {
      try {
         // Add auth token if available
         const token = await AsyncStorage.getItem('userToken');
         if (token) {
            config.headers.Authorization = `Bearer ${token}`;
         }
      } catch (error) {
         console.error('Error in request interceptor:', error);
      }
      return config;
   },
   (error) => {
      return Promise.reject(error);
   }
);

// Response interceptor
apiClient.interceptors.response.use(
   (response) => {
      return response;
   },
   async (error) => {
      const originalRequest = error.config;
      
      // Handle unauthorized errors
      if (error.response?.status === 401 && !originalRequest._retry) {
         originalRequest._retry = true;
         
         try {
            // Clear auth data on 401 (unauthorized)
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
         } catch (storageError) {
            console.error('Error removing expired token:', storageError);
         }
      }
      
      // Handle common response error codes with friendlier messages
      if (error.response) {
         switch (error.response.status) {
            case 404:
               // The URL pattern or resource doesn't exist
               // Don't modify the error for 404s to let individual services handle them
               break;
            case 500:
               error.friendlyMessage = 'Server error. Please try again later.';
               break;
            case 503:
               error.friendlyMessage = 'Service temporarily unavailable. Please try again later.';
               break;
            default:
               // Keep original error
               break;
         }
      }
      
      return Promise.reject(error);
   }
);

export default apiClient;
