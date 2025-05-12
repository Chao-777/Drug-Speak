import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserService = {
   createUser: async (userData) => {
      try {
         const response = await apiClient.post('/users', userData);
         
         const { user, token } = response.data;
         
         await AsyncStorage.setItem('userToken', token);
         
         await AsyncStorage.setItem('userData', JSON.stringify(user));
         
         return response.data;
      } catch (error) {
         console.error('Error creating user:', error);
         
         if (error.response?.status === 409) {
         throw new Error('Email address is already in use.');
         } else if (error.response?.status === 400) {
         throw new Error('Invalid user data. Please check your inputs.');
         } else {
         throw new Error('Failed to create user. Please try again.');
         }
      }
   },

   updateProfile: async (userData) => {
      try {
         const response = await apiClient.patch('/users/update', userData);
         
         const updatedUser = response.data;
         await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
         
         return updatedUser;
      } catch (error) {
         console.error('Error updating user profile:', error);
         
         if (error.response?.status === 400) {
         throw new Error('Invalid user data. Please check your inputs.');
         } else if (error.response?.status === 401) {
         throw new Error('You need to be logged in to update your profile.');
         } else {
         throw new Error('Failed to update profile. Please try again.');
         }
      }
   },
   

   deleteUser: async (userId) => {
      try {
         const response = await apiClient.delete(`/users/${userId}`);
         return response.data;
      } catch (error) {
         console.error('Error deleting user:', error);
         throw new Error('Failed to delete user.');
      }
   }
};

export default UserService;
