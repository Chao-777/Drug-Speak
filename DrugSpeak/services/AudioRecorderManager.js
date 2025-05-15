import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
         const savedRecordings = await AsyncStorage.getItem(storageKey);
         
         if (savedRecordings) {
         console.log('Found saved recordings');
         return JSON.parse(savedRecordings);
         }
         console.log('No saved recordings found');
         return [];
      } catch (error) {
         console.error('Error loading recordings:', error);
         throw error;
      }
   },

   saveRecordings: async (storageKey, recordings) => {
      try {
         console.log(`Saving ${recordings.length} recordings`);
         const jsonValue = JSON.stringify(recordings);
         await AsyncStorage.setItem(storageKey, jsonValue);
         console.log('Recordings saved successfully');
         return true;
      } catch (error) {
         console.error('Error saving recordings:', error);
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
   }
};

export default AudioRecorderManager;
