import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../constants/color';

const GenderSelector = ({ 
   selectedGender, 
   onSelectGender, 
   disabled = false,
   error = '',
   style
   }) => {
   return (
      <View style={[styles.container, style]}>
         <View style={[
            styles.genderContainer, 
            error ? styles.genderContainerError : null
         ]}>
            <TouchableOpacity
               style={[
                  styles.genderButton,
                  selectedGender === 'male' && styles.genderButtonSelected,
                  disabled && styles.disabledButton
               ]}
               onPress={() => onSelectGender('male')}
               disabled={disabled}
            >
               <Text style={[
                  styles.genderButtonText,
                  selectedGender === 'male' && styles.genderButtonTextSelected
               ]}>Male</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
               style={[
                  styles.genderButton,
                  selectedGender === 'female' && styles.genderButtonSelected,
                  disabled && styles.disabledButton
               ]}
               onPress={() => onSelectGender('female')}
               disabled={disabled}
            >
               <Text style={[
                  styles.genderButtonText,
                  selectedGender === 'female' && styles.genderButtonTextSelected
               ]}>Female</Text>
            </TouchableOpacity>
         </View>
         
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
   genderContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      paddingVertical: Spacing.xs,
      borderRadius: 6,
   },
   genderContainerError: {
      backgroundColor: Colors.error + '05',
      borderWidth: 1,
      borderColor: Colors.error,
      padding: Spacing.xs,
      borderRadius: 6,
   },
   genderButton: {
      backgroundColor: 'white',
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.lg,
      borderRadius: 20,
      minWidth: 90,
      alignItems: 'center',
      marginRight: Spacing.md,
      borderWidth: 1,
      borderColor: Colors.border,
   },
   genderButtonSelected: {
      backgroundColor: Colors.primary,
      borderColor: Colors.primary,
   },
   genderButtonText: {
      color: Colors.textSecondary,
      fontWeight: Typography.weights.medium,
      fontSize: Typography.sizes.body,
   },
   genderButtonTextSelected: {
      color: 'white',
      fontWeight: Typography.weights.semiBold,
   },
   disabledButton: {
      opacity: 0.7,
   },
   errorText: {
      color: Colors.error,
      fontSize: Typography.sizes.small,
      marginTop: Spacing.xs,
      marginLeft: Spacing.xs,
   },
});

export default GenderSelector;
