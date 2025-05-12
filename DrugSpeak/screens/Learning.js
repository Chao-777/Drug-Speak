import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
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

         {/* Record Section */}
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
               backgroundColor: '#000080', // Dark blue
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
         
         {/* Fixed bottom navigation bar */}
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
         >
            <Icon name="delete-outline" size={24} color={Colors.error} />
            <Text style={{
               marginLeft: Spacing.xs,
               color: Colors.error,
               fontSize: Typography.sizes.body,
            }}>
               Remove
            </Text>
         </TouchableOpacity>
         
         <TouchableOpacity
            style={{
               flexDirection: 'row',
               alignItems: 'center',
               backgroundColor: Colors.primary,
               paddingVertical: Spacing.sm,
               paddingHorizontal: Spacing.md,
               borderRadius: Borders.radius.medium,
            }}
            onPress={handleFinish}
         >
            <Icon name="check" size={20} color="white" />
            <Text style={{
               marginLeft: Spacing.xs,
               color: 'white',
               fontWeight: Typography.weights.bold,
               fontSize: Typography.sizes.body,
            }}>
               Finish
            </Text>
         </TouchableOpacity>
         </View>
      </SafeAreaView>
   );
};

export default LearningScreen;
