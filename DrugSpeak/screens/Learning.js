import React from 'react';
import { ScrollView} from 'react-native';
import styled from 'styled-components/native';
import { useDispatch } from 'react-redux';
import { Colors, Spacing, Typography, Borders } from '../constants/color';
import PronunciationCard from '../components/PronunciationCard';
import { removeFromLearningList } from '../store/learningListSlice';
import { drugCategory } from '../data/resource';

const Container = styled.SafeAreaView`
   flex: 1;
   background-color: ${Colors.background};
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

const RecordCircle = styled.TouchableOpacity`
   width: 120px;
   height: 120px;
   border-radius: 60px;
   background-color: ${Colors.error};
   justify-content: center;
   align-items: center;
   align-self: center;
   margin-vertical: ${Spacing.xl}px;
`;

const RecordText = styled.Text`
   color: white;
   font-weight: ${Typography.weights.bold};
   font-size: ${Typography.sizes.body}px;
   text-align: center;
`;

const ButtonsContainer = styled.View`
   flex-direction: row;
   justify-content: space-between;
   padding: ${Spacing.lg}px;
   margin-bottom: ${Spacing.xxl}px;
`;

const ActionButton = styled.TouchableOpacity`
   padding-vertical: ${Spacing.md}px;
   padding-horizontal: ${Spacing.lg}px;
   border-radius: ${Borders.radius.medium}px;
   flex: 0.48;
   align-items: center;
`;

const FinishButton = styled(ActionButton)`
   background-color: ${Colors.success};
`;

const RemoveButton = styled(ActionButton)`
   background-color: ${Colors.error};
`;

const ButtonText = styled.Text`
   color: white;
   font-weight: ${Typography.weights.bold};
   font-size: ${Typography.sizes.body}px;
`;

const LearningScreen = ({ route, navigation }) => {
   const { drug } = route.params;
   const dispatch = useDispatch();

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

   return (
      <Container>
         <ScrollView>
            <HeaderContainer>
               <DrugName>{drug.name}</DrugName>
               <Formula>{drug.molecular_formula}</Formula>
            </HeaderContainer>

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

            <RecordCircle>
               <RecordText>Hold to Record</RecordText>
            </RecordCircle>

            <ButtonsContainer>
               <FinishButton onPress={handleFinish}>
                  <ButtonText>Finish</ButtonText>
               </FinishButton>
               <RemoveButton onPress={handleRemove}>
                  <ButtonText>Remove</ButtonText>
               </RemoveButton>
            </ButtonsContainer>
         </ScrollView>
      </Container>
   );
};

export default LearningScreen;
