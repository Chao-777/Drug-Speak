import React from 'react';
import { View, Text } from 'react-native';
import { Colors, Spacing, Typography, Borders } from '../constants/color';

const DrugHeader = ({ name, formula, isInLearningList }) => {
   return (
      <View style={{
         padding: Spacing.lg,
         backgroundColor: Colors.cardBackground,
         alignItems: 'center',
         borderBottomWidth: Borders.width.thin,
         borderBottomColor: Colors.border,
      }}>
         <Text style={{
         fontSize: Typography.sizes.heading,
         fontWeight: Typography.weights.bold,
         color: Colors.textPrimary,
         textAlign: 'center',
         }}>
         {name}
         </Text>
         <Text style={{
         fontSize: Typography.sizes.body,
         color: Colors.textSecondary,
         marginTop: Spacing.xs,
         }}>
         {formula}
         </Text>
         {isInLearningList && (
         <View style={{
            backgroundColor: Colors.success,
            padding: Spacing.xs,
            paddingHorizontal: Spacing.md,
            borderRadius: Borders.radius.small,
            marginTop: Spacing.sm,
         }}>
            <Text style={{
               color: 'white',
               fontWeight: Typography.weights.bold,
               fontSize: Typography.sizes.small,
               textAlign: 'center',
            }}>
               Added to Learning List
            </Text>
         </View>
         )}
      </View>
   );
};

export default DrugHeader;
