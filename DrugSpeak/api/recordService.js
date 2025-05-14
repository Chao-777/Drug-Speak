import apiClient from './apiClient';

const RecordService = {
   upsertStudyRecord: async (updateData) => {
      try {
         const response = await apiClient.post('/study-record', updateData);
         return response.data;
      } catch (error) {
         console.error('Error updating study record:', error);
         
         if (error.response?.status === 401) {
         throw new Error('You need to be logged in to update your study record.');
         } else if (error.response?.status === 400) {
         throw new Error('Invalid study record data. Please check your inputs.');
         } else {
         throw new Error('Failed to update study record. Please try again.');
         }
      }
   },

   getAllStudyRecords: async () => {
      try {
         const response = await apiClient.get('/study-record');
         return response.data;
      } catch (error) {
         console.error('Error fetching all study records:', error);
         
         if (error.response?.status === 403) {
         throw new Error('You do not have permission to view all records.');
         } else {
         throw new Error('Failed to fetch study records. Please try again.');
         }
      }
   },

   getStudyRecordById: async (userId) => {
      try {
         const response = await apiClient.get(`/study-record/${userId}`);
         return response.data;
      } catch (error) {
         console.error('Error fetching study record:', error);
         
         if (error.response?.status === 404) {
         return {
            userId: userId,
            currentLearning: 0,
            finishedLearning: 0,
            totalScore: 0,
            isDefaultRecord: true
         };
         } else if (error.response?.status === 401) {
         throw new Error('You need to be logged in to view this record.');
         } else {
         throw new Error('Failed to fetch study record. Please try again.');
         }
      }
   },

   createStudyRecord: async (userId, data) => {
      try {
         const recordData = {
         ...data,
         userId
         };
         
         const response = await apiClient.post('/study-record', recordData);
         return response.data;
      } catch (error) {
         console.error('Error creating study record:', error);
         throw new Error('Failed to create study record. Please try again.');
      }
   }
};

export default RecordService;
