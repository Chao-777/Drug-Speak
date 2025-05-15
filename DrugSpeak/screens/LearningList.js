import React, { useState, useEffect } from 'react';
import { FlatList, View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Spacing, Typography, Borders, Shadows } from '../constants/color';
import RecordService from '../api/recordService';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

   // Force sync stats with local counts
   useEffect(() => {
      // This effect will run when currentLearning or finishedLearning change
      const syncStats = async () => {
         if (studyStats.currentLearning !== currentLearning.length || 
             studyStats.finishedLearning !== finishedLearning.length) {
            
            // Only update if user is logged in
            const userDataString = await AsyncStorage.getItem('userData');
            if (userDataString) {
               const newStats = {
                  currentLearning: currentLearning.length,
                  finishedLearning: finishedLearning.length,
                  totalScore: studyStats.totalScore // Keep the existing score
               };
               
               try {
                  await RecordService.upsertStudyRecord(newStats);
                  setStudyStats(newStats);
                  console.log('Stats synced with local counts:', newStats);
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
            
            // If remote counts don't match local counts, prioritize local counts
            const remoteStats = {
               currentLearning: studyRecord.currentLearning || 0,
               finishedLearning: studyRecord.finishedLearning || 0,
               totalScore: studyRecord.totalScore || 0
            };
            
            if (remoteStats.currentLearning !== currentLearning.length || 
                remoteStats.finishedLearning !== finishedLearning.length) {
               
               // Update backend with local counts
               const updatedStats = {
                  currentLearning: currentLearning.length,
                  finishedLearning: finishedLearning.length,
                  totalScore: remoteStats.totalScore // Keep the score
               };
               
               await RecordService.upsertStudyRecord(updatedStats);
               setStudyStats(updatedStats);
               console.log('Remote stats updated with local counts:', updatedStats);
            } else {
               // Remote stats match local counts, use them
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
         // Move drug from Finished to Current Learning list
         dispatch(updateLearningStatus({ id: drug.id, status: 'current' }));
         
         // Update stats
         const updatedStats = {
            currentLearning: studyStats.currentLearning + 1,
            finishedLearning: studyStats.finishedLearning - 1,
            totalScore: studyStats.totalScore
         };
         
         // Update backend
         await RecordService.upsertStudyRecord(updatedStats);
         
         // Update local state
         setStudyStats(updatedStats);
         
         // Show confirmation
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
         // Ask for confirmation
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
                     // Remove drug from learning list
                     dispatch(removeFromLearningList(drug.id));
                     
                     // Update stats based on which list it was in
                     const updatedStats = {
                        currentLearning: drug.status === 'current' ? 
                           Math.max(0, studyStats.currentLearning - 1) : 
                           studyStats.currentLearning,
                        finishedLearning: drug.status === 'finished' ? 
                           Math.max(0, studyStats.finishedLearning - 1) : 
                           studyStats.finishedLearning,
                        totalScore: studyStats.totalScore
                     };
                     
                     // Update backend
                     await RecordService.upsertStudyRecord(updatedStats);
                     
                     // Update local state
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

   const renderCurrentDrugItem = ({ item }) => (
      <TouchableOpacity 
         style={{
            backgroundColor: Colors.cardBackground,
            padding: Spacing.lg,
            marginVertical: Spacing.sm,
            borderRadius: Borders.radius.medium,
            ...Shadows.glassSmall
         }}
         onPress={() => navigation.navigate('LearningScreen', { drug: item })}
         activeOpacity={0.7}
      >
         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
               <Text style={{
                  fontSize: Typography.sizes.body,
                  fontWeight: Typography.weights.medium,
                  color: Colors.textPrimary
               }}>
                  {item.name}
               </Text>
               
               {item.other_names && item.other_names.length > 0 && (
                  <Text style={{
                     fontSize: Typography.sizes.small,
                     color: Colors.textSecondary,
                     marginTop: Spacing.xs
                  }}>
                     {item.other_names.join(', ')}
                  </Text>
               )}
            </View>
            
            <Text style={{
               fontSize: Typography.sizes.small,
               fontWeight: Typography.weights.bold,
               color: Colors.primary,
               marginLeft: Spacing.xs
            }}>
               {item.molecular_formula}
            </Text>
         </View>
      </TouchableOpacity>
   );

   const renderFinishedDrugItem = ({ item }) => (
      <View
         style={{
            backgroundColor: Colors.cardBackground,
            padding: Spacing.lg,
            marginVertical: Spacing.sm,
            borderRadius: Borders.radius.medium,
            ...Shadows.glassSmall
         }}
      >
         <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
            <View style={{ flex: 1 }}>
               <Text style={{
                  fontSize: Typography.sizes.body,
                  fontWeight: Typography.weights.medium,
                  color: Colors.textPrimary
               }}>
                  {item.name}
               </Text>
               
               {item.other_names && item.other_names.length > 0 && (
                  <Text style={{
                     fontSize: Typography.sizes.small,
                     color: Colors.textSecondary,
                     marginTop: Spacing.xs
                  }}>
                     {item.other_names.join(', ')}
                  </Text>
               )}
            </View>
            
            <Text style={{
               fontSize: Typography.sizes.small,
               fontWeight: Typography.weights.bold,
               color: Colors.primary,
               marginLeft: Spacing.xs
            }}>
               {item.molecular_formula}
            </Text>
         </View>


         <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            marginTop: Spacing.sm,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
            paddingTop: Spacing.sm
         }}>
            <TouchableOpacity
               style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: Colors.primary,
                  paddingVertical: Spacing.xs,
                  paddingHorizontal: Spacing.sm,
                  borderRadius: Borders.radius.small,
               }}
               onPress={() => handleReviewDrug(item)}
            >
               <Icon name="refresh" size={16} color="white" />
               <Text style={{
                  color: 'white',
                  fontWeight: Typography.weights.medium,
                  fontSize: Typography.sizes.small,
                  marginLeft: Spacing.xs
               }}>
                  Review
               </Text>
            </TouchableOpacity>

            <TouchableOpacity
               style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: Colors.cardBackground,
                  borderColor: Colors.error,
                  borderWidth: 1,
                  paddingVertical: Spacing.xs,
                  paddingHorizontal: Spacing.sm,
                  borderRadius: Borders.radius.small,
               }}
               onPress={() => handleRemoveDrug(item)}
            >
               <Icon name="delete-outline" size={16} color={Colors.error} />
               <Text style={{
                  color: Colors.error,
                  fontWeight: Typography.weights.medium,
                  fontSize: Typography.sizes.small,
                  marginLeft: Spacing.xs
               }}>
                  Remove
               </Text>
            </TouchableOpacity>
         </View>
      </View>
   );

   const SectionHeader = ({ title, count, isExpanded, onToggle }) => (
      <TouchableOpacity 
         style={{
         flexDirection: 'row',
         justifyContent: 'space-between',
         alignItems: 'center',
         paddingVertical: Spacing.md,
         paddingHorizontal: Spacing.lg,
         marginTop: Spacing.md,
         marginBottom: Spacing.xs,
         borderBottomWidth: 1,
         borderBottomColor: Colors.border,
         }}
         onPress={onToggle}
      >
         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
         <Text style={{
            fontSize: Typography.sizes.subtitle,
            fontWeight: Typography.weights.bold,
            color: Colors.textPrimary
         }}>
            {title}
         </Text>
         
         <Text style={{
            fontSize: Typography.sizes.body,
            color: Colors.primary,
            fontWeight: Typography.weights.bold,
            marginLeft: Spacing.sm
         }}>
            ({count})
         </Text>
         </View>
         
         <Icon 
         name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
         size={24} 
         color={Colors.textSecondary} 
         />
      </TouchableOpacity>
   );

   const EmptyState = () => (
      <View style={{
         flex: 1,
         justifyContent: 'center',
         alignItems: 'center',
         padding: Spacing.xl,
         paddingBottom: Spacing.xl + 80,
      }}>
         <Icon 
         name="library-add" 
         size={60} 
         color={Colors.textLight} 
         style={{ marginBottom: Spacing.lg }}
         />
         <Text style={{
         fontSize: Typography.sizes.subtitle,
         color: Colors.textSecondary,
         textAlign: 'center',
         }}>
         Your learning list is empty. Add drugs to your list by pressing the "STUDY" button on drug details screens.
         </Text>
      </View>
   );

   const ErrorState = ({ message, onRetry }) => (
      <View style={{
         flex: 1,
         justifyContent: 'center',
         alignItems: 'center',
         padding: Spacing.xl,
      }}>
         <Icon 
            name="error-outline" 
            size={60} 
            color={Colors.error} 
            style={{ marginBottom: Spacing.lg }}
         />
         <Text style={{
            fontSize: Typography.sizes.subtitle,
            color: Colors.textSecondary,
            textAlign: 'center',
            marginBottom: Spacing.lg,
         }}>
            {message || 'Something went wrong'}
         </Text>
         <TouchableOpacity
            style={{
               backgroundColor: Colors.primary,
               paddingVertical: Spacing.sm,
               paddingHorizontal: Spacing.lg,
               borderRadius: Borders.radius.medium,
            }}
            onPress={onRetry}
         >
            <Text style={{ color: 'white', fontWeight: Typography.weights.bold }}>
               Retry
            </Text>
         </TouchableOpacity>
      </View>
   );

   const StatsBar = () => (
      <View style={{
         flexDirection: 'row',
         justifyContent: 'space-around',
         backgroundColor: Colors.cardBackground,
         padding: Spacing.md,
         marginBottom: Spacing.md,
         borderBottomWidth: 1,
         borderBottomColor: Colors.border,
      }}>
         <View style={{ alignItems: 'center' }}>
            <Text style={{ 
               fontSize: Typography.sizes.small, 
               color: Colors.textSecondary 
            }}>
               Current
            </Text>
            <Text style={{ 
               fontSize: Typography.sizes.title, 
               fontWeight: Typography.weights.bold, 
               color: Colors.textPrimary
            }}>
               {currentLearning.length}
            </Text>
         </View>
         
         <View style={{ alignItems: 'center' }}>
            <Text style={{ 
               fontSize: Typography.sizes.small, 
               color: Colors.textSecondary 
            }}>
               Finished
            </Text>
            <Text style={{ 
               fontSize: Typography.sizes.title, 
               fontWeight: Typography.weights.bold, 
               color: Colors.success 
            }}>
               {finishedLearning.length}
            </Text>
         </View>
         
         <View style={{ alignItems: 'center' }}>
            <Text style={{ 
               fontSize: Typography.sizes.small, 
               color: Colors.textSecondary 
            }}>
               Score
            </Text>
            <Text style={{ 
               fontSize: Typography.sizes.title, 
               fontWeight: Typography.weights.bold, 
               color: Colors.warning 
            }}>
               {studyStats.totalScore}
            </Text>
         </View>
      </View>
   );

   if (loading && !refreshing) {
      return (
         <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={{ marginTop: Spacing.md, color: Colors.textSecondary }}>
               Loading your study progress...
            </Text>
         </SafeAreaView>
      );
   }

   if (error && !refreshing) {
      return (
         <SafeAreaView style={{ flex: 1 }}>
            <ErrorState 
               message={error} 
               onRetry={fetchStudyRecord} 
            />
         </SafeAreaView>
      );
   }

   return (
      <SafeAreaView style={{
         flex: 1,
         backgroundColor: Colors.background,
      }}>
         {learningList.length === 0 ? (
            <EmptyState />
         ) : (
            <FlatList
               data={[]} 
               ListHeaderComponent={() => (
                  <View style={{ paddingBottom: 100 }}>
                     <StatsBar />
                     
                     <SectionHeader 
                        title="Current Learning" 
                        count={currentLearning.length}
                        isExpanded={currentExpanded}
                        onToggle={() => setCurrentExpanded(!currentExpanded)}
                     />
                     
                     {currentExpanded && currentLearning.map(item => (
                        <View key={item.id} style={{ marginHorizontal: Spacing.md }}>
                           {renderCurrentDrugItem({ item })}
                        </View>
                     ))}
                     
                     <SectionHeader 
                        title="Finished" 
                        count={finishedLearning.length}
                        isExpanded={finishedExpanded}
                        onToggle={() => setFinishedExpanded(!finishedExpanded)}
                     />
                     
                     {finishedExpanded && finishedLearning.map(item => (
                        <View key={item.id} style={{ marginHorizontal: Spacing.md }}>
                           {renderFinishedDrugItem({ item })}
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
