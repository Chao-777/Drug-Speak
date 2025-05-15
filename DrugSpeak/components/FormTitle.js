import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Typography, Spacing } from '../constants/color';

const FormTitle = ({ title, style }) => {
   return (
      <Text style={[styles.title, style]}>
         {title}
      </Text>
   );
};

const styles = StyleSheet.create({
   title: {
      fontSize: Typography.sizes.title,
      fontWeight: Typography.weights.bold,
      color: Typography.textPrimary,
      marginBottom: Spacing.lg,
   },
});

export default FormTitle;
