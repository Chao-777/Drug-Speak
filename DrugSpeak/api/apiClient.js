import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3000';

const apiClient = axios.create({
   baseURL: API_BASE_URL,
   headers: {
      'Content-Type': 'application/json'
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
         console.error('Error setting auth token:', error);
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
      
      return Promise.reject(error);
   }
);

export default apiClient;
