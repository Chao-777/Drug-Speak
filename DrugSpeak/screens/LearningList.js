import React from 'react';
import { FlatList } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components/native';
import { Colors, Spacing, Typography, Borders } from '../constants/color';
import { removeFromLearningList } from '../store/learningListSlice';

const Container = styled.SafeAreaView`
   flex: 1;
   background-color: ${Colors.background};
`;

const HeaderContainer = styled.View`
   padding: ${Spacing.sm}px;
   background-color: ${Colors.cardBackground};
   align-items: center;
   border-bottom-width: ${Borders.width.thin}px;
   border-bottom-color: ${Colors.border};
`;

const HeaderText = styled.Text`
   font-size: ${Typography.sizes.heading}px;
   font-weight: ${Typography.weights.bold};
   color: ${Colors.textPrimary};
`;

const EmptyListContainer = styled.View`
   flex: 1;
   justify-content: center;
   align-items: center;
   padding: ${Spacing.xl}px;
   padding-bottom: ${Spacing.xl + 80}px;
`;

const EmptyListText = styled.Text`
   font-size: ${Typography.sizes.subtitle}px;
   color: ${Colors.textSecondary};
   text-align: center;
`;

const DrugCard = styled.View`
   background-color: ${Colors.cardBackground};
   padding: ${Spacing.sm}px;
   margin-horizontal: ${Spacing.sm}px;
   margin-vertical: ${Spacing.sm}px;
   border-radius: ${Borders.radius.medium}px;
   flex-direction: row;
   justify-content: space-between;
   align-items: center;
`;

const DrugName = styled.Text`
   font-size: ${Typography.sizes.body}px;
   font-weight: ${Typography.weights.medium};
   color: ${Colors.textPrimary};
`;

const DrugFormula = styled.Text`
   font-size: ${Typography.sizes.small}px;
   color: ${Colors.textLight};
   margin-top: ${Spacing.xs}px;
`;

const OtherNames = styled.Text`
   font-size: ${Typography.sizes.small}px;
   color: ${Colors.textSecondary};
   margin-top: ${Spacing.xs}px;
   font-style: italic;
`;

const ButtonContainer = styled.View`
   margin-top: ${Spacing.md}px;
   align-items: flex-end;
`;

const RemoveButton = styled.TouchableOpacity`
   padding-vertical: ${Spacing.md}px;
   padding-horizontal: ${Spacing.md}px;
   background-color: ${Colors.error};
   border-radius: ${Borders.radius.small}px;
`;

const RemoveText = styled.Text`
   color: white;
   font-weight: ${Typography.weights.bold};
   font-size: ${Typography.sizes.small}px;
`;

const LearningListScreen = ({ navigation }) => {
   const learningList = useSelector(state => state.learningList.learningList || []);
   const dispatch = useDispatch();

   const handleRemoveDrug = (drugId) => {
      dispatch(removeFromLearningList(drugId));
   };

   const renderDrugItem = ({ item }) => (
      <DrugCard style={{
         shadowColor: '#000',
         shadowOffset: { width: 0, height: 1 },
         shadowOpacity: 0.2,
         shadowRadius: 1,
         elevation: 2,
      }}>
         <DrugName>{item.name}</DrugName>
         
         {item.other_names && item.other_names.length > 0 && (
            <OtherNames>{item.other_names.join(', ')}</OtherNames>
         )}
         
         <DrugFormula>{item.molecular_formula}</DrugFormula>
         
         <ButtonContainer>
            <RemoveButton onPress={() => handleRemoveDrug(item.id)}>
               <RemoveText>Remove</RemoveText>
            </RemoveButton>
         </ButtonContainer>
      </DrugCard>
   );

   return (
      <Container>
         <HeaderContainer>
            <HeaderText>Learning List</HeaderText>
         </HeaderContainer>
         
         {learningList.length === 0 ? (
            <EmptyListContainer>
               <EmptyListText>
                  Your learning list is empty. Add drugs to your list by pressing the "STUDY" button on drug details screens.
               </EmptyListText>
            </EmptyListContainer>
         ) : (
            <FlatList
               data={learningList}
               renderItem={renderDrugItem}
               keyExtractor={(item) => item.id}
               contentContainerStyle={{ 
                  padding: Spacing.md,
                  paddingBottom: 100 
               }}
            />
         )}
      </Container>
   );
};

export default LearningListScreen;
