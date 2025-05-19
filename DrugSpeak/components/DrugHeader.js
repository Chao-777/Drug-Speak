import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, Borders } from '../constants/color';

const DrugHeader = ({ name, formula, score }) => {
   return (
      <View style={styles.container}>
         <View style={styles.nameContainer}>
            <Text style={styles.name}>
               {name}
            </Text>
            {score > 0 && (
               <Text style={styles.score}>
                  ({score})
               </Text>
            )}
         </View>
         
         <Text style={styles.formula}>
            {formula}
         </Text>
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
      padding: Spacing.lg,
      backgroundColor: Colors.cardBackground,
      alignItems: 'center',
      borderBottomWidth: Borders.width.thin,
      borderBottomColor: Colors.border,
   },
   nameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
   },
   name: {
      fontSize: Typography.sizes.heading,
      fontWeight: Typography.weights.bold,
      color: Colors.textPrimary,
      textAlign: 'center',
      marginRight: 4,
   },
   score: {
      fontSize: Typography.sizes.subheading,
      fontWeight: Typography.weights.bold,
      color: Colors.secondary,
   },
   formula: {
      fontSize: Typography.sizes.body,
      color: Colors.textSecondary,
      marginTop: Spacing.xs,
   },
   badge: {
      backgroundColor: Colors.success,
      padding: Spacing.xs,
      paddingHorizontal: Spacing.md,
      borderRadius: Borders.radius.small,
      marginTop: Spacing.sm,
   },
   badgeText: {
      color: 'white',
      fontWeight: Typography.weights.bold,
      fontSize: Typography.sizes.small,
      textAlign: 'center',
   }
});

export default DrugHeader;
