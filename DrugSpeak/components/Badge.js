import React from 'react';
import { View, Text } from 'react-native';
import { Colors, Spacing, Typography, Borders } from '../constants/color';

const Badge = ({ text, backgroundColor = Colors.success, textColor = 'white' }) => {
   return (
      <View style={{
         backgroundColor,
         padding: Spacing.xs,
         paddingHorizontal: Spacing.md,
         borderRadius: Borders.radius.small,
         marginTop: Spacing.sm,
      }}>
         <Text style={{
         color: textColor,
         fontWeight: Typography.weights.bold,
         fontSize: Typography.sizes.small,
         textAlign: 'center',
         }}>
         {text}
         </Text>
      </View>
   );
};

export default Badge;
