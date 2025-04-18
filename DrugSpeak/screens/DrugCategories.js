import React, { useEffect, useState } from 'react';
import {  
   FlatList, 
   StyleSheet,
   SafeAreaView 
} from 'react-native';
import { getCategories } from '../data/drugs';
import CategoryCard from '../components/CategoryCard';
import Header from '../components/Header';

const CategoriesScreen = ({ navigation }) => {
   const [categories, setCategories] = useState([]);

   useEffect(() => {
      const loadedCategories = getCategories();
      setCategories(loadedCategories);
   }, []);

   const renderCategoryItem = ({ item }) => (
      <CategoryCard 
         category={item} 
         onPress={() => navigation.navigate('DrugList', { 
            categoryId: item.id,
            categoryName: item.name
         })}
      />
   );

   return (
      <SafeAreaView style={styles.container}>
         <Header title="Categories" />
         <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
         />
      </SafeAreaView>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
   },
   listContainer: {
      padding: 10,
   },
});

export default CategoriesScreen;
