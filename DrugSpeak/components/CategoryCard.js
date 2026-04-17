import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Spacing, Typography, Borders, Shadows } from '../constants/color';

const CategoryCard = ({ category, onPress }) => {
   return (
      <TouchableOpacity
         style={{
            backgroundColor: Colors.cardBackground,
            padding: Spacing.lg,
            marginVertical: Spacing.sm,
            borderRadius: Borders.radius.medium,
            borderLeftWidth: 3,
            borderLeftColor: Colors.primary,
            ...Shadows.glassSmall,
         }}
         onPress={onPress}
      >
         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
               <Text style={{
                  fontSize: Typography.sizes.body,
                  fontWeight: Typography.weights.medium,
                  color: Colors.textPrimary,
               }}>
                  {category.name}
               </Text>
            </View>

            <Text style={{
               fontSize: Typography.sizes.small,
               fontWeight: Typography.weights.semiBold,
               color: Colors.primary,
               marginRight: Spacing.sm,
            }}>
               {category.count} drugs
            </Text>

            <Icon name="chevron-right" size={20} color={Colors.textSecondary} />
         </View>
      </TouchableOpacity>
   );
};

export default CategoryCard;
