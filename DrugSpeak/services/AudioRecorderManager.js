import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import apiClient from '../api/apiClient';
import AuthService from '../api/authService';

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
         console.log(`Loading recordings with key ${storageKey}`);
         
         // Try local cache first for faster access
         const savedRecordings = await AsyncStorage.getItem(storageKey);
         if (savedRecordings) {
            console.log('Found saved recordings in local cache');
            return JSON.parse(savedRecordings);
         }
         
         // If not in local cache, try to get from backend
         try {
            const user = await AuthService.getCurrentUser();
            if (!user) {
               console.log('No user logged in, cannot fetch recordings from backend');
               return [];
            }
            
            // Get drugId from storageKey
            const drugId = storageKey.split('_')[1];
            if (!drugId) {
               console.log('Invalid storage key format, cannot extract drugId');
               return [];
            }
            
            // Fetch recordings from backend
            const response = await apiClient.get(`/recordings/${drugId}`);
            const recordings = response.data;
            
            // Cache the recordings locally for faster access
            await AsyncStorage.setItem(storageKey, JSON.stringify(recordings));
            
            console.log(`Fetched ${recordings.length} recordings from backend`);
            return recordings;
         } catch (serverError) {
            // Handle 404 errors gracefully (endpoint not implemented)
            if (serverError.response?.status === 404) {
               console.log('Recordings endpoint not implemented yet, using local data only');
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
         console.log(`Saving ${recordings.length} recordings`);
         
         // Save to local cache first for immediate access
         const jsonValue = JSON.stringify(recordings);
         await AsyncStorage.setItem(storageKey, jsonValue);
         
         // Then try to save to backend
         try {
            const user = await AuthService.getCurrentUser();
            if (!user) {
               console.log('No user logged in, cannot save recordings to backend');
               return true;
            }
            
            // Get drugId from storageKey
            const drugId = storageKey.split('_')[1];
            if (!drugId) {
               console.log('Invalid storage key format, cannot extract drugId');
               return true;
            }
            
            // Save recordings to backend
            await apiClient.post(`/recordings/${drugId}`, { recordings });
            
            console.log('Recordings saved successfully to backend');
            return true;
         } catch (serverError) {
            // Handle 404 errors gracefully (endpoint not implemented)
            if (serverError.response?.status === 404) {
               console.log('Recordings save endpoint not implemented yet, keeping data local');
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
         console.log('Uploading audio file to server:', uri);
         
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
         
         console.log('Audio file uploaded successfully');
         return response.data.fileUrl; // Return the URL of the uploaded file
      } catch (error) {
         // Handle 404 error (endpoint not implemented)
         if (error.response?.status === 404) {
            console.log('Audio upload endpoint not implemented yet, keeping file local');
            return uri;
         }
         
         console.error('Error uploading audio file:', error);
         // Return the local URI as fallback
         return uri;
      }
   },

   downloadAudioFile: async (fileUrl, localFilename) => {
      try {
         console.log('Downloading audio file:', fileUrl);
         
         // Define where to save the file
         const fileUri = `${FileSystem.documentDirectory}${localFilename}`;
         
         // Check if we already have this file cached
         const fileInfo = await FileSystem.getInfoAsync(fileUri);
         if (fileInfo.exists) {
            console.log('File already exists locally');
            return fileUri;
         }
         
         // Download the file
         const downloadResult = await FileSystem.downloadAsync(fileUrl, fileUri);
         console.log('File downloaded to:', downloadResult.uri);
         return downloadResult.uri;
      } catch (error) {
         console.error('Error downloading audio file:', error);
         throw error;
      }
   },

   startNewRecording: async () => {
      try {
         console.log('Starting recording...');
         const { recording } = await Audio.Recording.createAsync(
            Audio.RecordingOptionsPresets.HIGH_QUALITY
         );
         console.log('Recording started');
         return recording;
      } catch (error) {
         console.error('Failed to start recording', error);
         throw error;
      }
   },

   stopRecording: async (recording) => {
      try {
         if (!recording) {
            console.log('No recording to stop');
            return null;
         }
         
         console.log('Stopping recording...');
         await recording.stopAndUnloadAsync();
         const uri = recording.getURI();
         console.log('Recording saved at:', uri);
         return uri;
      } catch (error) {
         console.error('Failed to stop recording', error);
         throw error;
      }
   },

   playSound: async (uri) => {
      try {
         console.log('Playing sound from URI:', uri);
         const { sound } = await Audio.Sound.createAsync(
            { uri },
            { shouldPlay: true }
         );
         return sound;
      } catch (error) {
         console.error('Failed to play sound', error);
         throw error;
      }
   },

   stopSound: async (sound) => {
      if (!sound) {
         console.log('No sound to stop');
         return;
      }
      
      try {
         console.log('Stopping sound');
         await sound.stopAsync();
         await sound.unloadAsync();
         console.log('Sound stopped and unloaded');
      } catch (error) {
         console.error('Failed to stop sound', error);
         throw error;
      }
   },
   
   deleteRecording: async (storageKey, recordingId) => {
      try {
         console.log(`Deleting recording ${recordingId}`);
         
         // Get current recordings
         const savedRecordingsStr = await AsyncStorage.getItem(storageKey);
         if (!savedRecordingsStr) {
            console.log('No recordings found to delete from');
            return true;
         }
         
         const savedRecordings = JSON.parse(savedRecordingsStr);
         
         // Find the recording to delete
         const recordingToDelete = savedRecordings.find(r => r.id === recordingId);
         if (!recordingToDelete) {
            console.log('Recording not found in saved recordings');
            return true;
         }
         
         // Delete the actual audio file if it's local
         if (recordingToDelete.uri && recordingToDelete.uri.startsWith('file://')) {
            try {
               const fileInfo = await FileSystem.getInfoAsync(recordingToDelete.uri);
               if (fileInfo.exists) {
                  await FileSystem.deleteAsync(recordingToDelete.uri);
                  console.log('Deleted audio file:', recordingToDelete.uri);
               }
            } catch (fileError) {
               console.error('Error deleting audio file:', fileError);
            }
         }
         
         // Filter out the deleted recording
         const updatedRecordings = savedRecordings.filter(r => r.id !== recordingId);
         
         // Save updated recordings list to local storage
         await AsyncStorage.setItem(storageKey, JSON.stringify(updatedRecordings));
         
         // Try to delete from backend
         try {
            const user = await AuthService.getCurrentUser();
            if (!user) return true;
            
            const drugId = storageKey.split('_')[1];
            if (!drugId) return true;
            
            // Send delete request to server
            await apiClient.delete(`/recordings/${drugId}/${recordingId}`);
            console.log('Recording deleted from backend');
         } catch (serverError) {
            // Don't log 404 errors (endpoint not implemented) as errors
            if (serverError.response?.status !== 404) {
               console.error('Error deleting recording from server:', serverError);
            } else {
               console.log('Recording delete endpoint not implemented yet');
            }
         }
         
         return true;
      } catch (error) {
         console.error('Error deleting recording:', error);
         throw error;
      }
   }
};

export default AudioRecorderManager;
