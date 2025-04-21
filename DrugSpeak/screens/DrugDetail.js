import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { getDrugById, categoryArray } from '../data/drugs';
import PronunciationCard from '../components/PronunciationCard';
import StudyButton from '../components/Button';
import { Colors, Spacing, Typography, Borders } from '../constants/color';

const Container = styled.SafeAreaView`
   flex: 1;
   background-color: ${Colors.background};
`;

const LoadingContainer = styled.View`
   flex: 1;
   justify-content: center;
   align-items: center;
   background-color: ${Colors.background};
`;

const LoadingText = styled.Text`
   font-size: ${Typography.sizes.subtitle}px;
   color: ${Colors.textSecondary};
`;

const HeaderContainer = styled.View`
   padding: ${Spacing.lg}px;
   background-color: ${Colors.cardBackground};
   align-items: center;
   border-bottom-width: ${Borders.width.thin}px;
   border-bottom-color: ${Colors.border};
`;

const DrugName = styled.Text`
   font-size: ${Typography.sizes.heading}px;
   font-weight: ${Typography.weights.bold};
   color: ${Colors.textPrimary};
   text-align: center;
`;

const Formula = styled.Text`
   font-size: ${Typography.sizes.body}px;
   color: ${Colors.textSecondary};
   margin-top: ${Spacing.xs}px;
`;

const SectionContainer = styled.View`
   padding: ${Spacing.lg}px;
   background-color: ${Colors.cardBackground};
   border-bottom-width: ${Borders.width.thin}px;
   border-bottom-color: ${Colors.border};
`;

const SectionText = styled.Text`
   font-size: ${Typography.sizes.body}px;
   color: ${Colors.textPrimary};
   ${props => props.lineHeight && `line-height: ${props.lineHeight}px`};
`;

const BoldText = styled.Text`
   font-weight: ${Typography.weights.bold};
`;

const PronunciationHeader = styled.Text`
   font-size: ${Typography.sizes.subtitle}px;
   font-weight: ${Typography.weights.bold};
   color: ${Colors.textPrimary};
   margin-bottom: ${Spacing.sm}px;
`;

const PronunciationContainer = styled.View`
   padding: ${Spacing.lg}px;
   background-color: ${Colors.cardBackground};
`;

const DrugDetailScreen = ({ route, navigation }) => {
   const { drugId } = route.params;
   const [drug, setDrug] = useState(null);

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
         <LoadingContainer>
            <LoadingText>Loading...</LoadingText>
         </LoadingContainer>
      );
   }

   return (
      <Container>
         <ScrollView>
            <HeaderContainer>
               <DrugName>{drug.name}</DrugName>
               <Formula>{drug.molecular_formula}</Formula>
            </HeaderContainer>

            {drug.other_names && drug.other_names.length > 0 && (
               <SectionContainer>
                  <SectionText>
                     <BoldText>Also known as: </BoldText>
                     {drug.other_names.join(', ')}
                  </SectionText>
               </SectionContainer>
            )}

            <SectionContainer>
               <SectionText>
                  <BoldText>Categories: </BoldText>
                  {getCategoryNames(drug.categories)}
               </SectionText>
            </SectionContainer>

            <SectionContainer>
               <SectionText lineHeight={Typography.sizes.body * 1.5}>
                  {drug.desc}
               </SectionText>
            </SectionContainer>

            <PronunciationContainer>
               <PronunciationHeader>
                  Pronunciation
               </PronunciationHeader>
               {drug.sounds && drug.sounds.map((sound, index) => (
                  <PronunciationCard 
                     key={`${drug.id}_${sound.gender}`}
                     drugName={drug.name} 
                     gender={sound.gender}
                     audioFile={sound.file}
                  />
               ))}
            </PronunciationContainer>

            <StudyButton onPress={addToStudyList} />
         </ScrollView>
      </Container>
   );
};

export default DrugDetailScreen;
