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
            // Try to fetch from server
            const response = await apiClient.get('/users/rankings');
            return response.data;
         } catch (error) {
            // If the API is not implemented yet (404), create mock data
            if (error.response?.status === 404) {
               // Get current user for comparison
               const currentUser = await AuthService.getCurrentUser();
               
               // Create mock user data
               let mockUsers = [
                  { id: '1', name: 'Emma Johnson', email: 'emma@example.com', score: 950 },
                  { id: '2', name: 'Noah Smith', email: 'noah@example.com', score: 920 },
                  { id: '3', name: 'Olivia Williams', email: 'olivia@example.com', score: 890 },
                  { id: '4', name: 'Liam Brown', email: 'liam@example.com', score: 850 },
                  { id: '5', name: 'Ava Jones', email: 'ava@example.com', score: 820 },
                  { id: '6', name: 'Ethan Miller', email: 'ethan@example.com', score: 780 },
                  { id: '7', name: 'Sophia Davis', email: 'sophia@example.com', score: 750 },
                  { id: '8', name: 'Mason Wilson', email: 'mason@example.com', score: 700 },
                  { id: '9', name: 'Isabella Taylor', email: 'isabella@example.com', score: 650 },
                  { id: '10', name: 'Logan Martinez', email: 'logan@example.com', score: 600 },
               ];
               
               // Add current user to the mock data if available
               if (currentUser) {
                  // Check if user already exists in the list
                  const userExists = mockUsers.some(u => 
                     u.id === currentUser.id || 
                     u._id === currentUser._id || 
                     u.email === currentUser.email
                  );
                  
                  // If not, add them with a random score
                  if (!userExists) {
                     const userScore = Math.floor(Math.random() * 500) + 500;
                     mockUsers.push({
                        id: currentUser.id || currentUser._id,
                        name: currentUser.name,
                        email: currentUser.email,
                        score: userScore
                     });
                  }
               }
               
               // Sort by score
               mockUsers.sort((a, b) => b.score - a.score);
               
               return mockUsers;
            }
            
            throw error;
         }
      } catch (error) {
         console.error('Error fetching users:', error);
         return [];
      }
   }
};

export default UserService;
