import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../constants/color';

const FormTitle = ({ title, style }) => {
   return (
      <Text style={[styles.title, style]}>
         {title}
      </Text>
   );
};

const styles = StyleSheet.create({
   title: {
      fontSize: Typography.sizes.subtitle,
      fontWeight: Typography.weights.semiBold,
      color: Colors.textPrimary,
      marginBottom: Spacing.lg,
      letterSpacing: 0.2,
   },
});

export default FormTitle;
