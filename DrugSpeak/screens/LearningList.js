import React, { useState, useEffect } from 'react';
import { View, RefreshControl, SafeAreaView, FlatList, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Colors, Spacing } from '../constants/color';
import RecordService from '../api/recordService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DrugCard from '../components/DrugCard';
import FinishedDrugCard from '../components/FinishedDrugCard';
import {ExpandableSectionHeader} from '../components/SectionHeader';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import StatsBar from '../components/StatsBar';
import LoadingIndicator from '../components/LoadingIndicator';
import { updateLearningStatus, removeFromLearningList } from '../store/learningListSlice';

const LearningListScreen = ({ navigation }) => {
   const learningList = useSelector(state => state.learningList.learningList || []);
   const dispatch = useDispatch();
   
   const [loading, setLoading] = useState(false);
   const [refreshing, setRefreshing] = useState(false);
   const [error, setError] = useState(null);
   const [studyStats, setStudyStats] = useState({
      currentLearning: 0,
      finishedLearning: 0,
      totalScore: 0
   });
   
   const currentLearning = learningList.filter(drug => drug.status === 'current');
   const finishedLearning = learningList.filter(drug => drug.status === 'finished');
   
   const [currentExpanded, setCurrentExpanded] = useState(true);
   const [finishedExpanded, setFinishedExpanded] = useState(false);

   useEffect(() => {
      const syncStats = async () => {
         if (studyStats.currentLearning !== currentLearning.length || 
            studyStats.finishedLearning !== finishedLearning.length) {
            
            const userDataString = await AsyncStorage.getItem('userData');
            if (userDataString) {
               const newStats = {
                  currentLearning: currentLearning.length,
                  finishedLearning: finishedLearning.length,
                  totalScore: studyStats.totalScore 
               };
               
               try {
                  await RecordService.upsertStudyRecord(newStats);
                  setStudyStats(newStats);
               } catch (error) {
                  console.error('Error syncing stats with local counts:', error);
               }
            }
         }
      };
      
      syncStats();
   }, [currentLearning.length, finishedLearning.length]);

   const fetchStudyRecord = async () => {
      try {
         setLoading(true);
         setError(null);
         
         const userDataString = await AsyncStorage.getItem('userData');
         if (!userDataString) {
            console.warn('No user data available to fetch study record');
            setLoading(false);
            setRefreshing(false);
            return;
         }
         
         const userData = JSON.parse(userDataString);
         
         try {
            const studyRecord = await RecordService.getStudyRecordById(userData.id);
            
            const remoteStats = {
               currentLearning: studyRecord.currentLearning || 0,
               finishedLearning: studyRecord.finishedLearning || 0,
               totalScore: studyRecord.totalScore || 0
            };
            
            if (remoteStats.currentLearning !== currentLearning.length || 
               remoteStats.finishedLearning !== finishedLearning.length) {
               
               const updatedStats = {
                  currentLearning: currentLearning.length,
                  finishedLearning: finishedLearning.length,
                  totalScore: remoteStats.totalScore 
               };
               
               await RecordService.upsertStudyRecord(updatedStats);
               setStudyStats(updatedStats);
               console.log('Remote stats updated with local counts:', updatedStats);
            } else {
               setStudyStats(remoteStats);
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
               throw error;
            }
         }
      } catch (error) {
         console.error('Error fetching/creating study record:', error);
         setError(error.message || 'Failed to fetch study record');
      } finally {
         setLoading(false);
         setRefreshing(false);
      }
   };

   const handleReviewDrug = async (drug) => {
      try {
         dispatch(updateLearningStatus({ id: drug.id, status: 'current' }));
         
         const updatedStats = {
            currentLearning: studyStats.currentLearning + 1,
            finishedLearning: studyStats.finishedLearning - 1,
            totalScore: studyStats.totalScore
         };
         
         await RecordService.upsertStudyRecord(updatedStats);
         
         setStudyStats(updatedStats);
         
         Alert.alert(
            "Moved to Current Learning",
            `${drug.name} has been moved back to your Current Learning list.`,
            [{ text: "OK" }]
         );
      } catch (error) {
         console.error('Error moving drug to current learning:', error);
         Alert.alert(
            "Error",
            "Failed to move drug to Current Learning list. Please try again.",
            [{ text: "OK" }]
         );
      }
   };

   const handleRemoveDrug = async (drug) => {
      try {
         Alert.alert(
            "Remove Drug",
            `Are you sure you want to remove ${drug.name} from your ${drug.status === 'finished' ? 'Finished' : 'Learning'} list?`,
            [
               { 
                  text: "Cancel", 
                  style: "cancel" 
               },
               {
                  text: "Remove",
                  style: "destructive",
                  onPress: async () => {
                     dispatch(removeFromLearningList(drug.id));
                     
                     const updatedStats = {
                        currentLearning: drug.status === 'current' ? 
                           Math.max(0, studyStats.currentLearning - 1) : 
                           studyStats.currentLearning,
                        finishedLearning: drug.status === 'finished' ? 
                           Math.max(0, studyStats.finishedLearning - 1) : 
                           studyStats.finishedLearning,
                        totalScore: studyStats.totalScore
                     };
                     
                     await RecordService.upsertStudyRecord(updatedStats);
                     
                     setStudyStats(updatedStats);
                  }
               }
            ]
         );
      } catch (error) {
         console.error('Error removing drug:', error);
         Alert.alert(
            "Error",
            "Failed to remove drug from list. Please try again.",
            [{ text: "OK" }]
         );
      }
   };

   useEffect(() => {
      fetchStudyRecord();
      
      const unsubscribe = navigation.addListener('focus', () => {
         fetchStudyRecord();
      });
      
      return unsubscribe;
   }, [navigation]);

   const onRefresh = () => {
      setRefreshing(true);
      fetchStudyRecord();
   };

   const navigateToLearningScreen = (drug) => {
      navigation.navigate('LearningScreen', { drug });
   };

   if (loading && !refreshing) {
      return <LoadingIndicator message="Loading your study progress..." />;
   }

   if (error && !refreshing) {
      return <ErrorState message={error} onRetry={fetchStudyRecord} />;
   }

   return (
      <SafeAreaView style={{
         flex: 1,
         backgroundColor: Colors.background,
      }}>
         {learningList.length === 0 ? (
            <EmptyState 
               message="Your learning list is empty. Add drugs to your list by pressing the 'STUDY' button on drug details screens."
            />
         ) : (
            <FlatList
               data={[]} 
               ListHeaderComponent={() => (
                  <View style={{ paddingBottom: 100 }}>
                     <StatsBar 
                        currentCount={currentLearning.length}
                        finishedCount={finishedLearning.length}
                        totalScore={studyStats.totalScore}
                     />
                     
                     <ExpandableSectionHeader
                        title="Current Learning" 
                        count={currentLearning.length}
                        isExpanded={currentExpanded}
                        onToggle={() => setCurrentExpanded(!currentExpanded)}
                     />
                     
                     {currentExpanded && currentLearning.map(item => (
                        <View key={item.id} style={{ marginHorizontal: Spacing.md }}>
                           <DrugCard 
                              drug={item} 
                              onPress={() => navigateToLearningScreen(item)}
                           />
                        </View>
                     ))}
                     
                     <ExpandableSectionHeader
                        title="Finished" 
                        count={finishedLearning.length}
                        isExpanded={finishedExpanded}
                        onToggle={() => setFinishedExpanded(!finishedExpanded)}
                     />
                     
                     {finishedExpanded && finishedLearning.map(item => (
                        <View key={item.id} style={{ marginHorizontal: Spacing.md }}>
                           <FinishedDrugCard
                              drug={item}
                              onReview={handleReviewDrug}
                              onRemove={handleRemoveDrug}
                           />
                        </View>
                     ))}
                  </View>
               )}
               renderItem={() => null}
               keyExtractor={(item) => item.id}
               refreshControl={
                  <RefreshControl
                     refreshing={refreshing}
                     onRefresh={onRefresh}
                     colors={[Colors.primary]}
                  />
               }
            />
         )}
      </SafeAreaView>
   );
};

export default LearningListScreen;
