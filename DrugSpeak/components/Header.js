import React from 'react';
import { View, Text } from 'react-native';
import { Colors, Spacing, Typography, Borders } from '../constants/color';

const Header = ({ title }) => {
   return (
      <View
         style={{
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.md,
            borderBottomWidth: Borders.width.normal,
            borderBottomColor: Colors.border,
            borderLeftWidth: 4,
            borderLeftColor: Colors.primary,
            backgroundColor: 'white',
         }}
      >
         <Text
            style={{
               fontSize: Typography.sizes.title,
               fontWeight: Typography.weights.semiBold,
               color: Colors.primary,
               letterSpacing: 0.3,
            }}
         >
            {title}
         </Text>
      </View>
   );
};

export default Header;
