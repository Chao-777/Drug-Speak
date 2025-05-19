import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Spacing } from '../constants/color';

const ReusableFlatList = ({
   data,
   renderItem,
   keyExtractor,
   contentContainerStyle,
   showsVerticalScrollIndicator = true,
   style,
}) => {
   return (
      <FlatList
         style={[styles.list, style]}
         data={data}
         renderItem={renderItem}
         keyExtractor={keyExtractor}
         contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
         showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      />
   );
};

const styles = StyleSheet.create({
   list: {
      flex: 1,
      height: '100%',
   },
   contentContainer: {
      padding: Spacing.md,
      paddingBottom: Spacing.xxl,
   },
});

export default ReusableFlatList;
