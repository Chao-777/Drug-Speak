import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getDrugById, categoryArray } from '../data/drugs';
import PronunciationCard from '../components/PronunciationCard';
import StudyButton from '../components/Button';
import { Colors, Spacing, Typography, Borders } from '../constants/color';
import { addToLearningList } from '../store/learningListSlice';

const DrugDetailScreen = ({ route, navigation }) => {
   const { drugId } = route.params;
   const [drug, setDrug] = useState(null);
   const dispatch = useDispatch();
   const learningList = useSelector(state => state.learningList.learningList);
   
   const [openDropdownId, setOpenDropdownId] = useState(null);
   
   const isInLearningList = drug ? 
      learningList.some(item => item.id === drug.id) : 
      false;

   useEffect(() => {
      const drugDetails = getDrugById(drugId);
      setDrug(drugDetails);
      
      if (drugDetails) {
         navigation.setOptions({ 
         title: '',
         headerBackTitle: 'Drugs Details',
         });
      }
   }, [drugId, navigation]);

   const addToStudyList = () => {
      if (drug && !isInLearningList) {
         dispatch(addToLearningList(drug));
      }
   };
   
   const handleToggleDropdown = (id) => {
      setOpenDropdownId(prev => prev === id ? null : id);
   };
   
   const getCategoryNames = (categoryIds) => {
      if (!categoryIds) return '';
      
      return categoryIds.map(id => {
         const category = categoryArray.find(cat => cat.id === id);
         return category ? category.name : '';
      }).filter(Boolean).join(', ');
   };

   if (!drug) {
      return (
         <View style={{
         flex: 1,
         justifyContent: 'center',
         alignItems: 'center',
         backgroundColor: Colors.background,
         }}>
         <Text style={{
            fontSize: Typography.sizes.subtitle,
            color: Colors.textSecondary,
         }}>
            Loading...
         </Text>
         </View>
      );
   }

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
            {isInLearningList && (
               <View style={{
               backgroundColor: Colors.success,
               padding: Spacing.xs,
               paddingHorizontal: Spacing.md,
               borderRadius: Borders.radius.small,
               marginTop: Spacing.sm,
               }}>
               <Text style={{
                  color: 'white',
                  fontWeight: Typography.weights.bold,
                  fontSize: Typography.sizes.small,
                  textAlign: 'center',
               }}>
                  Added to Learning List
               </Text>
               </View>
            )}
         </View>

         {drug.other_names && drug.other_names.length > 0 && (
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
                  Also known as: 
               </Text>
               {' '}{drug.other_names.join(', ')}
               </Text>
            </View>
         )}

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

         {!isInLearningList && drug && (
            <StudyButton drug={drug} onPress={addToStudyList} />
         )}
         </ScrollView>
      </SafeAreaView>
   );
};

export default DrugDetailScreen;
