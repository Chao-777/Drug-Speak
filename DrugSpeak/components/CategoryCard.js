import React from 'react';
import { 
   TouchableOpacity, 
   Text 
} from 'react-native';
import { Colors, Spacing, Typography, Shadows, Borders } from '../constants/color';

const CategoryCard = ({ category, onPress }) => {
   return (
      <TouchableOpacity
         style={{
            backgroundColor: Colors.cardBackground,
            padding: Spacing.lg,
            marginVertical: Spacing.sm,
            borderRadius: Borders.radius.medium,
            ...Shadows.small
         }}
         onPress={onPress}
      >
         <Text style={{
            fontSize: Typography.sizes.body,
            color: Colors.textPrimary
         }}>
            {category.name}({category.count})
         </Text>
      </TouchableOpacity>
   );
};

export default CategoryCard;
