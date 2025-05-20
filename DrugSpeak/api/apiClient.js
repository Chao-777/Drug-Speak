import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URLS = {
   development: 'http://localhost:3000', 
};

const API_ENV = 'development';
const API_BASE_URL = API_URLS[API_ENV];

const apiClient = axios.create({
   baseURL: API_BASE_URL,
   headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
   },
   timeout: 10000
});

apiClient.interceptors.request.use(
   async (config) => {
      try {
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

apiClient.interceptors.response.use(
   (response) => {
      return response;
   },
   async (error) => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry) {
         originalRequest._retry = true;
         
         try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
         } catch (storageError) {
            console.error('Error removing expired token:', storageError);
         }
      }
      
      if (error.response) {
         switch (error.response.status) {
            case 404:
               break;
            case 500:
               error.friendlyMessage = 'Server error. Please try again later.';
               break;
            case 503:
               error.friendlyMessage = 'Service temporarily unavailable. Please try again later.';
               break;
            default:
               break;
         }
      }
      
      return Promise.reject(error);
   }
);

export default apiClient;
