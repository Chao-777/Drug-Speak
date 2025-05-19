import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Spacing, Typography, Borders } from '../constants/color';

const BottomActionBar = ({ 
   onRemove, 
   onFinish, 
   isLoading, 
   removeText = "Remove", 
   finishText = "Finish",
   loadingText = "Updating..."
}) => (
   <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: Colors.border,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.lg,
      backgroundColor: Colors.cardBackground,
   }}>
      <TouchableOpacity
         style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'transparent',
            paddingVertical: Spacing.sm,
            paddingHorizontal: Spacing.md,
            borderRadius: Borders.radius.round, 
            borderWidth: 1,
            borderColor: isLoading ? Colors.textLight : Colors.secondary,
         }}
         onPress={onRemove}
         disabled={isLoading}
      >
         <Icon 
            name="delete-outline" 
            size={24} 
            color={isLoading ? Colors.textLight : Colors.secondary} 
         />
         <Text style={{
            marginLeft: Spacing.xs,
            color: isLoading ? Colors.textLight : Colors.secondary,
            fontSize: Typography.sizes.body,
         }}>
            {removeText}
         </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
         style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isLoading ? Colors.textLight : Colors.primary,
            paddingVertical: Spacing.sm,
            paddingHorizontal: Spacing.md,
            borderRadius: Borders.radius.round, 
         }}
         onPress={onFinish}
         disabled={isLoading}
      >
         <Icon name="check" size={20} color="white" />
         <Text style={{
            marginLeft: Spacing.xs,
            color: 'white',
            fontWeight: Typography.weights.bold,
            fontSize: Typography.sizes.body,
         }}>
            {isLoading ? loadingText : finishText}
         </Text>
      </TouchableOpacity>
   </View>
);

export default BottomActionBar;
