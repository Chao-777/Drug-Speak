import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../constants/color';

const GenderSelector = ({ 
   selectedGender, 
   onSelectGender, 
   disabled = false,
   style
   }) => {
   return (
      <View style={[styles.genderContainer, style]}>
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
   );
};

const styles = StyleSheet.create({
   genderContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      marginBottom: Spacing.md,
   },
   genderButton: {
      backgroundColor: '#ECECEC',
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.lg,
      borderRadius: 20,
      minWidth: 80,
      alignItems: 'center',
      marginRight: Spacing.md,
      borderWidth: 1,
      borderColor: '#DDDDDD',
   },
   genderButtonSelected: {
      backgroundColor: Colors.primary,
      borderColor: Colors.primary,
   },
   genderButtonText: {
      color: Colors.textSecondary,
      fontWeight: Typography.weights.medium,
   },
   genderButtonTextSelected: {
      color: 'white',
   },
   disabledButton: {
      opacity: 0.7,
   },
});

export default GenderSelector;
