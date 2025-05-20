import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from './authService';
import UserDataHelper from '../utils/UserDataHelper';

const PENDING_RECORDS_KEY = 'pendingUploads';

const RecordService = {
   /**
    * Upsert a study record
    * @param {Object} updateData 
    * @returns {Promise<Object>} 
    */
   upsertStudyRecord: async (updateData) => {
      try {
         const isFinalSync = await AsyncStorage.getItem('finalSync');
         
         if (isFinalSync !== 'true') {
            const isLoggingOut = await AsyncStorage.getItem('isLoggingOut');
            if (isLoggingOut === 'true') {
               throw new Error('Operation aborted due to ongoing logout');
            }
         }
         
         const token = await AsyncStorage.getItem('userToken');
         if (!token) {
            throw new Error('Authentication required. Please log in again.');
         }
         
         const user = await AuthService.getCurrentUser();
         if (!user) {
            throw new Error('You need to be logged in to update your study record.');
         }
         
         const userData = UserDataHelper.createNestedUserObject(user);
         
         const recordData = {
            ...updateData,
            ...userData,
            updatedAt: new Date().toISOString()
         };
         
         const response = await apiClient.post('/study-record', recordData);
         return response.data;
      } catch (error) {
         console.error('Error updating study record:', error);
         
         if (error.response?.status === 401) {
            throw new Error('You need to be logged in to update your study record.');
         } else if (error.response?.status === 400) {
            throw new Error('Invalid study record data. Please check your inputs.');
         } else if (error.response?.status === 404) {
            
            const user = await AuthService.getCurrentUser();
            const userData = UserDataHelper.createNestedUserObject(user);
            
            return {
               ...updateData,
               ...userData,
               updatedAt: new Date().toISOString(),
               isDefaultRecord: true
            };
         } else {
            throw new Error('Failed to update study record. Please try again.');
         }
      }
   },

   /**
    * Get all study records
    * @returns {Promise<Array>} 
    */
   getAllStudyRecords: async () => {
      try {
         try {
            const response = await apiClient.get('/study-record');
            return response.data;
         } catch (apiError) {
            if (apiError.response?.status === 404 || apiError.response?.status === 401) {
               return [];
            }
            throw apiError;
         }
      } catch (error) {
         if (error.response?.status === 403) {
            throw new Error('You do not have permission to view all records.');
         } else {
            throw new Error('Failed to fetch study records. Please try again.');
         }
      }
   },

   /**
    * Get mock study records for community display when API unavailable
    * @private
    * @returns {Array} 
    */
   getMockStudyRecords: () => {
      return [
         {
            userId: "user1",
            username: "JaneDoe",
            gender: "Female",
            totalScore: 350,
            currentLearning: 3,
            finishedLearning: 12
         },
         {
            userId: "user2",
            username: "JohnSmith",
            gender: "Male", 
            totalScore: 420,
            currentLearning: 5,
            finishedLearning: 15
         },
         {
            userId: "user3",
            username: "AlexWong",
            gender: "Male",
            totalScore: 280,
            currentLearning: 6,
            finishedLearning: 7
         },
         {
            userId: "user4",
            username: "SarahBrown",
            gender: "Female",
            totalScore: 380,
            currentLearning: 4,
            finishedLearning: 11
         },
         {
            userId: "user5",
            username: "MichaelLee",
            gender: "Male",
            totalScore: 310,
            currentLearning: 2,
            finishedLearning: 10
         }
      ];
   },

   /**
    * Get a study record by user ID
    * @param {string} userId 
    * @returns {Promise<Object>} 
    */
   getStudyRecordById: async (userId) => {
      try {
         const isFinalSync = await AsyncStorage.getItem('finalSync');
         
         if (isFinalSync !== 'true') {
            const isLoggingOut = await AsyncStorage.getItem('isLoggingOut');
            if (isLoggingOut === 'true') {
               throw new Error('Operation aborted due to ongoing logout');
            }
         }
         
         const token = await AsyncStorage.getItem('userToken');
         if (!token) {
            throw new Error('Authentication required. Please log in again.');
         }
         
         if (!userId) {
            const user = await AuthService.getCurrentUser();
            if (!user) {
               throw new Error('You need to be logged in to view this record.');
            }
            userId = user.id || user._id;
         }
         
         const response = await apiClient.get(`/study-record/${userId}`);
         return response.data;
      } catch (error) {
         if (error.response?.status === 404) {
            return {
               userId: userId,
               currentLearning: 0,
               finishedLearning: 0,
               totalScore: 0,
               isDefaultRecord: true
            };
         }
         
         if (error.response?.status === 401) {
            throw new Error('You need to be logged in to view this record.');
         } else {
            throw new Error('Failed to fetch study record. Please try again.');
         }
      }
   },

   /**
    * Create a study record
    * @param {string} userId 
    * @param {Object} data 
    * @returns {Promise<Object>} 
    */
   createStudyRecord: async (userId, data) => {
      try {
         let user = null;
         if (!userId) {
            user = await AuthService.getCurrentUser();
            if (!user) {
               throw new Error('You need to be logged in to create a study record.');
            }
            userId = user.id || user._id;
         }
         
         if (!user && userId) {
            try {
               user = await AuthService.getCurrentUser();
               if (user && (user.id !== userId && user._id !== userId)) {
                  user = null;
               }
            } catch (error) {
            }
         }
         
         const userData = user ? UserDataHelper.createNestedUserObject(user) : { 
            userId, 
            username: `User ${userId.substring(0, 5)}`,
            name: `User ${userId.substring(0, 5)}`
         };
         
         const recordData = {
            ...data,
            ...userData,
            updatedAt: new Date().toISOString()
         };
         
         const response = await apiClient.post('/study-record', recordData);
         return response.data;
      } catch (error) {
         if (error.response?.status === 404) {
            let user = null;
            try {
               user = await AuthService.getCurrentUser();
               if (user && (user.id !== userId && user._id !== userId)) {
                  user = null;
               }
            } catch (userError) {
            }
            
            const userData = user ? UserDataHelper.createNestedUserObject(user) : { 
               userId, 
               username: `User ${userId.substring(0, 5)}`,
               name: `User ${userId.substring(0, 5)}`
            };
            
            const mockRecord = {
               ...data,
               ...userData,
               updatedAt: new Date().toISOString(),
               id: `local_${Date.now()}`,
               isDefaultRecord: true
            };
            return mockRecord;
         }
         
         console.error('Error creating study record:', error);
         throw new Error('Failed to create study record. Please try again.');
      }
   },

   /**
    * Add a record to pending uploads
    * @param {Object} record
    * @returns {Promise<void>}
    */
   addPendingRecord: async (record) => {
      try {
         const pendingStr = await AsyncStorage.getItem(PENDING_RECORDS_KEY);
         const pending = pendingStr ? JSON.parse(pendingStr) : [];
         
         const filteredPending = pending.filter(
            p => p.id !== record.id && p.userId !== record.userId
         );
         
         filteredPending.push({
            ...record,
            pendingId: `pending_${Date.now()}`,
            timestamp: new Date().toISOString()
         });
         
         await AsyncStorage.setItem(PENDING_RECORDS_KEY, JSON.stringify(filteredPending));
      } catch (error) {
         console.error('Error adding pending record:', error);
      }
   },

   /**
    * Remove a record from pending uploads
    * @param {string} id 
    * @returns {Promise<void>}
    */
   removePendingRecord: async (id) => {
      try {
         const pendingStr = await AsyncStorage.getItem(PENDING_RECORDS_KEY);
         if (!pendingStr) return;
         
         const pending = JSON.parse(pendingStr);
         const filteredPending = pending.filter(
            p => p.id !== id && p.userId !== id
         );
         
         await AsyncStorage.setItem(PENDING_RECORDS_KEY, JSON.stringify(filteredPending));
      } catch (error) {
         console.error('Error removing pending record:', error);
      }
   },

   /**
    * Get a pending record by ID
    * @param {string} userId 
    * @returns {Promise<Object|null>} 
    */
   getPendingRecordById: async (userId) => {
      try {
         const pendingStr = await AsyncStorage.getItem(PENDING_RECORDS_KEY);
         if (!pendingStr) return null;
         
         const pending = JSON.parse(pendingStr);
         return pending.find(p => p.userId === userId || p.id === userId) || null;
      } catch (error) {
         return null;
      }
   },

   /**
    * Get all pending records
    * @returns {Promise<Array>}
    */
   getAllPendingRecords: async () => {
      try {
         const pendingStr = await AsyncStorage.getItem(PENDING_RECORDS_KEY);
         return pendingStr ? JSON.parse(pendingStr) : [];
      } catch (error) {
         return [];
      }
   }
};

export default RecordService;
