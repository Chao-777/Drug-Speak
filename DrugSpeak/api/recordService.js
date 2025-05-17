import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from './authService';

// Storage keys
const PENDING_RECORDS_KEY = 'pendingUploads';

const RecordService = {
   /**
    * Upsert a study record
    * @param {Object} updateData - The data to update
    * @returns {Promise<Object>} The updated record
    */
   upsertStudyRecord: async (updateData) => {
      try {
         // Check if this is a special final sync operation before logout
         const isFinalSync = await AsyncStorage.getItem('finalSync');
         
         // Only check for logout in progress if this is NOT a final sync
         if (isFinalSync !== 'true') {
            // First check if logout is in progress
            const isLoggingOut = await AsyncStorage.getItem('isLoggingOut');
            if (isLoggingOut === 'true') {
               console.log('Logout in progress, skipping study record update');
               throw new Error('Operation aborted due to ongoing logout');
            }
         } else {
            console.log('Processing final sync operation before logout');
         }
         
         // First check for auth token
         const token = await AsyncStorage.getItem('userToken');
         if (!token) {
            console.log('No auth token found, skipping study record update');
            throw new Error('Authentication required. Please log in again.');
         }
         
         // Get current user to include user ID with the request
         const user = await AuthService.getCurrentUser();
         if (!user) {
            console.log('No user data found, skipping study record update');
            throw new Error('You need to be logged in to update your study record.');
         }
         
         // Add user ID to the data
         const recordData = {
            ...updateData,
            userId: user.id || user._id
         };
         
         const response = await apiClient.post('/study-record', recordData);
         return response.data;
      } catch (error) {
         console.error('Error updating study record:', error);
         
         // Handle different error types
         if (error.response?.status === 401) {
            throw new Error('You need to be logged in to update your study record.');
         } else if (error.response?.status === 400) {
            throw new Error('Invalid study record data. Please check your inputs.');
         } else if (error.response?.status === 404) {
            // Create a default record if endpoint doesn't exist
            console.log('Study record endpoint not implemented yet, using defaults');
            return {
               ...updateData,
               isDefaultRecord: true
            };
         } else {
            throw new Error('Failed to update study record. Please try again.');
         }
      }
   },

   /**
    * Get all study records
    * @returns {Promise<Array>} All study records
    */
   getAllStudyRecords: async () => {
      try {
         const response = await apiClient.get('/study-record');
         return response.data;
      } catch (error) {
         // Check for 404 errors (endpoint not implemented)
         if (error.response?.status === 404) {
            console.log('Study records endpoint not implemented yet, using defaults');
            return [];
         }
         
         console.error('Error fetching all study records:', error);
         
         if (error.response?.status === 403) {
            throw new Error('You do not have permission to view all records.');
         } else {
            throw new Error('Failed to fetch study records. Please try again.');
         }
      }
   },

   /**
    * Get a study record by user ID
    * @param {string} userId - The user ID
    * @returns {Promise<Object>} The study record
    */
   getStudyRecordById: async (userId) => {
      try {
         // Check if this is a special final sync operation before logout
         const isFinalSync = await AsyncStorage.getItem('finalSync');
         
         // Only check for logout in progress if this is NOT a final sync
         if (isFinalSync !== 'true') {
            // First check if logout is in progress
            const isLoggingOut = await AsyncStorage.getItem('isLoggingOut');
            if (isLoggingOut === 'true') {
               console.log('Logout in progress, skipping study record fetch');
               throw new Error('Operation aborted due to ongoing logout');
            }
         } else {
            console.log('Processing final sync record fetch before logout');
         }
         
         // First check for auth token
         const token = await AsyncStorage.getItem('userToken');
         if (!token) {
            console.log('No auth token found, skipping study record fetch');
            throw new Error('Authentication required. Please log in again.');
         }
         
         // Ensure we have a valid user ID
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
         // Return a default record object for 404s (endpoint not implemented)
         if (error.response?.status === 404) {
            console.log('Study record endpoint not implemented yet, using defaults');
            return {
               userId: userId,
               currentLearning: 0,
               finishedLearning: 0,
               totalScore: 0,
               isDefaultRecord: true
            };
         }
         
         console.error('Error fetching study record:', error);
         
         if (error.response?.status === 401) {
            throw new Error('You need to be logged in to view this record.');
         } else {
            throw new Error('Failed to fetch study record. Please try again.');
         }
      }
   },

   /**
    * Create a study record
    * @param {string} userId - The user ID
    * @param {Object} data - The record data
    * @returns {Promise<Object>} The created record
    */
   createStudyRecord: async (userId, data) => {
      try {
         // If userId is not provided, get from current user
         if (!userId) {
            const user = await AuthService.getCurrentUser();
            if (!user) {
               throw new Error('You need to be logged in to create a study record.');
            }
            userId = user.id || user._id;
         }
         
         const recordData = {
            ...data,
            userId
         };
         
         const response = await apiClient.post('/study-record', recordData);
         return response.data;
      } catch (error) {
         // Handle 404 (endpoint not implemented)
         if (error.response?.status === 404) {
            console.log('Study record creation endpoint not implemented yet');
            const mockRecord = {
               ...data,
               userId,
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
    * @param {Object} record - The record to add
    * @returns {Promise<void>}
    */
   addPendingRecord: async (record) => {
      try {
         const pendingStr = await AsyncStorage.getItem(PENDING_RECORDS_KEY);
         const pending = pendingStr ? JSON.parse(pendingStr) : [];
         
         // Remove existing record with same ID if it exists
         const filteredPending = pending.filter(
            p => p.id !== record.id && p.userId !== record.userId
         );
         
         // Add the new record
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
    * @param {string} id - The record ID or user ID
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
    * @param {string} userId - The user ID
    * @returns {Promise<Object|null>} The pending record or null
    */
   getPendingRecordById: async (userId) => {
      try {
         const pendingStr = await AsyncStorage.getItem(PENDING_RECORDS_KEY);
         if (!pendingStr) return null;
         
         const pending = JSON.parse(pendingStr);
         return pending.find(p => p.userId === userId || p.id === userId) || null;
      } catch (error) {
         console.error('Error getting pending record:', error);
         return null;
      }
   },

   /**
    * Get all pending records
    * @returns {Promise<Array>} All pending records
    */
   getAllPendingRecords: async () => {
      try {
         const pendingStr = await AsyncStorage.getItem(PENDING_RECORDS_KEY);
         return pendingStr ? JSON.parse(pendingStr) : [];
      } catch (error) {
         console.error('Error getting all pending records:', error);
         return [];
      }
   }
};

export default RecordService;
