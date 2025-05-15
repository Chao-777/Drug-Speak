import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, Borders, Shadows } from '../constants/color';

const DrugCard = ({ 
   drug, 
   onPress, 
   style,
   activeOpacity = 0.7,
   isButton = true,
   isInLearningList = false 
   }) => {
   const CardComponent = isButton && !isInLearningList ? TouchableOpacity : View;
   
   return (
      <CardComponent 
         style={[{
         backgroundColor: Colors.cardBackground,
         padding: Spacing.lg,
         marginVertical: Spacing.sm,
         borderRadius: Borders.radius.medium,
         ...Shadows.glassSmall,
         opacity: isInLearningList ? 0.7 : 1
         }, style]}
         onPress={isButton && !isInLearningList ? onPress : undefined}
         activeOpacity={activeOpacity}
         disabled={isInLearningList} 
      >
         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
         <View style={{ flex: 1 }}>
            <Text style={{
               fontSize: Typography.sizes.body,
               fontWeight: Typography.weights.medium,
               color: Colors.textPrimary
            }}>
               {drug.name}
            </Text>
            
            {drug.other_names && drug.other_names.length > 0 && (
               <Text style={{
               fontSize: Typography.sizes.small,
               color: Colors.textSecondary,
               marginTop: Spacing.xs
               }}>
               {drug.other_names.join(', ')}
               </Text>
            )}
            
            {isInLearningList && (
               <Text style={{
               fontSize: Typography.sizes.small,
               fontWeight: Typography.weights.medium,
               color: Colors.secondary,
               marginTop: Spacing.xs
               }}>
               Already in your learning list
               </Text>
            )}
         </View>
         
         <Text style={{
            fontSize: Typography.sizes.small,
            fontWeight: Typography.weights.bold,
            color: Colors.primary,
            marginLeft: Spacing.xs
         }}>
            {drug.molecular_formula}
         </Text>
         </View>
      </CardComponent>
   );
};

export default DrugCard;
