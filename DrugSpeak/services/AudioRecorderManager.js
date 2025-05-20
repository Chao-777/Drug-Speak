import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import apiClient from '../api/apiClient';
import AuthService from '../api/authService';
import RecordService from '../api/recordService';

const AudioRecorderManager = {
   // Generate a storage key that includes both user ID and drug ID for isolation
   _getUserSpecificStorageKey: async (drugId) => {
      try {
         const user = await AuthService.getCurrentUser();
         if (!user || (!user.id && !user._id)) {
            return `recordings_${drugId}_anonymous`;
         }
         return `recordings_${drugId}_user_${user.id || user._id}`;
      } catch (error) {
         console.error('Error generating user-specific storage key:', error);
         return `recordings_${drugId}_anonymous`;
      }
   },

   requestPermissions: async () => {
      try {
         await Audio.requestPermissionsAsync();
         await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
         });
         return true;
      } catch (err) {
         console.error('Failed to get recording permissions', err);
         return false;
      }
   },

   loadStoredRecordings: async (storageKey) => {
      try {
         // Get drug ID from the storage key
         const drugId = storageKey.split('_')[1];
         if (!drugId) {
            return [];
         }
         
         // Use user-specific storage key instead
         const userSpecificKey = await AudioRecorderManager._getUserSpecificStorageKey(drugId);
         
         // Try local cache first for faster access
         const savedRecordings = await AsyncStorage.getItem(userSpecificKey);
         if (savedRecordings) {
            return JSON.parse(savedRecordings);
         }
         
         // If not in local cache, try to get from backend
         try {
            const user = await AuthService.getCurrentUser();
            if (!user) {
               return [];
            }
            
            // Fetch recordings from backend with user ID filter
            const response = await apiClient.get(`/recordings/${drugId}?userId=${user.id || user._id}`);
            const recordings = response.data;
            
            // Cache the recordings locally for faster access
            await AsyncStorage.setItem(userSpecificKey, JSON.stringify(recordings));
            
            return recordings;
         } catch (serverError) {
            // Handle 404 errors gracefully (endpoint not implemented)
            if (serverError.response?.status === 404) {
               return [];
            }
            
            console.error('Error fetching recordings from server:', serverError);
            // If backend fetch fails, return empty array
            return [];
         }
      } catch (error) {
         console.error('Error loading recordings:', error);
         return [];
      }
   },

   saveRecordings: async (storageKey, recordings) => {
      try {
         // Get drug ID from the storage key
         const drugId = storageKey.split('_')[1];
         if (!drugId) {
            return true;
         }
         
         // Use user-specific storage key instead
         const userSpecificKey = await AudioRecorderManager._getUserSpecificStorageKey(drugId);
         
         // Save to local cache first for immediate access
         const jsonValue = JSON.stringify(recordings);
         await AsyncStorage.setItem(userSpecificKey, jsonValue);
         
         // Then try to save to backend
         try {
            const user = await AuthService.getCurrentUser();
            if (!user) {
               return true;
            }
            
            // Add user ID to each recording
            const recordingsWithUser = recordings.map(rec => ({
               ...rec,
               userId: user.id || user._id,
               username: user.username || user.name
            }));
            
            await apiClient.post(`/recordings/${drugId}`, { recordings: recordingsWithUser });
            
            try {
               const studyRecord = await RecordService.getStudyRecordById(user.id || user._id);
               
               const userName = user.name || user.username || (user.email ? user.email.split('@')[0] : 'Anonymous');
               
               if (studyRecord && (!studyRecord.username || !studyRecord.gender || !studyRecord.user)) {
                  
                  const updatedRecord = {
                     ...studyRecord,
                     username: userName,
                     name: userName, 
                     email: user.email || '',
                     gender: user.gender || 'Not specified',
                     user: {
                        id: user.id || user._id,
                        username: userName,
                        name: userName,
                        email: user.email || '',
                        gender: user.gender || 'Not specified'
                     }
                  };
                  
                  await RecordService.upsertStudyRecord(updatedRecord);
               }
            } catch (studyRecordError) {
               console.error('Could not update study record with user profile:', studyRecordError);
            }
            
            return true;
         } catch (serverError) {
            if (serverError.response?.status === 404) {
               return true;
            }
            
            console.error('Error saving recordings to server:', serverError);
            return true;
         }
      } catch (error) {
         console.error('Error saving recordings:', error);
         throw error;
      }
   },

   uploadAudioFile: async (uri, drugId, recordingId) => {
      try {
         const fileInfo = await FileSystem.getInfoAsync(uri);
         if (!fileInfo.exists) {
            throw new Error('Audio file not found');
         }
         
         const user = await AuthService.getCurrentUser();
         if (!user) {
            return uri; 
         }
         
         const formData = new FormData();
         formData.append('audio', {
            uri: uri,
            type: 'audio/m4a', 
            name: `recording_${recordingId}.m4a`,
         });
         formData.append('drugId', drugId);
         formData.append('recordingId', recordingId);
         formData.append('userId', user.id || user._id);
         formData.append('username', user.username || user.name || 'Anonymous');
         
         const response = await apiClient.post('/recordings/upload', formData, {
            headers: {
               'Content-Type': 'multipart/form-data',
            },
         });
         
         return response.data.fileUrl; 
      } catch (error) {
         if (error.response?.status === 404) {
            return uri;
         }
         
         console.error('Error uploading audio file:', error);
         return uri;
      }
   },

   downloadAudioFile: async (fileUrl, localFilename) => {
      try {
         const fileUri = `${FileSystem.documentDirectory}${localFilename}`;
         
         const fileInfo = await FileSystem.getInfoAsync(fileUri);
         if (fileInfo.exists) {
            return fileUri;
         }
         
         const downloadResult = await FileSystem.downloadAsync(fileUrl, fileUri);
         return downloadResult.uri;
      } catch (error) {
         console.error('Error downloading audio file:', error);
         throw error;
      }
   },

   startNewRecording: async () => {
      try {
         const { recording } = await Audio.Recording.createAsync(
            Audio.RecordingOptionsPresets.HIGH_QUALITY
         );
         return recording;
      } catch (error) {
         console.error('Failed to start recording', error);
         throw error;
      }
   },

   stopRecording: async (recording) => {
      try {
         if (!recording) {
            return null;
         }
         
         await recording.stopAndUnloadAsync();
         const uri = recording.getURI();
         
         try {
            const user = await AuthService.getCurrentUser();
            if (user) {
               const studyRecord = await RecordService.getStudyRecordById(user.id || user._id);
               
               if (studyRecord) {
                  const userName = user.name || user.username || (user.email ? user.email.split('@')[0] : 'Anonymous');
                  
                  if (!studyRecord.gender || !studyRecord.username || !studyRecord.user) {
                     const updatedRecord = {
                        ...studyRecord,
                        username: userName,
                        name: userName,
                        email: user.email || '',
                        gender: user.gender || 'Not specified',
                        user: {
                           id: user.id || user._id, 
                           username: userName,
                           name: userName,
                           email: user.email || '',
                           gender: user.gender || 'Not specified'
                        }
                     };
                     
                     await RecordService.upsertStudyRecord(updatedRecord);
                  }
               }
            }
         } catch (error) {
            console.error('Could not update study record with user profile after recording:', error);
         }
         
         return uri;
      } catch (error) {
         console.error('Failed to stop recording', error);
         return null;
      }
   },

   playSound: async (uri) => {
      try {
         const soundObject = new Audio.Sound();
         await soundObject.loadAsync({ uri });
         await soundObject.playAsync();
         return soundObject;
      } catch (error) {
         console.error('Failed to play sound', error);
         return null;
      }
   },

   stopSound: async (sound) => {
      try {
         if (!sound) {
            return;
         }
         
         await sound.stopAsync();
         await sound.unloadAsync();
      } catch (error) {
         console.error('Failed to stop sound', error);
      }
   },

   deleteRecording: async (recordingId, storageKey) => {
      try {
         const drugId = storageKey.split('_')[1];
         if (!drugId) {
            return false;
         }
         
         const userSpecificKey = await AudioRecorderManager._getUserSpecificStorageKey(drugId);
         
         const savedRecordingsStr = await AsyncStorage.getItem(userSpecificKey);
         if (!savedRecordingsStr) {
            return false;
         }
         
         const savedRecordings = JSON.parse(savedRecordingsStr);
         
         const recordingToDelete = savedRecordings.find(r => r.id === recordingId);
         if (!recordingToDelete) {
            return false;
         }
         
         try {
            const fileExists = await FileSystem.getInfoAsync(recordingToDelete.uri);
            if (fileExists.exists) {
               await FileSystem.deleteAsync(recordingToDelete.uri);
            }
         } catch (fileError) {
            console.error('Error deleting audio file:', fileError);
         }
         
         const updatedRecordings = savedRecordings.filter(r => r.id !== recordingId);
         
         await AsyncStorage.setItem(userSpecificKey, JSON.stringify(updatedRecordings));
         
         try {
            const user = await AuthService.getCurrentUser();
            if (user) {
               try {
                  await apiClient.delete(`/recordings/${drugId}/${recordingId}?userId=${user.id || user._id}`);
               } catch (apiError) {
                  if (apiError.response?.status !== 404) {
                     console.error('Error deleting recording from backend:', apiError);
                  }
               }
            }
         } catch (error) {
            console.error('Error during backend delete attempt:', error);
         }
         
         return true;
      } catch (error) {
         console.error('Error deleting recording:', error);
         return false;
      }
   },

   clearUserRecordings: async () => {
      try {
         const keys = await AsyncStorage.getAllKeys();
         
         const user = await AuthService.getCurrentUser();
         if (!user) return;
         
         const userId = user.id || user._id;
         const userRecordingKeys = keys.filter(key => 
            key.startsWith('recordings_') && key.includes(`_user_${userId}`)
         );
         
         if (userRecordingKeys.length > 0) {
            await AsyncStorage.multiRemove(userRecordingKeys);
         }
      } catch (error) {
         console.error('Error clearing user recordings:', error);
      }
   }
};

export default AudioRecorderManager;
