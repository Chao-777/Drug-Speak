import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { getDrugById, categoryArray } from '../data/drugs';
import PronunciationCard from '../components/PronunciationCard';
import StudyButton from '../components/Button';
import { Colors, Spacing, Typography, Borders } from '../constants/color';

const DrugDetailScreen = ({ route, navigation }) => {
   const { drugId } = route.params;
   const [drug, setDrug] = useState(null);

   useEffect(() => {
      const drugDetails = getDrugById(drugId);
      setDrug(drugDetails);
      
      if (drugDetails) {
         navigation.setOptions({ title: drugDetails.name });
      }
   }, [drugId, navigation]);

   const addToStudyList = () => {
      console.log(`Adding ${drug.name} to study list`);
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
            backgroundColor: Colors.background
         }}>
            <Text style={{
               fontSize: Typography.sizes.subtitle,
               color: Colors.textSecondary
            }}>Loading...</Text>
         </View>
      );
   }

   return (
      <SafeAreaView style={{
         flex: 1,
         backgroundColor: Colors.background
      }}>
         <ScrollView>
            <View style={{
               padding: Spacing.lg,
               backgroundColor: Colors.cardBackground,
               alignItems: 'center',
               borderBottomWidth: Borders.width.thin,
               borderBottomColor: Colors.border
            }}>
               <Text style={{
                  fontSize: Typography.sizes.heading,
                  fontWeight: Typography.weights.bold,
                  color: Colors.textPrimary,
                  textAlign: 'center'
               }}>
                  {drug.name}
               </Text>
               <Text style={{
                  fontSize: Typography.sizes.body,
                  color: Colors.textSecondary,
                  marginTop: Spacing.xs
               }}>
                  {drug.molecular_formula}
               </Text>
            </View>

            {drug.other_names && drug.other_names.length > 0 && (
               <View style={{
                  padding: Spacing.lg,
                  backgroundColor: Colors.cardBackground,
                  borderBottomWidth: Borders.width.thin,
                  borderBottomColor: Colors.border
               }}>
                  <Text style={{ fontSize: Typography.sizes.body, color: Colors.textPrimary }}>
                     <Text style={{ fontWeight: Typography.weights.bold }}>Also known as: </Text>
                     {drug.other_names.join(', ')}
                  </Text>
               </View>
            )}

            <View style={{
               padding: Spacing.lg,
               backgroundColor: Colors.cardBackground,
               borderBottomWidth: Borders.width.thin,
               borderBottomColor: Colors.border
            }}>
               <Text style={{ fontSize: Typography.sizes.body, color: Colors.textPrimary }}>
                  <Text style={{ fontWeight: Typography.weights.bold }}>Categories: </Text>
                  {getCategoryNames(drug.categories)}
               </Text>
            </View>

            <View style={{
               padding: Spacing.lg,
               backgroundColor: Colors.cardBackground,
               borderBottomWidth: Borders.width.thin,
               borderBottomColor: Colors.border
            }}>
               <Text style={{ 
                  fontSize: Typography.sizes.body, 
                  color: Colors.textPrimary,
                  lineHeight: Typography.sizes.body * 1.5
               }}>
                  {drug.desc}
               </Text>
            </View>

            <View style={{
               padding: Spacing.lg,
               backgroundColor: Colors.cardBackground
            }}>
               <Text style={{ 
                  fontSize: Typography.sizes.subtitle, 
                  fontWeight: Typography.weights.bold, 
                  color: Colors.textPrimary,
                  marginBottom: Spacing.sm
               }}>
                  Pronunciation
               </Text>
               {drug.sounds && drug.sounds.map((sound, index) => (
                  <PronunciationCard 
                     key={`${drug.id}_${sound.gender}`}
                     drugName={drug.name} 
                     gender={sound.gender}
                     audioFile={sound.file}
                  />
               ))}
            </View>

            <StudyButton onPress={addToStudyList} />
         </ScrollView>
      </SafeAreaView>
   );
};

export default DrugDetailScreen;
