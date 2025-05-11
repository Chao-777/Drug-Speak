import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Colors, Spacing, Typography, Borders, Shadows } from '../constants/color';

const CategoryCard = ({ category, onPress }) => {
   return (
      <TouchableOpacity
         style={{
         backgroundColor: Colors.cardBackground,
         padding: Spacing.lg,
         marginVertical: Spacing.sm,
         borderRadius: Borders.radius.medium,
         ...Shadows.glassSmall 
         }}
         onPress={onPress}
      >
         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
         <Text style={{
            fontSize: Typography.sizes.body,
            fontWeight: Typography.weights.medium,
            color: Colors.textPrimary
         }}>
            {category.name}
         </Text>
         
         <Text style={{
            fontSize: Typography.sizes.small,
            fontWeight: Typography.weights.bold,
            color: Colors.primary,
            marginLeft: Spacing.xs
         }}>
            ({category.count})
         </Text>
         </View>
      </TouchableOpacity>
   );
};

export default CategoryCard;
