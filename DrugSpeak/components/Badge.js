import React from 'react';
import { View, Text } from 'react-native';
import { Colors, Spacing, Typography, Borders } from '../constants/color';

const Badge = ({ text, backgroundColor = Colors.success, textColor = 'white' }) => {
   return (
      <View style={{
         backgroundColor,
         paddingVertical: Spacing.xs,
         paddingHorizontal: Spacing.md,
         borderRadius: Borders.radius.round,
         marginTop: Spacing.sm,
         alignSelf: 'center',
      }}>
         <Text style={{
            color: textColor,
            fontWeight: Typography.weights.semiBold,
            fontSize: Typography.sizes.small,
            textAlign: 'center',
            letterSpacing: 0.3,
         }}>
            {text}
         </Text>
      </View>
   );
};

export default Badge;
