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
   error = '',
   style
}) => {
   return (
      <View style={[styles.container, style]}>
         <Text style={styles.label}>{label}</Text>
         <TextInput
            style={[
               styles.input,
               error ? styles.inputError : null,
               !editable ? styles.disabledInput : null
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            editable={editable}
         />
         {error ? (
            <Text style={styles.errorText}>{error}</Text>
         ) : null}
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
      marginBottom: Spacing.md,
   },
   label: {
      fontSize: Typography.sizes.body,
      color: Colors.textPrimary,
      marginTop: Spacing.sm,
      marginBottom: Spacing.xs,
   },
   input: {
      backgroundColor: 'white',
      borderRadius: 4,
      padding: Spacing.md,
      fontSize: Typography.sizes.body,
      color: Colors.textPrimary,
      borderWidth: 1,
      borderColor: 'transparent',
   },
   inputError: {
      borderColor: Colors.error,
      backgroundColor: Colors.error + '05',
   },
   disabledInput: {
      backgroundColor: '#f5f5f5',
      color: Colors.textSecondary,
   },
   errorText: {
      color: Colors.error,
      fontSize: Typography.sizes.small,
      marginTop: -Spacing.xs,
      marginLeft: Spacing.xs,
   },
});

export default FormInput;
