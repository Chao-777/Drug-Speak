import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from './authService';

const UserService = {
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
         
         await AuthService.logout();
         
         return response.data;
      } catch (error) {
         console.error('Error deleting user:', error);
         throw new Error('Failed to delete user.');
      }
   },
   
   getUserProfile: async () => {
      try {
         try {
            const response = await apiClient.get('/users/profile');
            const userData = response.data;
            
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            
            return userData;
         } catch (apiError) {
            // If endpoint is not implemented (404), use cached data without error
            if (apiError.response?.status === 404) {
               console.log('Profile endpoint not implemented yet, using cached data');
               const cachedData = await AuthService.getCurrentUser();
               if (cachedData) return cachedData;
               throw new Error('No user data available');
            }
            // Rethrow other errors
            throw apiError;
         }
      } catch (error) {
         // Only log detailed error for non-404 errors
         if (error.response?.status !== 404) {
            console.error('Error fetching user profile:', error);
         }
         
         const cachedData = await AuthService.getCurrentUser();
         if (cachedData) return cachedData;
         
         throw new Error('Failed to fetch user profile.');
      }
   },
   
   getRecordingCounts: async () => {
      try {
         // Attempt to get from server first
         try {
            const response = await apiClient.get('/users/recording-counts');
            return response.data;
         } catch (error) {
            // If server fails, calculate from local storage
            const userData = await AuthService.getCurrentUser();
            if (!userData) return { total: 0 };
            
            const learningDataStr = await AsyncStorage.getItem('learningList');
            if (!learningDataStr) return { total: 0 };
            
            const learningList = JSON.parse(learningDataStr);
            const currentDrugs = learningList.filter(drug => drug.status === 'current');
            
            let totalRecordings = 0;
            
            for (const drug of currentDrugs) {
               const storageKey = `recordings_${drug.id}`;
               const savedRecordings = await AsyncStorage.getItem(storageKey);
               
               if (savedRecordings) {
                  const recordings = JSON.parse(savedRecordings);
                  totalRecordings += recordings.length;
               }
            }
            
            return { 
               total: totalRecordings,
               pending: 0
            };
         }
      } catch (error) {
         console.error('Error getting recording counts:', error);
         return { total: 0 };
      }
   },

   /**
    * Get a list of all users with their rankings
    * @returns {Promise<Array>} List of users with score data
    */
   getUsers: async () => {
      try {
         try {
            // Try to fetch from server - main users endpoint
            const response = await apiClient.get('/users');
            console.log('Successfully fetched users from /users endpoint');
            return response.data;
         } catch (error) {
            if (error.response?.status === 404) {
               console.log('/users endpoint not available, trying study records');
               
               // Try to get user data from study records
               try {
                  const studyRecords = await apiClient.get('/study-records');
                  
                  if (studyRecords.data && Array.isArray(studyRecords.data)) {
                     console.log('Using user data from study records');
                     
                     // Extract unique users from study records
                     const users = [];
                     const userIds = new Set();
                     
                     for (const record of studyRecords.data) {
                        if (record.userId && !userIds.has(record.userId)) {
                           userIds.add(record.userId);
                           
                           // Try to get user details from record or defaults
                           users.push({
                              id: record.userId,
                              name: record.username || `User ${record.userId.substring(0, 5)}`,
                              email: record.email || `${record.userId}@example.com`,
                              gender: record.gender || 'Not specified'
                           });
                        }
                     }
                     
                     // Make sure current user is included
                     const currentUser = await AuthService.getCurrentUser();
                     if (currentUser && !userIds.has(currentUser.id || currentUser._id)) {
                        users.push(currentUser);
                     }
                     
                     return users;
                  }
               } catch (studyError) {
                  console.log('Failed to get user data from study records');
               }
               
               // As a last resort, return just the current user
               console.log('No user data available from backend, using only current user');
               const currentUser = await AuthService.getCurrentUser();
               
               return currentUser ? [currentUser] : [];
            }
            
            throw error;
         }
      } catch (error) {
         console.error('Error fetching users:', error);
         
         // Fall back to current user only - NO MOCK DATA
         try {
            const currentUser = await AuthService.getCurrentUser();
            return currentUser ? [currentUser] : [];
         } catch (authError) {
            console.error('Could not get current user:', authError);
            return [];
         }
      }
   }
};

export default UserService;
