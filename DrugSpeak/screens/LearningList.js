import React, { useState } from 'react';
import { FlatList, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Spacing, Typography, Borders, Shadows } from '../constants/color';

const LearningListScreen = ({ navigation }) => {
   const learningList = useSelector(state => state.learningList.learningList || []);
   const dispatch = useDispatch();
   
   const currentLearning = learningList.filter(drug => drug.status === 'current');
   const finishedLearning = learningList.filter(drug => drug.status === 'finished');
   
   const [currentExpanded, setCurrentExpanded] = useState(true);
   const [finishedExpanded, setFinishedExpanded] = useState(false);

   const renderDrugItem = ({ item }) => (
      <TouchableOpacity 
         style={{
         backgroundColor: Colors.cardBackground,
         padding: Spacing.lg,
         marginVertical: Spacing.sm,
         borderRadius: Borders.radius.medium,
         ...Shadows.glassSmall // Using the glass shadow effect from CategoryCard
         }}
         onPress={() => navigation.navigate('LearningScreen', { drug: item })}
         activeOpacity={0.7}
      >
         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
         <View style={{ flex: 1 }}>
            <Text style={{
               fontSize: Typography.sizes.body,
               fontWeight: Typography.weights.medium,
               color: Colors.textPrimary
            }}>
               {item.name}
            </Text>
            
            {item.other_names && item.other_names.length > 0 && (
               <Text style={{
               fontSize: Typography.sizes.small,
               color: Colors.textSecondary,
               marginTop: Spacing.xs
               }}>
               {item.other_names.join(', ')}
               </Text>
            )}
         </View>
         
         <Text style={{
            fontSize: Typography.sizes.small,
            fontWeight: Typography.weights.bold,
            color: Colors.primary,
            marginLeft: Spacing.xs
         }}>
            {item.molecular_formula}
         </Text>
         </View>
      </TouchableOpacity>
   );

   // Simple section header component
   const SectionHeader = ({ title, count, isExpanded, onToggle }) => (
      <TouchableOpacity 
         style={{
         flexDirection: 'row',
         justifyContent: 'space-between',
         alignItems: 'center',
         paddingVertical: Spacing.md,
         paddingHorizontal: Spacing.lg,
         marginTop: Spacing.md,
         marginBottom: Spacing.xs,
         borderBottomWidth: 1,
         borderBottomColor: Colors.border,
         }}
         onPress={onToggle}
      >
         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
         <Text style={{
            fontSize: Typography.sizes.subtitle,
            fontWeight: Typography.weights.bold,
            color: Colors.textPrimary
         }}>
            {title}
         </Text>
         
         <Text style={{
            fontSize: Typography.sizes.body,
            color: Colors.primary,
            fontWeight: Typography.weights.bold,
            marginLeft: Spacing.sm
         }}>
            ({count})
         </Text>
         </View>
         
         <Icon 
         name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
         size={24} 
         color={Colors.textSecondary} 
         />
      </TouchableOpacity>
   );

   // Empty state component
   const EmptyState = () => (
      <View style={{
         flex: 1,
         justifyContent: 'center',
         alignItems: 'center',
         padding: Spacing.xl,
         paddingBottom: Spacing.xl + 80,
      }}>
         <Icon 
         name="library-add" 
         size={60} 
         color={Colors.textLight} 
         style={{ marginBottom: Spacing.lg }}
         />
         <Text style={{
         fontSize: Typography.sizes.subtitle,
         color: Colors.textSecondary,
         textAlign: 'center',
         }}>
         Your learning list is empty. Add drugs to your list by pressing the "STUDY" button on drug details screens.
         </Text>
      </View>
   );

   return (
      <SafeAreaView style={{
         flex: 1,
         backgroundColor: Colors.background,
      }}>
         {learningList.length === 0 ? (
         <EmptyState />
         ) : (
         <FlatList
            data={[]} 
            ListHeaderComponent={() => (
               <View style={{ paddingBottom: 100 }}>
               {/* Current Learning Section */}
               <SectionHeader 
                  title="Current Learning" 
                  count={currentLearning.length}
                  isExpanded={currentExpanded}
                  onToggle={() => setCurrentExpanded(!currentExpanded)}
               />
               
               {currentExpanded && currentLearning.map(item => (
                  <View key={item.id} style={{ marginHorizontal: Spacing.md }}>
                     {renderDrugItem({ item })}
                  </View>
               ))}
               
               {/* Finished Learning Section */}
               <SectionHeader 
                  title="Finished" 
                  count={finishedLearning.length}
                  isExpanded={finishedExpanded}
                  onToggle={() => setFinishedExpanded(!finishedExpanded)}
               />
               
               {finishedExpanded && finishedLearning.map(item => (
                  <View key={item.id} style={{ marginHorizontal: Spacing.md }}>
                     {renderDrugItem({ item })}
                  </View>
               ))}
               </View>
            )}
            renderItem={() => null}
            keyExtractor={(item) => item.id}
         />
         )}
      </SafeAreaView>
   );
};

export default LearningListScreen;
