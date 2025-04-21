import React from 'react';
import styled from 'styled-components/native';
import { Colors, Spacing, Typography, Shadows, Borders } from '../constants/color';

const CardContainer = styled.TouchableOpacity`
   background-color: ${Colors.cardBackground};
   padding: ${Spacing.lg}px;
   margin-vertical: ${Spacing.sm}px;
   border-radius: ${Borders.radius.medium}px;
   shadow-color: ${Shadows.small.shadowColor};
   shadow-offset: ${Shadows.small.shadowOffset.width}px ${Shadows.small.shadowOffset.height}px;
   shadow-opacity: ${Shadows.small.shadowOpacity};
   shadow-radius: ${Shadows.small.shadowRadius}px;
   elevation: ${Shadows.small.elevation};
`;

const DrugName = styled.Text`
   font-size: ${Typography.sizes.body}px;
   font-weight: ${Typography.weights.medium};
   color: ${Colors.textPrimary};
`;

const OtherNames = styled.Text`
   font-size: ${Typography.sizes.small}px;
   color: ${Colors.textSecondary};
   margin-top: ${Spacing.xs}px;
`;

const Formula = styled.Text`
   font-size: ${Typography.sizes.small}px;
   color: ${Colors.textLight};
   margin-top: ${Spacing.xs}px;
`;

const DrugCard = ({ drug, onPress }) => {
   return (
      <CardContainer onPress={onPress}>
         <DrugName>
            {drug.name}
         </DrugName>
         
         {drug.other_names && drug.other_names.length > 0 && (
            <OtherNames>
               {drug.other_names.join(', ')}
            </OtherNames>
         )}
         
         <Formula>
            {drug.molecular_formula}
         </Formula>
      </CardContainer>
   );
};

export default DrugCard;
