import AsyncStorage from '@react-native-async-storage/async-storage';

// Key format for storing learning lists per user
const USER_LEARNING_LIST_KEY = 'userLearningList_';

const LearningDataService = {
  /**
   * Save a user's learning list directly (bypassing Redux)
   * @param {string} userId - The user's ID
   * @param {Array} learningList - The learning list to save
   * @returns {Promise<boolean>} - Success status
   */
  saveLearningList: async (userId, learningList) => {
    if (!userId) {
      return false;
    }
    
    try {
      const key = `${USER_LEARNING_LIST_KEY}${userId}`;
      await AsyncStorage.setItem(key, JSON.stringify(learningList));
      return true;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Load a user's learning list directly (bypassing Redux)
   * @param {string} userId - The user's ID
   * @returns {Promise<Array|null>} - The learning list or null if not found
   */
  loadLearningList: async (userId) => {
    if (!userId) {
      return null;
    }
    
    try {
      const key = `${USER_LEARNING_LIST_KEY}${userId}`;
      const data = await AsyncStorage.getItem(key);
      
      if (data) {
        const learningList = JSON.parse(data);
        return learningList;
      }
      
      return [];
    } catch (error) {
      return [];
    }
  },
  
  /**
   * Check if a user has a saved learning list
   * @param {string} userId - The user's ID
   * @returns {Promise<boolean>} - Whether a learning list exists
   */
  hasLearningList: async (userId) => {
    if (!userId) return false;
    
    try {
      const key = `${USER_LEARNING_LIST_KEY}${userId}`;
      const data = await AsyncStorage.getItem(key);
      return data !== null;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Delete a user's learning list
   * @param {string} userId - The user's ID
   * @returns {Promise<boolean>} - Success status
   */
  deleteLearningList: async (userId) => {
    if (!userId) return false;
    
    try {
      const key = `${USER_LEARNING_LIST_KEY}${userId}`;
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      return false;
    }
  }
};

export default LearningDataService; 
