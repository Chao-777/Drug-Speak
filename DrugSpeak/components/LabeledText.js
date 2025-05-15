import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Typography, Colors } from '../constants/color';

const LabeledText = ({ label, value, style }) => {
   return (
      <Text style={[styles.text, style]}>
         <Text style={styles.label}>{label}: </Text>
         {value}
      </Text>
   );
   };

   const styles = StyleSheet.create({
   text: {
      fontSize: Typography.sizes.body,
      color: Colors.textPrimary,
      lineHeight: Typography.sizes.body * 1.5,
   },
   label: {
      fontWeight: Typography.weights.bold,
   }
});

export default LabeledText;
