import React, { useState, useEffect } from 'react';
import { ScrollView, SafeAreaView, View, Text, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { removeFromLearningList, updateLearningStatus } from '../store/learningListSlice';
import { drugCategory } from '../data/resource';
import RecordService from '../api/recordService';
import { Colors, Typography, Spacing } from '../constants/color';
import PronunciationCard from '../components/PronunciationCard';
import DrugHeader from '../components/DrugHeader';
import ContentSection from '../components/ContentSection';
import LabeledText from '../components/LabeledText';
import {SectionHeader} from '../components/SectionHeader';
import {RecordButton} from '../components/Button';
import RecordingItem from '../components/RecordingItem';
import BottomActionBar from '../components/BottomActionBar';
import AudioRecorderManager from '../services/AudioRecorderManager';

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
      const [recording, setRecording] = useState();
   const [isRecording, setIsRecording] = useState(false);
   const [recordings, setRecordings] = useState([]);
   const [sound, setSound] = useState(null);
   const [playingRecordingId, setPlayingRecordingId] = useState(null);

   const currentLearning = learningList.filter(item => item.status === 'current');
   const finishedLearning = learningList.filter(item => item.status === 'finished');

   const RECORDINGS_STORAGE_KEY = `recordings_${drug.id}`;

   useEffect(() => {
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
      
      loadRecordings();
      
      setupAudioRecording();
      
      return () => {
         if (recording) {
            recording.stopAndUnloadAsync();
         }
         
         stopAnyPlayback();
      };
   }, []);

   const setupAudioRecording = async () => {
      try {
         await AudioRecorderManager.requestPermissions();
      } catch (err) {
         console.error('Failed to get recording permissions', err);
         Alert.alert('Permission Error', 'Cannot access microphone. Please check app permissions.');
      }
   };

   const loadRecordings = async () => {
      try {
         const savedRecordings = await AudioRecorderManager.loadStoredRecordings(RECORDINGS_STORAGE_KEY);
         setRecordings(savedRecordings);
      } catch (error) {
         console.error('Error loading recordings:', error);
         Alert.alert('Error', 'Failed to load your recordings');
      }
   };
   
   const saveRecordings = async (updatedRecordings) => {
      try {
         await AudioRecorderManager.saveRecordings(RECORDINGS_STORAGE_KEY, updatedRecordings);
      } catch (error) {
         console.error('Error saving recordings:', error);
         Alert.alert('Error', 'Failed to save your recording');
      }
   };

   const startRecording = async () => {
      try {
         await setupAudioRecording();
         await stopAnyPlayback();
         
         const newRecording = await AudioRecorderManager.startNewRecording();
         setRecording(newRecording);
         setIsRecording(true);
      } catch (err) {
         console.error('Failed to start recording', err);
         Alert.alert('Error', 'Failed to start recording');
      }
   };

   const stopRecording = async () => {
      try {
         if (!recording) {
            return;
         }
         
         const uri = await AudioRecorderManager.stopRecording(recording);
         
         const newRecording = {
            id: Date.now().toString(),
            uri,
            timestamp: new Date().toISOString(),
            evaluation: 'good', 
         };
         
         const updatedRecordings = [...recordings, newRecording];
         setRecordings(updatedRecordings);
         
         await saveRecordings(updatedRecordings);
         
         setRecording(undefined);
         setIsRecording(false);
      } catch (err) {
         console.error('Failed to stop recording', err);
         Alert.alert('Error', 'Failed to save recording');
      }
   };

   const stopAnyPlayback = async () => {
      if (sound) {
         try {
            await AudioRecorderManager.stopSound(sound);
            setSound(null);
            setPlayingRecordingId(null);
         } catch (error) {
            console.error('Error stopping playback:', error);
         }
      }
   };

   const playRecording = async (recordingId) => {
      try {
         if (playingRecordingId === recordingId) {
            await stopAnyPlayback();
            return;
         }
         
         await stopAnyPlayback();
         
         const recordingToPlay = recordings.find(rec => rec.id === recordingId);
         if (!recordingToPlay) {
            console.error('Recording not found:', recordingId);
            return;
         }
         
         const newSound = await AudioRecorderManager.playSound(recordingToPlay.uri);
         
         newSound.setOnPlaybackStatusUpdate(status => {
            if (status.didJustFinish) {
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
                     if (playingRecordingId === recordingId) {
                        await stopAnyPlayback();
                     }
                     
                     const updatedRecordings = recordings.filter(rec => rec.id !== recordingId);
                     setRecordings(updatedRecordings);
                     
                     await saveRecordings(updatedRecordings);
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

   return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
         <ScrollView>
            <DrugHeader name={drug.name} formula={drug.molecular_formula} />
            
            <ContentSection>
               <LabeledText 
                  label="Categories" 
                  value={getCategoryNames(drug.categories)} 
               />
            </ContentSection>
            
            <ContentSection>
               <Text style={{
                  fontSize: Typography.sizes.body,
                  color: Colors.textPrimary,
                  lineHeight: Typography.sizes.body * 1.5,
               }}>
                  {drug.desc}
               </Text>
            </ContentSection>
            
            <ContentSection noBorder>
               <SectionHeader title="Pronunciation" />
               
               {drug.sounds && drug.sounds.map((sound) => (
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
            </ContentSection>
            
            <ContentSection style={{ marginTop: Spacing.md }}>
               <SectionHeader title="Practice Pronunciation" />
               
               <RecordButton 
                  isRecording={isRecording} 
                  onPressIn={startRecording} 
                  onPressOut={stopRecording} 
               />
               
               {recordings.length > 0 && (
                  <View style={{ marginTop: Spacing.md }}>
                     <SectionHeader title={`My Recordings (${recordings.length})`} />
                     
                     {recordings.map(recording => (
                        <RecordingItem 
                           key={recording.id} 
                           recording={recording}
                           playingRecordingId={playingRecordingId}
                           onPlayPress={playRecording}
                           onDeletePress={deleteRecording}
                           formatTimestamp={formatTimestamp}
                        />
                     ))}
                  </View>
               )}
            </ContentSection>
         </ScrollView>
         
         <BottomActionBar 
            onRemove={handleRemove}
            onFinish={handleFinish}
            isLoading={isLoading}
         />
      </SafeAreaView>
   );
};

export default LearningScreen;
