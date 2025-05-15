import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native';
import { getCategories } from '../data/drugs';
import CategoryCard from '../components/CategoryCard';
import Header from '../components/Header';
import ReusableFlatList from '../components/ReusableFlatlist';
import { Colors } from '../constants/color';

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
         <ReusableFlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
         />
      </SafeAreaView>
   );
};

export default CategoriesScreen;
