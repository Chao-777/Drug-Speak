import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Spacing, Typography, Borders } from '../constants/color';
import PronunciationCard from '../components/PronunciationCard';
import { removeFromLearningList, updateLearningStatus } from '../store/learningListSlice';
import { drugCategory } from '../data/resource';
import RecordService from '../api/recordService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LearningScreen = ({ route, navigation }) => {
   const { drug } = route.params;
   const learningList = useSelector(state => state.learningList.learningList || []);
   const dispatch = useDispatch();
   const [openDropdownId, setOpenDropdownId] = useState(null);
   const [isLoading, setIsLoading] = useState(false);
   const [studyStats, setStudyStats] = useState({
      currentLearning: 0,
      finishedLearning: 0,
      totalScore: 0
   });
   const [userData, setUserData] = useState(null);
   
   // Recording state
   const [recording, setRecording] = useState();
   const [isRecording, setIsRecording] = useState(false);
   const [recordings, setRecordings] = useState([]);
   const [sound, setSound] = useState(null);
   const [playingRecordingId, setPlayingRecordingId] = useState(null);

   const currentLearning = learningList.filter(item => item.status === 'current');
   const finishedLearning = learningList.filter(item => item.status === 'finished');

   // Key for storing recordings in AsyncStorage
   const RECORDINGS_STORAGE_KEY = `recordings_${drug.id}`;

   useEffect(() => {
      // Load user data and statistics
      const loadData = async () => {
         try {
            const userDataString = await AsyncStorage.getItem('userData');
            if (userDataString) {
               setUserData(JSON.parse(userDataString));
               
               const user = JSON.parse(userDataString);
               
               try {
                  const record = await RecordService.getStudyRecordById(user.id);
                  if (record) {
                     setStudyStats({
                        currentLearning: record.currentLearning || 0,
                        finishedLearning: record.finishedLearning || 0,
                        totalScore: record.totalScore || 0
                     });
                  }
               } catch (error) {
                  if (error.message === "Study record not found for this user." || 
                        (error.response && error.response.status === 404)) {
                     
                     console.log("No study record found. Creating a new one...");
                     
                     const newStats = {
                        currentLearning: currentLearning.length,
                        finishedLearning: finishedLearning.length,
                        totalScore: 0
                     };
                     
                     await RecordService.upsertStudyRecord(newStats);
                     setStudyStats(newStats);
                  } else {
                     console.error('Error fetching study record:', error);
                  }
               }
            }
         } catch (error) {
            console.error('Error loading data:', error);
         }
      };
      
      loadData();
      
      // Load saved recordings for this drug
      loadRecordings();
      
      // Set up audio recording permissions
      setupAudioRecording();
      
      // Clean up when component unmounts
      return () => {
         if (recording) {
            recording.stopAndUnloadAsync();
         }
         if (sound) {
            sound.unloadAsync();
         }
      };
   }, []);

   const setupAudioRecording = async () => {
      try {
         // Request permissions
         await Audio.requestPermissionsAsync();
         await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
         });
      } catch (err) {
         console.error('Failed to get recording permissions', err);
      }
   };

   const loadRecordings = async () => {
      try {
         console.log(`Loading recordings for drug ${drug.id}`);
         const savedRecordings = await AsyncStorage.getItem(RECORDINGS_STORAGE_KEY);
         
         if (savedRecordings) {
            console.log('Found saved recordings:', savedRecordings);
            const parsedRecordings = JSON.parse(savedRecordings);
            setRecordings(parsedRecordings);
         } else {
            console.log('No saved recordings found');
            setRecordings([]);
         }
      } catch (error) {
         console.error('Error loading recordings:', error);
         Alert.alert('Error', 'Failed to load your recordings');
      }
   };
   
   const saveRecordings = async (updatedRecordings) => {
      try {
         console.log(`Saving ${updatedRecordings.length} recordings for drug ${drug.id}`);
         const jsonValue = JSON.stringify(updatedRecordings);
         await AsyncStorage.setItem(RECORDINGS_STORAGE_KEY, jsonValue);
         console.log('Recordings saved successfully');
      } catch (error) {
         console.error('Error saving recordings:', error);
         Alert.alert('Error', 'Failed to save your recording');
      }
   };

   const startRecording = async () => {
      try {
         // Ensure permissions and setup
         await setupAudioRecording();

         console.log('Starting recording...');
         // Create new recording instance
         const { recording: newRecording } = await Audio.Recording.createAsync(
            Audio.RecordingOptionsPresets.HIGH_QUALITY
         );
         
         setRecording(newRecording);
         setIsRecording(true);
         console.log('Recording started');
      } catch (err) {
         console.error('Failed to start recording', err);
         Alert.alert('Error', 'Failed to start recording');
      }
   };

   const stopRecording = async () => {
      try {
         if (!recording) {
            console.log('No recording to stop');
            return;
         }
         
         console.log('Stopping recording...');
         // Stop recording
         await recording.stopAndUnloadAsync();
         
         // Get recording URI
         const uri = recording.getURI();
         console.log('Recording saved at:', uri);
         
         // Create a new recording entry
         const newRecording = {
            id: Date.now().toString(),
            uri,
            timestamp: new Date().toISOString(), // Store as ISO string for consistent serialization
            evaluation: 'good', // Default evaluation
         };
         
         // Add to recordings list
         const updatedRecordings = [...recordings, newRecording];
         setRecordings(updatedRecordings);
         
         // Save to storage
         await saveRecordings(updatedRecordings);
         
         // Reset recording
         setRecording(undefined);
         setIsRecording(false);
         console.log('Recording stopped and saved');
      } catch (err) {
         console.error('Failed to stop recording', err);
         Alert.alert('Error', 'Failed to save recording');
      }
   };

   const playRecording = async (recordingId) => {
      try {
         // If already playing this recording, stop it
         if (playingRecordingId === recordingId) {
            if (sound) {
               await sound.stopAsync();
               setPlayingRecordingId(null);
            }
            return;
         }
         
         // Stop any current playback
         if (sound) {
            await sound.stopAsync();
            await sound.unloadAsync();
            setSound(null);
         }
         
         // Find the recording
         const recordingToPlay = recordings.find(rec => rec.id === recordingId);
         if (!recordingToPlay) {
            console.error('Recording not found:', recordingId);
            return;
         }
         
         console.log('Playing recording:', recordingToPlay.uri);
         // Load and play the sound
         const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: recordingToPlay.uri },
            { shouldPlay: true }
         );
         
         // Set up completion callback
         newSound.setOnPlaybackStatusUpdate(status => {
            if (status.didJustFinish) {
               console.log('Playback finished');
               setPlayingRecordingId(null);
            }
         });
         
         setSound(newSound);
         setPlayingRecordingId(recordingId);
      } catch (err) {
         console.error('Failed to play recording', err);
         Alert.alert('Error', 'Failed to play recording');
         setPlayingRecordingId(null);
      }
   };

   const deleteRecording = (recordingId) => {
      // Confirm deletion
      Alert.alert(
         "Delete Recording",
         "Are you sure you want to delete this recording?",
         [
            {
               text: "Cancel",
               style: "cancel"
            },
            {
               text: "Delete",
               style: "destructive",
               onPress: async () => {
                  try {
                     // If this recording is currently playing, stop it
                     if (playingRecordingId === recordingId && sound) {
                        await sound.stopAsync();
                        await sound.unloadAsync();
                        setSound(null);
                        setPlayingRecordingId(null);
                     }
                     
                     console.log('Deleting recording:', recordingId);
                     // Filter out the deleted recording
                     const updatedRecordings = recordings.filter(rec => rec.id !== recordingId);
                     setRecordings(updatedRecordings);
                     
                     // Save to storage
                     await saveRecordings(updatedRecordings);
                     console.log('Recording deleted and storage updated');
                  } catch (error) {
                     console.error('Error deleting recording:', error);
                     Alert.alert('Error', 'Failed to delete recording');
                  }
               }
            }
         ]
      );
   };

   const formatTimestamp = (timestamp) => {
      // If timestamp is an ISO string, parse it to a Date object
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      
      return date.toLocaleString('en-US', {
         month: 'short',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
      });
   };

   const getCategoryNames = (categoryIds) => {
      if (!categoryIds || !Array.isArray(categoryIds)) return '';
      
      return categoryIds.map(categoryId => {
         const category = drugCategory[categoryId];
         return category ? category.name : categoryId;
      }).join(', ');
   };

   const handleFinish = async () => {
      try {
         setIsLoading(true);
         
         dispatch(updateLearningStatus({ id: drug.id, status: 'finished' }));
         
         if (!userData) {
            const userDataString = await AsyncStorage.getItem('userData');
            if (userDataString) {
               setUserData(JSON.parse(userDataString));
            } else {
               throw new Error('User data not found. Please log in again.');
            }
         }
         
         const updatedCurrentLearning = learningList.filter(
            item => item.id !== drug.id && item.status === 'current'
         ).length;
         
         const updatedFinishedLearning = learningList.filter(
            item => (item.id === drug.id || item.status === 'finished')
         ).length;
         
         const newStats = {
            currentLearning: updatedCurrentLearning,
            finishedLearning: updatedFinishedLearning,
            totalScore: studyStats.totalScore + 10 
         };
         
         await RecordService.upsertStudyRecord(newStats);
         
         setStudyStats(newStats);
         
         Alert.alert(
            "Success",
            `${drug.name} marked as finished!`,
            [{ text: "OK", onPress: () => navigation.goBack() }]
         );
      } catch (error) {
         console.error('Error updating study record:', error);
         Alert.alert(
            "Error",
            error.message || "Failed to update study record",
            [{ text: "OK" }]
         );
      } finally {
         setIsLoading(false);
      }
   };

   const handleRemove = async () => {
      try {
         setIsLoading(true);
         
         const isCurrentDrug = drug.status === 'current';
         const isFinishedDrug = drug.status === 'finished';
         
         dispatch(removeFromLearningList(drug.id));
         
         if (!userData) {
            const userDataString = await AsyncStorage.getItem('userData');
            if (userDataString) {
               setUserData(JSON.parse(userDataString));
            } else {
               navigation.goBack();
               return;
            }
         }
         
         const newStats = {
            currentLearning: isCurrentDrug ? 
               Math.max(0, studyStats.currentLearning - 1) : 
               studyStats.currentLearning,
            finishedLearning: isFinishedDrug ? 
               Math.max(0, studyStats.finishedLearning - 1) : 
               studyStats.finishedLearning,
            totalScore: studyStats.totalScore 
         };
         
         await RecordService.upsertStudyRecord(newStats);
         
         navigation.goBack();
      } catch (error) {
         console.error('Error updating study record:', error);
         navigation.goBack();
      } finally {
         setIsLoading(false);
      }
   };

   const handleToggleDropdown = (id) => {
      setOpenDropdownId(prev => prev === id ? null : id);
   };

   const RecordingItem = ({ recording }) => (
      <View style={{
         flexDirection: 'row',
         alignItems: 'center',
         backgroundColor: Colors.cardBackground,
         borderRadius: Borders.radius.medium,
         padding: Spacing.md,
         marginBottom: Spacing.sm,
         borderWidth: 1,
         borderColor: Colors.border,
      }}>
         {/* Play button */}
         <TouchableOpacity
            style={{
               padding: Spacing.sm,
               borderRadius: 20,
               backgroundColor: playingRecordingId === recording.id ? Colors.error : Colors.primary,
               marginRight: Spacing.md,
            }}
            onPress={() => playRecording(recording.id)}
         >
            <Icon
               name={playingRecordingId === recording.id ? "stop" : "play-arrow"}
               size={24}
               color="white"
            />
         </TouchableOpacity>
         
         {/* Timestamp */}
         <View style={{ flex: 1 }}>
            <Text style={{
               fontSize: Typography.sizes.small,
               color: Colors.textSecondary,
               marginBottom: 2,
            }}>
               {formatTimestamp(recording.timestamp)}
            </Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
               <Text style={{
                  fontSize: Typography.sizes.body,
                  fontWeight: Typography.weights.medium,
                  color: Colors.textPrimary,
               }}>
                  My Recording
               </Text>
            </View>
         </View>
         
         {/* Delete button */}
         <TouchableOpacity
            style={{
               padding: Spacing.sm,
               borderRadius: 20,
            }}
            onPress={() => deleteRecording(recording.id)}
         >
            <Icon
               name="delete"
               size={24}
               color={Colors.error}
            />
         </TouchableOpacity>
      </View>
   );

   return (
      <SafeAreaView style={{
         flex: 1,
         backgroundColor: Colors.background,
      }}>
         <ScrollView>
            <View style={{
               padding: Spacing.lg,
               backgroundColor: Colors.cardBackground,
               alignItems: 'center',
               borderBottomWidth: Borders.width.thin,
               borderBottomColor: Colors.border,
            }}>
               <Text style={{
                  fontSize: Typography.sizes.heading,
                  fontWeight: Typography.weights.bold,
                  color: Colors.textPrimary,
                  textAlign: 'center',
               }}>
                  {drug.name}
               </Text>
               <Text style={{
                  fontSize: Typography.sizes.body,
                  color: Colors.textSecondary,
                  marginTop: Spacing.xs,
               }}>
                  {drug.molecular_formula}
               </Text>
            </View>

            <View style={{
               padding: Spacing.lg,
               backgroundColor: Colors.cardBackground,
               borderBottomWidth: Borders.width.thin,
               borderBottomColor: Colors.border,
            }}>
               <Text style={{
                  fontSize: Typography.sizes.body,
                  color: Colors.textPrimary,
               }}>
                  <Text style={{ fontWeight: Typography.weights.bold }}>
                  Categories: 
                  </Text>
                  {' '}{getCategoryNames(drug.categories)}
               </Text>
            </View>

            <View style={{
               padding: Spacing.lg,
               backgroundColor: Colors.cardBackground,
               borderBottomWidth: Borders.width.thin,
               borderBottomColor: Colors.border,
            }}>
               <Text style={{
                  fontSize: Typography.sizes.body,
                  color: Colors.textPrimary,
                  lineHeight: Typography.sizes.body * 1.5,
               }}>
                  {drug.desc}
               </Text>
            </View>

            <View style={{
               padding: Spacing.lg,
               backgroundColor: Colors.cardBackground,
            }}>
               <Text style={{
                  fontSize: Typography.sizes.subtitle,
                  fontWeight: Typography.weights.bold,
                  color: Colors.textPrimary,
                  marginBottom: Spacing.sm,
               }}>
                  Pronunciation
               </Text>
               {drug.sounds && drug.sounds.map((sound, index) => (
                  <PronunciationCard 
                  key={`${drug.id}_${sound.gender}`}
                  id={`${drug.id}_${sound.gender}`}
                  drugName={drug.name} 
                  gender={sound.gender}
                  audioFile={sound.file}
                  isDropdownOpen={openDropdownId === `${drug.id}_${sound.gender}`}
                  onToggleDropdown={handleToggleDropdown}
                  />
               ))}
            </View>

            <View style={{
               padding: Spacing.lg,
               backgroundColor: Colors.cardBackground,
               marginTop: Spacing.md,
               borderTopWidth: Borders.width.thin,
               borderTopColor: Colors.border,
            }}>
               <Text style={{
                  fontSize: Typography.sizes.subtitle,
                  fontWeight: Typography.weights.bold,
                  color: Colors.textPrimary,
                  marginBottom: Spacing.md,
               }}>
                  Practice Pronunciation
               </Text>
               
               <TouchableOpacity 
                  style={{
                     width: 120,
                     height: 120,
                     borderRadius: 60,
                     backgroundColor: isRecording ? Colors.error : '#000080', 
                     justifyContent: 'center',
                     alignItems: 'center',
                     alignSelf: 'center',
                     marginBottom: Spacing.md,
                  }}
                  onPressIn={startRecording}
                  onPressOut={stopRecording}
               >
                  <Text style={{
                     color: 'white',
                     fontWeight: Typography.weights.bold,
                     fontSize: Typography.sizes.body,
                     textAlign: 'center',
                  }}>
                     {isRecording ? 'Recording...' : 'Hold to Record'}
                  </Text>
               </TouchableOpacity>

               {/* Recordings List */}
               {recordings.length > 0 && (
                  <View style={{ marginTop: Spacing.md }}>
                     <Text style={{
                        fontSize: Typography.sizes.subtitle,
                        fontWeight: Typography.weights.bold,
                        color: Colors.textPrimary,
                        marginBottom: Spacing.sm,
                     }}>
                        My Recordings ({recordings.length})
                     </Text>
                     
                     {recordings.map(recording => (
                        <RecordingItem key={recording.id} recording={recording} />
                     ))}
                  </View>
               )}
            </View>
         </ScrollView>
         
         <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            borderTopWidth: 1,
            borderTopColor: Colors.border,
            paddingVertical: Spacing.sm,
            paddingHorizontal: Spacing.lg,
            backgroundColor: Colors.cardBackground,
         }}>
            <TouchableOpacity
               style={{
                  flexDirection: 'row',
                  alignItems: 'center',
               }}
               onPress={handleRemove}
               disabled={isLoading}
            >
               <Icon name="delete-outline" size={24} color={isLoading ? Colors.textLight : Colors.error} />
               <Text style={{
                  marginLeft: Spacing.xs,
                  color: isLoading ? Colors.textLight : Colors.error,
                  fontSize: Typography.sizes.body,
               }}>
                  Remove
               </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
               style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: isLoading ? Colors.textLight : Colors.primary,
                  paddingVertical: Spacing.sm,
                  paddingHorizontal: Spacing.md,
                  borderRadius: Borders.radius.medium,
               }}
               onPress={handleFinish}
               disabled={isLoading}
            >
               <Icon name="check" size={20} color="white" />
               <Text style={{
                  marginLeft: Spacing.xs,
                  color: 'white',
                  fontWeight: Typography.weights.bold,
                  fontSize: Typography.sizes.body,
               }}>
                  {isLoading ? "Updating..." : "Finish"}
               </Text>
            </TouchableOpacity>
         </View>
      </SafeAreaView>
   );
};

export default LearningScreen;
