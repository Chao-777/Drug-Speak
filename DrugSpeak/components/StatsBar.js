import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../constants/color';

const StatItem = ({ label, value, color }) => (
   <View style={styles.statItemContainer}>
      <Text style={styles.statLabel}>
         {label}
      </Text>
      <Text style={[styles.statValue, { color }]}>
         {value}
      </Text>
   </View>
);

const StatsBar = ({ 
   learningList = [], // Default to empty array if undefined
   currentCount,
   finishedCount,
   totalScore,
   style 
}) => {
   // Calculate stats from learning list only if learningList is provided
   // Otherwise use the provided counts
   const currentLearning = learningList && learningList.length > 0 
      ? learningList.filter(drug => drug.status === 'current')
      : [];
      
   const finishedLearning = learningList && learningList.length > 0 
      ? learningList.filter(drug => drug.status === 'finished')
      : [];
   
   // Calculate total score only if learningList is provided
   const calculateTotalScore = () => {
      // If learningList is not provided, use the passed in totalScore
      if (!learningList || learningList.length === 0) {
         return totalScore || 0;
      }
      
      // Start with base score of 0
      let calculatedScore = 0;
      
      // Add highest score from each drug
      learningList.forEach(drug => {
         if (drug.score) {
            calculatedScore += drug.score;
         }
      });
      
      return calculatedScore;
   };

   // Determine what values to display
   const displayCurrentCount = learningList && learningList.length > 0 
      ? currentLearning.length 
      : (currentCount || 0);
      
   const displayFinishedCount = learningList && learningList.length > 0 
      ? finishedLearning.length 
      : (finishedCount || 0);
      
   const displayTotalScore = calculateTotalScore();

   return (
      <View style={[styles.container, style]}>
         <StatItem 
            label="Current" 
            value={displayCurrentCount} 
            color={Colors.primary} 
         />

         <View style={styles.divider} />

         <StatItem 
            label="Finished" 
            value={displayFinishedCount} 
            color={Colors.textPrimary} 
         />

         <View style={styles.divider} />

         <StatItem 
            label="Score" 
            value={displayTotalScore} 
            color={Colors.secondary} 
         />
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
      flexDirection: 'row',
      backgroundColor: Colors.cardBackground,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
   },
   statItemContainer: {
      flex: 1,
      alignItems: 'center',
   },
   statLabel: {
      fontSize: Typography.sizes.small,
      color: Colors.textSecondary,
      marginBottom: 4,
   },
   statValue: {
      fontSize: Typography.sizes.title,
      fontWeight: Typography.weights.bold,
   },
   divider: {
      width: 1,
      backgroundColor: Colors.border,
      marginHorizontal: Spacing.sm,
   }
});

export default StatsBar;
