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


const CardText = styled.Text`
   font-size: ${Typography.sizes.body}px;
   color: ${Colors.textPrimary};
`;

const CategoryCard = ({ category, onPress }) => {
   return (
      <CardContainer onPress={onPress}>
         <CardText>
            {category.name}({category.count})
         </CardText>
      </CardContainer>
   );
};

export default CategoryCard;
