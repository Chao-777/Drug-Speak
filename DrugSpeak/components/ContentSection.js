import React from 'react';
import { View } from 'react-native';
import { Colors, Spacing, Borders } from '../constants/color';

const ContentSection = ({ children, noBorder, style }) => {
   return (
      <View style={[{
         padding: Spacing.lg,
         backgroundColor: Colors.cardBackground,
         borderBottomWidth: noBorder ? 0 : Borders.width.thin,
         borderBottomColor: noBorder ? 'transparent' : Colors.border,
      }, style]}>
         {children}
      </View>
   );
};

export default ContentSection;
