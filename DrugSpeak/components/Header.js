import React from 'react';
import { 
   View, 
   Text 
} from 'react-native';
import { Colors, Spacing, Typography, Borders } from '../constants/color';

const Header = ({ title }) => {
   return (
      <View style={{
         backgroundColor: Colors.secondary,
         padding: Spacing.md,
         alignItems: 'center',
         borderBottomWidth: Borders.width.thin,
         borderBottomColor: Colors.border,
      }}>
         <Text style={{
            fontSize: Typography.sizes.title,
            fontWeight: Typography.weights.bold,
            color: Colors.textPrimary
         }}>
            {title}
         </Text>
      </View>
   );
};

export default Header;
