import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Spacing } from '../constants/color';

const FormContainer = ({ children, style }) => {
   return (
      <View style={[styles.container, style]}>
         <View style={styles.formContainer}>
         {children}
         </View>
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white',
      padding: Spacing.md,
   },
   formContainer: {
      width: '100%',
      backgroundColor: '#F5F5F7',
      padding: Spacing.lg,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
   },
});

export default FormContainer;
