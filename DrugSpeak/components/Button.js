import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Colors, Spacing, Typography, Borders } from '../constants/color';

const StudyButton = ({ onPress }) => {
   return (
      <TouchableOpacity 
      style={{
         backgroundColor: Colors.primary,
         paddingVertical: Spacing.lg,
         paddingHorizontal: Spacing.xl,
         marginHorizontal: Spacing.lg,
         marginVertical: Spacing.lg,
         borderRadius: Borders.radius.medium,
         alignItems: 'center'
      }}
      onPress={onPress}
      >
      <Text style={{
         color: Colors.secondaryLight,
         fontWeight: Typography.weights.bold,
         fontSize: Typography.sizes.body
      }}>
         STUDY
      </Text>
      </TouchableOpacity>
   );
};

export default StudyButton;
