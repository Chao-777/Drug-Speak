import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

   const apiClient = axios.create({
   baseURL: 'http://localhost:3000', 
   headers: {
      'Content-Type': 'application/json'
   }
   });

   apiClient.interceptors.request.use(
   async (config) => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
         config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
   },
   (error) => {
      return Promise.reject(error);
   }
   );

   const AuthService = {

   login: async (email, password) => {
      try {
         const response = await apiClient.post('/auth/login', { email, password });
         const { user, token } = response.data;
         
         await AsyncStorage.setItem('token', token);
         
         return { user, token };
      } catch (error) {
         if (error.response?.status === 401) {
         throw new Error('Invalid email or password');
         } else {
         throw new Error('Something went wrong. Please try again.');
         }
      }
   },
   
   register: async (userData) => {
      try {
         const response = await apiClient.post('/users', userData);
         
         if (response.data && response.data.token) {
         await AsyncStorage.setItem('token', response.data.token);
         return response.data;
         }
         return response.data;
      } catch (error) {
         if (error.response?.status === 409) {
         throw new Error('Email already in use.');
         } else if (error.response?.status === 400) {
         throw new Error('Invalid input. Please check all fields.');
         } else {
         throw new Error('An error occurred during signup.');
         }
      }
   },
   
   isLoggedIn: async () => {
      const token = await AsyncStorage.getItem('token');
      return !!token;
   },
   

   logout: async () => {
      try {
         await apiClient.post('/auth/logout');
         await AsyncStorage.removeItem('token');
         return true;
      } catch (error) {
         console.error('Logout error:', error);
         return false;
      }
   },
   
   getCurrentUser: async () => {
      try {
         const response = await apiClient.get('/users/profile');
         return response.data;
      } catch (error) {
         console.error('Error fetching user profile:', error);
         return null;
      }
   }
};

export default AuthService;
