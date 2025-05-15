import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Typography, Colors, Spacing } from '../constants/color';

const SectionHeader = ({ title, style }) => {
   return (
      <Text style={[{
         fontSize: Typography.sizes.subtitle,
         fontWeight: Typography.weights.bold,
         color: Colors.textPrimary,
         marginBottom: Spacing.sm,
      }, style]}>
         {title}
      </Text>
   );
};

const ExpandableSectionHeader = ({ title, count, isExpanded, onToggle, style }) => (
   <TouchableOpacity 
      style={[{
         flexDirection: 'row',
         justifyContent: 'space-between',
         alignItems: 'center',
         paddingVertical: Spacing.md,
         paddingHorizontal: Spacing.lg,
         marginTop: Spacing.md,
         marginBottom: Spacing.xs,
         borderBottomWidth: 1,
         borderBottomColor: Colors.border,
      }, style]}
      onPress={onToggle}
   >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
         <Text style={{
            fontSize: Typography.sizes.subtitle,
            fontWeight: Typography.weights.bold,
            color: Colors.textPrimary
         }}>
            {title}
         </Text>
         
         <Text style={{
            fontSize: Typography.sizes.body,
            color: Colors.primary,
            fontWeight: Typography.weights.bold,
            marginLeft: Spacing.sm
         }}>
            ({count})
         </Text>
      </View>
      
      <Icon 
         name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
         size={24} 
         color={Colors.textSecondary} 
      />
   </TouchableOpacity>
);

export { SectionHeader, ExpandableSectionHeader };
