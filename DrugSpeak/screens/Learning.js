import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
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

   const currentLearning = learningList.filter(item => item.status === 'current');
   const finishedLearning = learningList.filter(item => item.status === 'finished');

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
   }, []);

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
            
            <TouchableOpacity style={{
               width: 120,
               height: 120,
               borderRadius: 60,
               backgroundColor: '#000080', 
               justifyContent: 'center',
               alignItems: 'center',
               alignSelf: 'center',
               marginBottom: Spacing.md,
            }}>
               <Text style={{
               color: 'white',
               fontWeight: Typography.weights.bold,
               fontSize: Typography.sizes.body,
               textAlign: 'center',
               }}>
               Hold to Record
               </Text>
            </TouchableOpacity>
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
