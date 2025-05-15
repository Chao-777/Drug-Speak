import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Typography, Spacing, Borders } from '../constants/color';

const ErrorState = ({ 
   message = 'Something went wrong', 
   onRetry, 
   retryText = 'Retry',
   style
   }) => (
   <View style={[{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.xl,
   }, style]}>
      <Icon 
      name="error-outline" 
      size={60} 
      color={Colors.error} 
      style={{ marginBottom: Spacing.lg }}
      />
      <Text style={{
      fontSize: Typography.sizes.subtitle,
      color: Colors.textSecondary,
      textAlign: 'center',
      marginBottom: Spacing.lg,
      }}>
      {message}
      </Text>
      {onRetry && (
         <TouchableOpacity
         style={{
            backgroundColor: Colors.primary,
            paddingVertical: Spacing.sm,
            paddingHorizontal: Spacing.lg,
            borderRadius: Borders.radius.medium,
         }}
         onPress={onRetry}
         >
         <Text style={{ 
            color: 'white', 
            fontWeight: Typography.weights.bold 
         }}>
            {retryText}
         </Text>
         </TouchableOpacity>
      )}
   </View>
);

export default ErrorState;
