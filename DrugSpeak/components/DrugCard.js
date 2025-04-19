import React from 'react';
import { 
   TouchableOpacity, 
   Text, 
} from 'react-native';
import { Colors, Spacing, Typography, Shadows, Borders } from '../constants/color';

const DrugCard = ({ drug, onPress }) => {
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
            fontWeight: Typography.weights.medium,
            color: Colors.textPrimary
         }}>
            {drug.name}
         </Text>
         
         {drug.other_names && drug.other_names.length > 0 && (
            <Text style={{
               fontSize: Typography.sizes.small,
               color: Colors.textSecondary,
               marginTop: Spacing.xs
            }}>
               {drug.other_names.join(', ')}
            </Text>
         )}
         
         <Text style={{
            fontSize: Typography.sizes.small,
            color: Colors.textLight,
            marginTop: Spacing.xs
         }}>
            {drug.molecular_formula}
         </Text>
      </TouchableOpacity>
   );
};

export default DrugCard;
