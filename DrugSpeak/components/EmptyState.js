// components/EmptyState.js
import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Typography, Spacing } from '../constants/color';

const EmptyState = ({ 
   icon = "library-add", 
   iconSize = 60, 
   iconColor = Colors.textLight,
   message = "No items found.",
   style
}) => (
   <View style={[{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.xl,
      paddingBottom: Spacing.xl + 80,
   }, style]}>
      <Icon 
         name={icon} 
         size={iconSize} 
         color={iconColor} 
         style={{ marginBottom: Spacing.lg }}
      />
      <Text style={{
         fontSize: Typography.sizes.subtitle,
         color: Colors.textSecondary,
         textAlign: 'center',
      }}>
         {message}
      </Text>
   </View>
);

export default EmptyState;
