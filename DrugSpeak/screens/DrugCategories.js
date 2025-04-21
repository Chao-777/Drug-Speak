import React, { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import styled from 'styled-components/native';
import { getCategories } from '../data/drugs';
import CategoryCard from '../components/CategoryCard';
import Header from '../components/Header';
import { Colors, Spacing } from '../constants/color';


const Container = styled.SafeAreaView`
   flex: 1;
   background-color: ${Colors.background};
`;

const StyledFlatList = styled(FlatList)`
   flex: 1;
   height: 100%;
`;

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
      <Container>
         <Header title="Categories" />
         <StyledFlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
               padding: Spacing.md,
               paddingBottom: Spacing.xxl
            }}
            showsVerticalScrollIndicator={true}
         />
      </Container>
   );
};

export default CategoriesScreen;
