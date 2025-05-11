import React, { useEffect, useState } from 'react';
import { View, FlatList, SafeAreaView } from 'react-native';
import { getCategories } from '../data/drugs';
import CategoryCard from '../components/CategoryCard';
import Header from '../components/Header';
import { Colors, Spacing } from '../constants/color';

const CategoriesScreen = ({ navigation }) => {
   const [categories, setCategories] = useState([]);

   useEffect(() => {
      const loadedCategories = getCategories();
      setCategories(loadedCategories);
   }, []);

   const renderCategoryItem = ({ item }) => (
      <CategoryCard 
         category={item} 
         onPress={() => {
         navigation.navigate('DrugList', { 
            categoryId: item.id,
            categoryName: item.name
         });
         }}
      />
   );

   return (
      <SafeAreaView
         style={{
         flex: 1,
         backgroundColor: Colors.background,
         }}
      >
         <Header title="Categories" />
         <FlatList
         style={{
            flex: 1,
            height: '100%',
         }}
         data={categories}
         renderItem={renderCategoryItem}
         keyExtractor={(item) => item.id}
         contentContainerStyle={{
            padding: Spacing.md,
            paddingBottom: Spacing.xxl,
         }}
         showsVerticalScrollIndicator={true}
         />
      </SafeAreaView>
   );
};

export default CategoriesScreen;
