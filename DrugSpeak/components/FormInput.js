import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../constants/color';

const FormInput = ({ 
   label, 
   value, 
   onChangeText, 
   placeholder, 
   secureTextEntry = false, 
   keyboardType = 'default',
   autoCapitalize = 'sentences',
   editable = true,
   style
}) => {
   return (
      <View style={style}>
         <Text style={styles.label}>{label}</Text>
         <TextInput
         style={styles.input}
         value={value}
         onChangeText={onChangeText}
         placeholder={placeholder}
         secureTextEntry={secureTextEntry}
         keyboardType={keyboardType}
         autoCapitalize={autoCapitalize}
         editable={editable}
         />
      </View>
   );
};

const styles = StyleSheet.create({
   label: {
      fontSize: Typography.sizes.body,
      color: Typography.textPrimary,
      marginTop: Spacing.sm,
      marginBottom: Spacing.xs,
   },
   input: {
      backgroundColor: 'white',
      borderRadius: 4,
      padding: Spacing.md,
      fontSize: Typography.sizes.body,
      color: Colors.textPrimary,
      marginBottom: Spacing.md,
   },
});

export default FormInput;
