import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { Colors, Spacing, Typography, Borders } from '../constants/color';
import PronunciationCard from '../components/PronunciationCard';
import { removeFromLearningList } from '../store/learningListSlice';
import { drugCategory } from '../data/resource';

const LearningScreen = ({ route, navigation }) => {
   const { drug } = route.params;
   const dispatch = useDispatch();
   const [openDropdownId, setOpenDropdownId] = useState(null);

   const getCategoryNames = (categoryIds) => {
      if (!categoryIds || !Array.isArray(categoryIds)) return '';
      
      return categoryIds.map(categoryId => {
         const category = drugCategory[categoryId];
         return category ? category.name : categoryId;
      }).join(', ');
   };

   const handleFinish = () => {
      console.log(`Marking ${drug.name} as finished`);
      navigation.goBack();
   };

   const handleRemove = () => {
      dispatch(removeFromLearningList(drug.id));
      navigation.goBack();
   };

   // Function to toggle the dropdown state
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
                  id={`${drug.id}_${sound.gender}`} // Pass a unique ID for each card
                  drugName={drug.name} 
                  gender={sound.gender}
                  audioFile={sound.file}
                  isDropdownOpen={openDropdownId === `${drug.id}_${sound.gender}`}
                  onToggleDropdown={handleToggleDropdown}
               />
            ))}
         </View>

         <TouchableOpacity style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: Colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            marginVertical: Spacing.xl,
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

         <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: Spacing.lg,
            marginBottom: Spacing.xxl,
         }}>
            <TouchableOpacity 
            style={{
               paddingVertical: Spacing.sm,  
               paddingHorizontal: Spacing.sm,
               borderRadius: Borders.radius.medium,
               flex: 0.48,
               alignItems: 'center',
               backgroundColor: Colors.success,
            }}
            onPress={handleFinish}
            >
            <Text style={{
               color: 'white',
               fontWeight: Typography.weights.bold,
               fontSize: Typography.sizes.body - 2,  
            }}>
               Finish
            </Text>
            </TouchableOpacity>

            <TouchableOpacity 
            style={{
               paddingVertical: Spacing.sm,  
               paddingHorizontal: Spacing.sm,
               borderRadius: Borders.radius.medium,
               flex: 0.48,
               alignItems: 'center',
               backgroundColor: 'transparent',
               borderWidth: 1,
               borderColor: Colors.error,  
            }}
            onPress={handleRemove}
            >
            <Text style={{
               color: Colors.error,  
               fontWeight: Typography.weights.bold,
               fontSize: Typography.sizes.body - 2,  
            }}>
               Remove
            </Text>
            </TouchableOpacity>
         </View>
         </ScrollView>
      </SafeAreaView>
   );
};

export default LearningScreen;
