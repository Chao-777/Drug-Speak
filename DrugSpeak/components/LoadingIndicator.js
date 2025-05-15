import React from 'react';
import { View, Text } from 'react-native';
import { Colors, Typography } from '../constants/color';

const LoadingIndicator = ({ message = 'Loading...' }) => {
   return (
      <View style={{
         flex: 1,
         justifyContent: 'center',
         alignItems: 'center',
         backgroundColor: Colors.background,
      }}>
         <Text style={{
         fontSize: Typography.sizes.subtitle,
         color: Colors.textSecondary,
         }}>
         {message}
         </Text>
      </View>
   );
};

export default LoadingIndicator;
