import React from 'react';
import styled from 'styled-components/native';
import { Colors, Spacing, Typography, Borders } from '../constants/color';


const ButtonContainer = styled.TouchableOpacity`
   background-color: ${Colors.primary};
   padding-vertical: ${Spacing.lg}px;
   padding-horizontal: ${Spacing.xl}px;
   margin-horizontal: ${Spacing.lg}px;
   margin-vertical: ${Spacing.lg}px;
   border-radius: ${Borders.radius.medium}px;
   align-items: center;
`;


const ButtonText = styled.Text`
   color: ${Colors.secondaryLight};
   font-weight: ${Typography.weights.bold};
   font-size: ${Typography.sizes.body}px;
`;

const StudyButton = ({ onPress }) => {
   return (
      <ButtonContainer onPress={onPress}>
         <ButtonText>STUDY</ButtonText>
      </ButtonContainer>
   );
};

export default StudyButton;
