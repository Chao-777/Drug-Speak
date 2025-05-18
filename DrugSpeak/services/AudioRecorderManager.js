import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import apiClient from '../api/apiClient';
import AuthService from '../api/authService';
import RecordService from '../api/recordService';

const AudioRecorderManager = {
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
         // Try local cache first for faster access
         const savedRecordings = await AsyncStorage.getItem(storageKey);
         if (savedRecordings) {
            return JSON.parse(savedRecordings);
         }
         
         // If not in local cache, try to get from backend
         try {
            const user = await AuthService.getCurrentUser();
            if (!user) {
               return [];
            }
            
            // Get drugId from storageKey
            const drugId = storageKey.split('_')[1];
            if (!drugId) {
               return [];
            }
            
            // Fetch recordings from backend
            const response = await apiClient.get(`/recordings/${drugId}`);
            const recordings = response.data;
            
            // Cache the recordings locally for faster access
            await AsyncStorage.setItem(storageKey, JSON.stringify(recordings));
            
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
         // Save to local cache first for immediate access
         const jsonValue = JSON.stringify(recordings);
         await AsyncStorage.setItem(storageKey, jsonValue);
         
         // Then try to save to backend
         try {
            const user = await AuthService.getCurrentUser();
            if (!user) {
               return true;
            }
            
            // Get drugId from storageKey
            const drugId = storageKey.split('_')[1];
            if (!drugId) {
               return true;
            }
            
            // Save recordings to backend
            await apiClient.post(`/recordings/${drugId}`, { recordings });
            
            // Also ensure user study record is updated with current user profile
            // This fixes the issue where user gender and name might not be included
            try {
               // Get current study record
               const studyRecord = await RecordService.getStudyRecordById(user.id || user._id);
               
               // Prepare username with consistent field naming
               const userName = user.name || user.username || (user.email ? user.email.split('@')[0] : 'Anonymous');
               
               // Only update if study record exists and doesn't have proper user data
               if (studyRecord && (!studyRecord.username || !studyRecord.gender || !studyRecord.user)) {

                  
                  const updatedRecord = {
                     ...studyRecord,
                     username: userName,
                     name: userName, // Add both fields for compatibility
                     email: user.email || '',
                     gender: user.gender || 'Not specified',
                     // Also include a nested user object with full profile information
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
            // Handle 404 errors gracefully (endpoint not implemented)
            if (serverError.response?.status === 404) {
               return true;
            }
            
            console.error('Error saving recordings to server:', serverError);
            // We already saved locally, so still return true
            return true;
         }
      } catch (error) {
         console.error('Error saving recordings:', error);
         throw error;
      }
   },

   uploadAudioFile: async (uri, drugId, recordingId) => {
      try {
         // Check if the file exists
         const fileInfo = await FileSystem.getInfoAsync(uri);
         if (!fileInfo.exists) {
            throw new Error('Audio file not found');
         }
         
         // Create form data for file upload
         const formData = new FormData();
         formData.append('audio', {
            uri: uri,
            type: 'audio/m4a', // Adjust based on your recording format
            name: `recording_${recordingId}.m4a`,
         });
         formData.append('drugId', drugId);
         formData.append('recordingId', recordingId);
         
         // Upload the file
         const response = await apiClient.post('/recordings/upload', formData, {
            headers: {
               'Content-Type': 'multipart/form-data',
            },
         });
         
         return response.data.fileUrl; // Return the URL of the uploaded file
      } catch (error) {
         // Handle 404 error (endpoint not implemented)
         if (error.response?.status === 404) {
            return uri;
         }
         
         console.error('Error uploading audio file:', error);
         // Return the local URI as fallback
         return uri;
      }
   },

   downloadAudioFile: async (fileUrl, localFilename) => {
      try {
         // Define where to save the file
         const fileUri = `${FileSystem.documentDirectory}${localFilename}`;
         
         // Check if we already have this file cached
         const fileInfo = await FileSystem.getInfoAsync(fileUri);
         if (fileInfo.exists) {
            return fileUri;
         }
         
         // Download the file
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
         
         // Update study record with user information to fix Community screen issues
         try {
            const user = await AuthService.getCurrentUser();
            if (user) {
               // Try to update the study record with user profile data
               const studyRecord = await RecordService.getStudyRecordById(user.id || user._id);
               
               if (studyRecord) {
                  // Prepare username with consistent field naming
                  const userName = user.name || user.username || (user.email ? user.email.split('@')[0] : 'Anonymous');
                  
                  // Only update if missing fields
                  if (!studyRecord.gender || !studyRecord.username || !studyRecord.user) {
                     const updatedRecord = {
                        ...studyRecord,
                        username: userName,
                        name: userName,
                        email: user.email || '',
                        gender: user.gender || 'Not specified',
                        // Also include a nested user object with full profile information
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
         // Load existing recordings
         const savedRecordingsStr = await AsyncStorage.getItem(storageKey);
         if (!savedRecordingsStr) {
            return false;
         }
         
         const savedRecordings = JSON.parse(savedRecordingsStr);
         
         // Find the recording to delete
         const recordingToDelete = savedRecordings.find(r => r.id === recordingId);
         if (!recordingToDelete) {
            return false;
         }
         
         // Delete the actual audio file
         try {
            const fileExists = await FileSystem.getInfoAsync(recordingToDelete.uri);
            if (fileExists.exists) {
               await FileSystem.deleteAsync(recordingToDelete.uri);
            }
         } catch (fileError) {
            console.error('Error deleting audio file:', fileError);
         }
         
         // Remove from array of recordings
         const updatedRecordings = savedRecordings.filter(r => r.id !== recordingId);
         
         // Save updated recordings list
         await AsyncStorage.setItem(storageKey, JSON.stringify(updatedRecordings));
         
         // Try to delete from backend as well
         try {
            // Extract drug ID from storage key
            const drugId = storageKey.split('_')[1];
            if (drugId) {
               // Delete from backend
               try {
                  await apiClient.delete(`/recordings/${drugId}/${recordingId}`);
               } catch (apiError) {
                  // Handle 404 (endpoint not implemented)
                  if (apiError.response?.status !== 404) {
                     console.error('Error deleting recording from backend:', apiError);
                  }
               }
            }
         } catch (error) {
            // If backend delete fails, we still deleted locally
            console.error('Error during backend delete attempt:', error);
         }
         
         return true;
      } catch (error) {
         console.error('Error deleting recording:', error);
         return false;
      }
   }
};

export default AudioRecorderManager;
