import React, { useState, useEffect } from 'react';
import { View, RefreshControl, SafeAreaView, FlatList, Alert, ActivityIndicator, Text } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Colors, Spacing, Typography } from '../constants/color';
import RecordService from '../api/recordService';
import AuthService from '../api/authService';
import DrugCard from '../components/DrugCard';
import FinishedDrugCard from '../components/FinishedDrugCard';
import {ExpandableSectionHeader} from '../components/SectionHeader';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import StatsBar from '../components/StatsBar';
import { updateLearningStatus, removeFromLearningList, setLearningList } from '../store/learningListSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LearningDataService from '../api/learningDataService';

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

   // Check if the user is logged in before making API calls
   const checkUserLoggedIn = async () => {
      try {
         // Check if this is a special final sync operation before logout 
         const isFinalSync = await AsyncStorage.getItem('finalSync');
         if (isFinalSync === 'true') {
            return true;
         }
         
         // Check if a logout operation is in progress
         const isLoggingOut = await AsyncStorage.getItem('isLoggingOut');
         if (isLoggingOut === 'true') {
            setIsUserLoggedIn(false);
            return false;
         }
         
         const user = await AuthService.getCurrentUser();
         const isLoggedIn = !!user;
         setIsUserLoggedIn(isLoggedIn);
         return isLoggedIn;
      } catch (error) {
         setIsUserLoggedIn(false);
         return false;
      }
   };

   useEffect(() => {
      const syncStats = async () => {
         // Only sync if counts have changed and user is logged in
         if ((studyStats.currentLearning !== currentLearning.length || 
             studyStats.finishedLearning !== finishedLearning.length) && 
             await checkUserLoggedIn()) {
            
            setSyncing(true);
            try {
               // Get user from AuthService instead of directly from AsyncStorage
               const user = await AuthService.getCurrentUser();
               if (user) {
                  const newStats = {
                     currentLearning: currentLearning.length,
                     finishedLearning: finishedLearning.length,
                     totalScore: calculateTotalScore()
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

   // Calculate total score across all drugs
   const calculateTotalScore = () => {
      return learningList.reduce((total, drug) => total + (drug.score || 0), 0);
   };

   const fetchStudyRecord = async () => {
      try {
         setLoading(true);
         setError(null);
         
         // Check login status first
         const isLoggedIn = await checkUserLoggedIn();
         if (!isLoggedIn) {
            console.log('User not logged in, skipping study record fetch');
            setLoading(false);
            setRefreshing(false);
            return;
         }
         
         // Get user from AuthService instead of directly from AsyncStorage
         const user = await AuthService.getCurrentUser();
         if (!user) {
            console.warn('No user logged in to fetch study record');
            setLoading(false);
            setRefreshing(false);
            return;
         }
         
         try {
            // Calculate stats based on learning list
            const calculatedStats = {
               currentLearning: currentLearning.length,
               finishedLearning: finishedLearning.length,
               totalScore: calculateTotalScore()
            };
            
            // Try to get the user's study record first
            const studyRecord = await RecordService.getStudyRecordById(user.id || user._id);
            
            // Only update backend if counts have changed
            if (calculatedStats.currentLearning !== studyRecord.currentLearning || 
                  calculatedStats.finishedLearning !== studyRecord.finishedLearning ||
                  calculatedStats.totalScore !== studyRecord.totalScore) {
               
               await RecordService.upsertStudyRecord(calculatedStats);
            }
            
            setStudyStats(calculatedStats);
            
         } catch (error) {
            console.error('Error syncing stats from Redux state:', error);
            
            // Just use calculated stats from redux state
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
         // Check login status first
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
         
         // Update Redux state first for immediate UI response
         dispatch(updateLearningStatus({ id: drug.id, status: 'current' }));
         
         // Then sync with backend
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
         // Check login status first
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
                        // Recheck login status just in case
                        if (!await checkUserLoggedIn()) {
                           Alert.alert(
                              "Operation Cancelled",
                              "Your session has expired. Please log in again.",
                              [{ text: "OK" }]
                           );
                           setSyncing(false);
                           return;
                        }
                        
                        // Update Redux state first for immediate UI response
                        dispatch(removeFromLearningList(drug.id));
                        
                        // Then sync with backend
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
      // Initial check for login status
      checkUserLoggedIn().then(isLoggedIn => {
         if (isLoggedIn) {
            fetchStudyRecord();
            loadLearningListData(); // Load learning data on mount
         }
      });
      
      const unsubscribe = navigation.addListener('focus', () => {
         checkUserLoggedIn().then(isLoggedIn => {
            if (isLoggedIn) {
               fetchStudyRecord();
               loadLearningListData(); // Load learning data when screen gets focus
            }
         });
      });
      
      // Also add an interval to periodically check login status
      // This helps catch logout events that might happen in other screens
      const loginCheckInterval = setInterval(() => {
         checkUserLoggedIn();
      }, 10000);  // Check every 10 seconds
      
      return () => {
         unsubscribe();
         clearInterval(loginCheckInterval);
      };
   }, [navigation]);

   // New function to load learning list data directly from AsyncStorage
   const loadLearningListData = async () => {
      try {
         const user = await AuthService.getCurrentUser();
         if (!user) {
            return;
         }
         
         const userId = user.id || user._id;
         
         // Use LearningDataService to load data directly
         const loadedList = await LearningDataService.loadLearningList(userId);
         
         if (loadedList && loadedList.length > 0) {
            // Dispatch action to update Redux store with loaded data
            dispatch(setLearningList(loadedList));
         }
      } catch (error) {
         // Error handling
      }
   };

   const onRefresh = () => {
      setRefreshing(true);
      fetchStudyRecord();
      
      // Add direct learning list loading during refresh
      loadLearningListData();
      
      // Add diagnostic check
      try {
         AuthService.inspectStorage();
      } catch (error) {
         // Error handling
      }
   };

   const navigateToLearningScreen = (drug) => {
      navigation.navigate('LearningScreen', { drug });
   };

   // Save learning list whenever it changes
   useEffect(() => {
      const saveLearningData = async () => {
         try {
            // Check if user is logged in and not in the process of logging out
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
            // Error handling
         }
      };
      
      // Only save if we have items
      if (learningList.length > 0) {
         saveLearningData();
      }
   }, [learningList]);

   if (loading && !refreshing) {
      return (
         <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: Colors.background,
         }}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={{
               marginTop: Spacing.md,
               fontSize: Typography.sizes.medium,
               color: Colors.textSecondary,
            }}>
               Loading your study progress...
            </Text>
         </View>
      );
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
