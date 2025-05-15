import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Typography, Spacing, Borders, Shadows } from '../constants/color';

const FinishedDrugCard = ({ drug, onReview, onRemove }) => {
   return (
      <View style={{
         backgroundColor: Colors.cardBackground,
         padding: Spacing.lg,
         marginVertical: Spacing.sm,
         borderRadius: Borders.radius.medium,
         ...Shadows.glassSmall
      }}>
         <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md }}>
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

         <View 
         style={{ 
            borderTopWidth: 1, 
            borderTopColor: Colors.border,
            marginBottom: Spacing.sm 
         }} 
         />

         <View style={{ 
         flexDirection: 'row', 
         justifyContent: 'space-between',
         paddingTop: Spacing.sm,
         }}>
         <TouchableOpacity
            style={{
               flexDirection: 'row',
               alignItems: 'center',
               backgroundColor: Colors.primary,
               paddingVertical: Spacing.xs,
               paddingHorizontal: Spacing.sm,
               borderRadius: Borders.radius.round,
            }}
            onPress={() => onReview(drug)}
         >
            <Icon name="refresh" size={16} color="white" />
            <Text style={{
               color: 'white',
               fontWeight: Typography.weights.medium,
               fontSize: Typography.sizes.small,
               marginLeft: Spacing.xs
            }}>
               Review
            </Text>
         </TouchableOpacity>

         <TouchableOpacity
            style={{
               flexDirection: 'row',
               alignItems: 'center',
               backgroundColor: Colors.cardBackground,
               borderColor: Colors.secondary,
               borderWidth: 1,
               paddingVertical: Spacing.xs,
               paddingHorizontal: Spacing.sm,
               borderRadius: Borders.radius.round,
            }}
            onPress={() => onRemove(drug)}
         >
            <Icon name="delete-outline" size={16} color={Colors.secondary} />
            <Text style={{
               color: Colors.secondary,
               fontWeight: Typography.weights.medium,
               fontSize: Typography.sizes.small,
               marginLeft: Spacing.xs
            }}>
               Remove
            </Text>
         </TouchableOpacity>
         </View>
      </View>
   );
};

export default FinishedDrugCard;
