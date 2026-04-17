import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Typography, Colors, Spacing } from '../constants/color';

const TextLink = ({ 
   text, 
   onPress, 
   color = Colors.primary, 
   disabled = false,
   style,
   textStyle
}) => {
   return (
      <TouchableOpacity 
         style={[styles.container, style]}
         onPress={onPress}
         disabled={disabled}
      >
         <Text style={[styles.text, { color }, textStyle]}>
         {text}
         </Text>
      </TouchableOpacity>
   );
};

const styles = StyleSheet.create({
   container: {
      alignItems: 'center',
      marginTop: Spacing.xl,
   },
   text: {
      fontSize: Typography.sizes.body,
      textDecorationLine: 'underline',
   },
});

export default TextLink;
