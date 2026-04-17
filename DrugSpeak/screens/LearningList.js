import React, { useState, useEffect } from 'react';
import { View, RefreshControl, SafeAreaView, FlatList, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Colors, Spacing } from '../constants/color';
import RecordService from '../api/recordService';
import AuthService from '../api/authService';
import DrugCard from '../components/DrugCard';
import FinishedDrugCard from '../components/FinishedDrugCard';
import {ExpandableSectionHeader} from '../components/SectionHeader';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import StatsBar from '../components/StatsBar';
import LoadingIndicator from '../components/LoadingIndicator';
import { updateLearningStatus, removeFromLearningList, setLearningList } from '../store/learningListSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LearningDataService from '../api/learningDataService';
import UserDataHelper from '../utils/UserDataHelper';

const LearningListScreen = ({ navigation }) => {
   const learningList = useSelector(state => state.learningList.learningList || []);
   const dispatch = useDispatch();
   
   const [loading, setLoading] = useState(false);
   const [syncing, setSyncing] = useState(false);
   const [refreshing, setRefreshing] = useState(false);
   const [error, setError] = useState(null);
   const [isUserLoggedIn, setIsUserLoggedIn] = useState(true);
   const [studyStats, setStudyStats] = useState({
      currentLearning: 0,
      finishedLearning: 0,
      totalScore: 0
   });
   
   const currentLearning = learningList.filter(drug => drug.status === 'current');
   const finishedLearning = learningList.filter(drug => drug.status === 'finished');
   
   const [currentExpanded, setCurrentExpanded] = useState(true);
   const [finishedExpanded, setFinishedExpanded] = useState(false);

   const checkUserLoggedIn = async () => {
      const isLoggedIn = await UserDataHelper.isUserLoggedIn();
      setIsUserLoggedIn(isLoggedIn);
      return isLoggedIn;
   };

   useEffect(() => {
      const syncStats = async () => {
         if ((studyStats.currentLearning !== currentLearning.length || 
            studyStats.finishedLearning !== finishedLearning.length) && 
            await checkUserLoggedIn()) {
            
            setSyncing(true);
            try {
               const user = await UserDataHelper.getCurrentUserSafe();
               if (user) {
                  const newStats = {
                     currentLearning: currentLearning.length,
                     finishedLearning: finishedLearning.length,
                     totalScore: UserDataHelper.calculateTotalScore(learningList)
                  };
                  
                  await RecordService.upsertStudyRecord(newStats);
                  setStudyStats(newStats);
               }
            } catch (error) {
               console.error('Error syncing stats with local counts:', error);
            } finally {
               setSyncing(false);
            }
         }
      };
      
      syncStats();
   }, [currentLearning.length, finishedLearning.length]);

   const calculateTotalScore = () => {
      return UserDataHelper.calculateTotalScore(learningList);
   };

   const fetchStudyRecord = async () => {
      try {
         setLoading(true);
         setError(null);
         
         const isLoggedIn = await checkUserLoggedIn();
         if (!isLoggedIn) {
            setLoading(false);
            setRefreshing(false);
            return;
         }
         
         const user = await UserDataHelper.getCurrentUserSafe();
         if (!user) {
            setLoading(false);
            setRefreshing(false);
            return;
         }
         
         try {
            const calculatedStats = {
               currentLearning: currentLearning.length,
               finishedLearning: finishedLearning.length,
               totalScore: calculateTotalScore()
            };
            
            const studyRecord = await RecordService.getStudyRecordById(user.id || user._id);
            
            if (calculatedStats.currentLearning !== studyRecord.currentLearning || 
                  calculatedStats.finishedLearning !== studyRecord.finishedLearning ||
                  calculatedStats.totalScore !== studyRecord.totalScore) {
               
               await RecordService.upsertStudyRecord(calculatedStats);
            }
            
            setStudyStats(calculatedStats);
            
         } catch (error) {
            console.error('Error syncing stats from Redux state:', error);
            
            const calculatedStats = {
               currentLearning: currentLearning.length,
               finishedLearning: finishedLearning.length,
               totalScore: calculateTotalScore()
            };
            
            setStudyStats(calculatedStats);
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
         const isLoggedIn = await checkUserLoggedIn();
         if (!isLoggedIn) {
            Alert.alert(
               "Not Logged In",
               "You must be logged in to update your learning list.",
               [{ text: "OK" }]
            );
            return;
         }
         
         setSyncing(true);
         
         dispatch(updateLearningStatus({ id: drug.id, status: 'current' }));
         
         const updatedStats = {
            currentLearning: studyStats.currentLearning + 1,
            finishedLearning: studyStats.finishedLearning - 1,
            totalScore: calculateTotalScore()
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
      } finally {
         setSyncing(false);
      }
   };

   const handleRemoveDrug = async (drug) => {
      try {
         const isLoggedIn = await checkUserLoggedIn();
         if (!isLoggedIn) {
            Alert.alert(
               "Not Logged In",
               "You must be logged in to update your learning list.",
               [{ text: "OK" }]
            );
            return;
         }
         
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
                     setSyncing(true);
                     try {
                        if (!await checkUserLoggedIn()) {
                           Alert.alert(
                              "Operation Cancelled",
                              "Your session has expired. Please log in again.",
                              [{ text: "OK" }]
                           );
                           setSyncing(false);
                           return;
                        }
                        
                        dispatch(removeFromLearningList(drug.id));
                        
                        const updatedStats = {
                           currentLearning: drug.status === 'current' ? 
                              Math.max(0, studyStats.currentLearning - 1) : 
                              studyStats.currentLearning,
                           finishedLearning: drug.status === 'finished' ? 
                              Math.max(0, studyStats.finishedLearning - 1) : 
                              studyStats.finishedLearning,
                           totalScore: calculateTotalScore()
                        };
                        
                        await RecordService.upsertStudyRecord(updatedStats);
                        
                        setStudyStats(updatedStats);
                     } catch (error) {
                        console.error('Error removing drug from backend:', error);
                        Alert.alert(
                           "Warning",
                           "Drug removed locally but failed to sync with server. Will retry on next refresh.",
                           [{ text: "OK" }]
                        );
                     } finally {
                        setSyncing(false);
                     }
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
      checkUserLoggedIn().then(isLoggedIn => {
         if (isLoggedIn) {
            fetchStudyRecord();
            loadLearningListData(); 
         }
      });
      
      const unsubscribe = navigation.addListener('focus', () => {
         checkUserLoggedIn().then(isLoggedIn => {
            if (isLoggedIn) {
               fetchStudyRecord();
               loadLearningListData(); 
            }
         });
      });
      
      const loginCheckInterval = setInterval(() => {
         checkUserLoggedIn();
      }, 10000);  
      
      return () => {
         unsubscribe();
         clearInterval(loginCheckInterval);
      };
   }, [navigation]);

   const loadLearningListData = async () => {
      try {
         const user = await AuthService.getCurrentUser();
         if (!user) {
            return;
         }
         
         const userId = user.id || user._id;
         
         const loadedList = await LearningDataService.loadLearningList(userId);
         
         if (loadedList && loadedList.length > 0) {
            dispatch(setLearningList(loadedList));
         }
      } catch (error) {
      }
   };

   const onRefresh = () => {
      setRefreshing(true);
      fetchStudyRecord();
      
      loadLearningListData();
      
      try {
         AuthService.inspectStorage();
      } catch (error) {
      }
   };

   const navigateToLearningScreen = (drug) => {
      navigation.navigate('LearningScreen', { drug });
   };

   useEffect(() => {
      const saveLearningData = async () => {
         try {
            const isLoggingOut = await AsyncStorage.getItem('isLoggingOut');
            if (isLoggingOut === 'true') {
               return;
            }
            
            const user = await AuthService.getCurrentUser();
            if (!user) {
               return;
            }
            
            const userId = user.id || user._id;
            
            await LearningDataService.saveLearningList(userId, learningList);
         } catch (error) {
         }
      };
      
      if (learningList.length > 0) {
         saveLearningData();
      }
   }, [learningList]);

   if (loading && !refreshing) {
      return <LoadingIndicator.FullScreen message="Loading your study progress..." />;
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
                     learningList={learningList}
                     isSyncing={syncing}
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
