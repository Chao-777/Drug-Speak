import React, { useState, useEffect } from 'react';
import { ScrollView, SafeAreaView, View, Text, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromLearningList, updateLearningStatus, updateDrugScore } from '../store/learningListSlice';
import { drugCategory } from '../data/resource';
import RecordService from '../api/recordService';
import AuthService from '../api/authService';
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
import AudioComparisonService from '../services/AudioComparisonService';

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
   const [isUploading, setIsUploading] = useState(false);

   const currentLearning = learningList.filter(item => item.status === 'current');
   const finishedLearning = learningList.filter(item => item.status === 'finished');

   const RECORDINGS_STORAGE_KEY = `recordings_${drug.id}`;

   const [evaluatingRecordingId, setEvaluatingRecordingId] = useState(null);
   const [isUpdatingStats, setIsUpdatingStats] = useState(false);
   const [drugScore, setDrugScore] = useState(0);
   
   const evaluateRecording = async (recordingId) => {
      try {
         setEvaluatingRecordingId(recordingId);
         
         const recordingToEvaluate = recordings.find(rec => rec.id === recordingId);
         if (!recordingToEvaluate) {
            throw new Error('Recording not found');
         }
         
         const instructorAudio = drug.sounds && drug.sounds.length > 0 
            ? drug.sounds[0].file 
            : null;
            
         if (!instructorAudio) {
            throw new Error('No reference audio available for comparison');
         }
         
         await stopAnyPlayback();
         
         const score = await AudioComparisonService.compareAudio(
            recordingToEvaluate.uri,
            instructorAudio
         );
         
         const updatedRecordings = recordings.map(rec => 
            rec.id === recordingId 
               ? { ...rec, score } 
               : rec
         );
         
         setRecordings(updatedRecordings);
         
         const previousHighestScore = drugScore || 0;
         
         if (score > previousHighestScore) {
            setDrugScore(score);
            
            dispatch(updateDrugScore({
               id: drug.id,
               score: score
            }));
            
            await updateStudyRecordStats();
         }
         
         await saveRecordings(updatedRecordings);
         
         Alert.alert(
            "Evaluation Complete",
            `Your pronunciation score: ${score}${score > previousHighestScore ? "\n\nThis is a new high score!" : ""}`
         );
      } catch (error) {
         console.error('Error evaluating recording:', error);
         Alert.alert('Error', error.message || 'Failed to evaluate recording');
      } finally {
         setEvaluatingRecordingId(null);
      }
   };

   useEffect(() => {
      const loadData = async () => {
         try {
            const user = await AuthService.getCurrentUser();
            if (user) {
               setUserData(user);
               
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
            console.error('Error loading user data:', error);
         }
      };

      const drugInList = learningList.find(item => item.id === drug.id);
      if (drugInList && drugInList.score) {
         setDrugScore(drugInList.score);
      }
      
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

   const updateStudyRecordStats = async () => {
      try {
         const user = await AuthService.getCurrentUser();
         if (!user) return;
         
         const stats = {
            currentLearning: currentLearning.length,
            finishedLearning: finishedLearning.length,
            totalScore: calculateTotalScore()
         };
         
         await RecordService.upsertStudyRecord(stats);
         setStudyStats(stats);
      } catch (error) {
         console.error('Error updating study stats:', error);
      }
   };
   
   const calculateTotalScore = () => {
      return learningList.reduce((total, drug) => total + (drug.score || 0), 0);
   };

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
         if (!recording) return;
         
         setIsUploading(true);
         
         const uri = await AudioRecorderManager.stopRecording(recording);
         
         const recordingId = Date.now().toString();
         const newRecording = {
            id: recordingId,
            uri,
            timestamp: new Date().toISOString(),
            evaluation: 'pending',
            uploaded: false
         };
         
         const updatedRecordings = [...recordings, newRecording];
         setRecordings(updatedRecordings);
         
         await saveRecordings(updatedRecordings);
         
         try {
            const serverUrl = await AudioRecorderManager.uploadAudioFile(uri, drug.id, recordingId);
            
            const finalRecordings = updatedRecordings.map(rec => 
               rec.id === recordingId 
                  ? { ...rec, uri: serverUrl, uploaded: true } 
                  : rec
            );
            
            setRecordings(finalRecordings);
            await saveRecordings(finalRecordings);
         } catch (uploadError) {
            console.error('Error uploading recording to server:', uploadError);
         }
         
         setRecording(undefined);
         setIsRecording(false);
      } catch (err) {
         console.error('Failed to stop recording', err);
         Alert.alert('Error', 'Failed to save recording');
      } finally {
         setIsUploading(false);
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
         
         let uri = recordingToPlay.uri;
         
         if (uri && uri.startsWith('http')) {
            try {
               uri = await AudioRecorderManager.downloadAudioFile(
                  uri, 
                  `drug_${drug.id}_recording_${recordingId}.m4a`
               );
            } catch (downloadError) {
               console.error('Error downloading audio from server:', downloadError);
            }
         }
         
         const newSound = await AudioRecorderManager.playSound(uri);
         
         newSound.setOnPlaybackStatusUpdate(status => {
            if (status.didJustFinish) {
               setPlayingRecordingId(null);
            }
         });
         
         setSound(newSound);
         setPlayingRecordingId(recordingId);
      } catch (err) {
         console.error('Failed to play recording:', err);
         Alert.alert('Error', 'Failed to play recording');
         setPlayingRecordingId(null);
      }
   };

   const deleteRecording = (recordingId) => {
      Alert.alert(
         "Delete Recording",
         "Are you sure you want to delete this recording? This will remove it from both your device and the cloud.",
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
                     
                     await AudioRecorderManager.deleteRecording(RECORDINGS_STORAGE_KEY, recordingId);
                     
                     const updatedRecordings = recordings.filter(rec => rec.id !== recordingId);
                     setRecordings(updatedRecordings);
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
         
         await updateStudyRecordStats();
         
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
         
         dispatch(removeFromLearningList(drug.id));
         
         await updateStudyRecordStats();
         
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
         <DrugHeader 
            name={drug.name} 
            formula={drug.molecular_formula}
            isInLearningList={true}
            score={drugScore} 
            />
            
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
                  isLoading={isUploading}
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
                        onEvaluatePress={evaluateRecording}
                        formatTimestamp={formatTimestamp}
                        isEvaluating={evaluatingRecordingId === recording.id}
                        isUploaded={recording.uploaded}
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
