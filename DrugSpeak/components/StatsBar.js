import React from 'react';
import { View, Text } from 'react-native';
import { Colors, Typography, Spacing } from '../constants/color';

const StatsBar = ({ 
   currentCount, 
   finishedCount, 
   totalScore,
   style 
   }) => (
   <View style={[{
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: Colors.cardBackground,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
   }, style]}>
      <View style={{ alignItems: 'center' }}>
         <Text style={{ 
         fontSize: Typography.sizes.small, 
         color: Colors.textSecondary 
         }}>
         Current
         </Text>
         <Text style={{ 
         fontSize: Typography.sizes.title, 
         fontWeight: Typography.weights.bold, 
         color: Colors.primary
         }}>
         {currentCount}
         </Text>
      </View>
      
      <View style={{ alignItems: 'center' }}>
         <Text style={{ 
         fontSize: Typography.sizes.small, 
         color: Colors.textSecondary 
         }}>
         Finished
         </Text>
         <Text style={{ 
         fontSize: Typography.sizes.title, 
         fontWeight: Typography.weights.bold, 
         color: Colors.textPrimary 
         }}>
         {finishedCount}
         </Text>
      </View>
      
      <View style={{ alignItems: 'center' }}>
         <Text style={{ 
         fontSize: Typography.sizes.small, 
         color: Colors.textSecondary 
         }}>
         Score
         </Text>
         <Text style={{ 
         fontSize: Typography.sizes.title, 
         fontWeight: Typography.weights.bold, 
         color: Colors.secondary
         }}>
         {totalScore}
         </Text>
      </View>
   </View>
);

export default StatsBar;
