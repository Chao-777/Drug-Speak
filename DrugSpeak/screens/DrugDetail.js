import React, { useEffect, useState } from 'react';
import { ScrollView, SafeAreaView, View, Text, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getDrugById, categoryArray } from '../data/drugs';
import PronunciationCard from '../components/PronunciationCard';
import { PrimaryButton } from '../components/Button';
import { Colors, Typography, Spacing } from '../constants/color';
import { addToLearningList } from '../store/learningListSlice';
import ContentSection from '../components/ContentSection';
import LabeledText from '../components/LabeledText';
import Badge from '../components/Badge';
import {SectionHeader} from '../components/SectionHeader';

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
            <ActivityIndicator size="large" color={Colors.primary} />
         </View>
      );
   }

   return (
      <SafeAreaView style={{
         flex: 1,
         backgroundColor: Colors.background,
      }}>
         <ScrollView>
            <ContentSection>
               <View style={{ alignItems: 'center' }}>
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
                  {isInLearningList && <Badge text="Added to Learning List" />}
               </View>
            </ContentSection>

            {drug.other_names && drug.other_names.length > 0 && (
               <ContentSection>
                  <LabeledText 
                     label="Also known as"
                     value={drug.other_names.join(', ')}
                  />
               </ContentSection>
            )}

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

            <ContentSection noBorder={true}>
               <SectionHeader title="Pronunciation" />
               
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
            </ContentSection>

            {!isInLearningList && drug && (
               <PrimaryButton
               icon='add'
               title='Study'
               drug={drug} onPress={addToStudyList} />
            )}
         </ScrollView>
      </SafeAreaView>
   );
};

export default DrugDetailScreen;
