import React, { useState } from 'react';
import { FlatList, View, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Spacing, Typography, Borders } from '../constants/color';
import { removeFromLearningList } from '../store/learningListSlice';

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

const HeaderText = styled.Text`
   font-size: ${Typography.sizes.heading}px;
   font-weight: ${Typography.weights.bold};
   color: ${Colors.textPrimary};
`;

const SectionHeader = styled.TouchableOpacity`
   flex-direction: row;
   justify-content: space-between;
   align-items: center;
   padding: ${Spacing.lg}px;
   background-color: ${Colors.secondary};
   margin-top: ${Spacing.md}px;
   border-radius: ${Borders.radius.medium}px;
   margin-horizontal: ${Spacing.md}px;
`;

const SectionTitle = styled.View`
   flex-direction: row;
   align-items: center;
`;

const SectionName = styled.Text`
   font-size: ${Typography.sizes.subtitle}px;
   font-weight: ${Typography.weights.bold};
   color: ${Colors.textPrimary};
`;

const SectionCount = styled.Text`
   font-size: ${Typography.sizes.small}px;
   color: ${Colors.textSecondary};
   margin-left: ${Spacing.sm}px;
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
   padding: ${Spacing.lg}px;
   margin-horizontal: ${Spacing.md}px;
   margin-vertical: ${Spacing.sm}px;
   border-radius: ${Borders.radius.medium}px;
   flex-direction: row;
   justify-content: space-between;
   align-items: center;
`;

const DrugInfo = styled.View`
   flex: 1;
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

const RemoveButton = styled.TouchableOpacity`
   padding-vertical: ${Spacing.md}px;
   padding-horizontal: ${Spacing.md}px;
   background-color: ${Colors.error};
   border-radius: ${Borders.radius.small}px;
   margin-left: ${Spacing.md}px;
`;

const RemoveText = styled.Text`
   color: white;
   font-weight: ${Typography.weights.bold};
   font-size: ${Typography.sizes.small}px;
`;

const LearningListScreen = ({ navigation }) => {
   const learningList = useSelector(state => state.learningList.learningList || []);
   const dispatch = useDispatch();
   
   const currentLearning = learningList.filter(drug => drug.status === 'current');
   const finishedLearning = learningList.filter(drug => drug.status === 'finished');
   
   const [currentExpanded, setCurrentExpanded] = useState(true);
   const [finishedExpanded, setFinishedExpanded] = useState(false);

   const handleRemoveDrug = (drugId) => {
      dispatch(removeFromLearningList(drugId));
   };

   const renderDrugItem = ({ item }) => (
      <TouchableOpacity 
      onPress={() => navigation.navigate('LearningScreen', { drug: item })}
      activeOpacity={0.7}
   >
      <DrugCard style={{
         shadowColor: '#000',
         shadowOffset: { width: 0, height: 1 },
         shadowOpacity: 0.2,
         shadowRadius: 1,
         elevation: 2,
      }}>
         <DrugInfo>
            <DrugName>{item.name}</DrugName>
            
            {item.other_names && item.other_names.length > 0 && (
               <OtherNames>{item.other_names.join(', ')}</OtherNames>
            )}
            
            <DrugFormula>{item.molecular_formula}</DrugFormula>
         </DrugInfo>
         
         <RemoveButton onPress={(e) => {
            e.stopPropagation(); 
            handleRemoveDrug(item.id);
         }}>
            <RemoveText>Remove</RemoveText>
         </RemoveButton>
      </DrugCard>
   </TouchableOpacity>
   );

   return (
      <Container>

         
         {learningList.length === 0 ? (
            <EmptyListContainer>
               <EmptyListText>
                  Your learning list is empty. Add drugs to your list by pressing the "STUDY" button on drug details screens.
               </EmptyListText>
            </EmptyListContainer>
         ) : (
            <FlatList
               data={[]} 
               ListHeaderComponent={() => (
                  <View style={{ paddingBottom: 100 }}>
                     <SectionHeader onPress={() => setCurrentExpanded(!currentExpanded)}>
                        <SectionTitle>
                           <SectionName>Current Learning</SectionName>
                           <SectionCount>({currentLearning.length})</SectionCount>
                        </SectionTitle>
                        <Icon 
                           name={currentExpanded ? "remove" : "add"} 
                           size={24} 
                           color={Colors.textPrimary} 
                        />
                     </SectionHeader>
                     
                     {currentExpanded && currentLearning.map(item => (
                        <View key={item.id} style={{ marginTop: Spacing.sm }}>
                           {renderDrugItem({ item })}
                        </View>
                     ))}
                     
                     <SectionHeader 
                        onPress={() => setFinishedExpanded(!finishedExpanded)}
                        style={{ marginTop: Spacing.lg }}
                     >
                        <SectionTitle>
                           <SectionName>Finished</SectionName>
                           <SectionCount>({finishedLearning.length})</SectionCount>
                        </SectionTitle>
                        <Icon 
                           name={finishedExpanded ? "remove" : "add"} 
                           size={24} 
                           color={Colors.textPrimary} 
                        />
                     </SectionHeader>
                     
                     {finishedExpanded && finishedLearning.map(item => (
                        <View key={item.id} style={{ marginTop: Spacing.sm }}>
                           {renderDrugItem({ item })}
                        </View>
                     ))}
                  </View>
               )}
               renderItem={() => null}
               keyExtractor={(item) => item.id}
               contentContainerStyle={{ 
                  padding: Spacing.md
               }}
            />
         )}
      </Container>
   );
};

export default LearningListScreen;
