import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../constants/color';

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
      backgroundColor: '#F1F1F1',
      padding: Spacing.lg,
      borderRadius: 8,
      shadowColor: Colors.shadow,
   },
});

export default FormContainer;
