import React, { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import styled from 'styled-components/native';
import { getDrugsByCategory, categoryArray } from '../data/drugs';
import DrugCard from '../components/DrugCard';
import Header from '../components/Header';
import { Colors, Spacing } from '../constants/color';

const Container = styled.SafeAreaView`
   flex: 1;
   background-color: ${Colors.background};
`;

const StyledFlatList = styled(FlatList)`
   flex: 1;
`;

const DrugListScreen = ({ route, navigation }) => {
   const { categoryId } = route.params;
   const [drugs, setDrugs] = useState([]);
   const [categoryName, setCategoryName] = useState('');

   useEffect(() => {
      const category = categoryArray.find(cat => cat.id === categoryId);
      const name = category ? category.name : 'Unknown Category';
      setCategoryName(name);
      
      navigation.setOptions({ 
         title: '',
         headerBackTitle: 'Drugs in Category',
      });
      
      const drugsInCategory = getDrugsByCategory(categoryId);
      setDrugs(drugsInCategory);
   }, [categoryId, navigation]);

   const renderDrugItem = ({ item }) => (
      <DrugCard 
         drug={item}
         onPress={() => navigation.navigate('DrugDetail', { drugId: item.id })}
      />
   );

   return (
      <Container>
         <Header title={categoryName} />
         <StyledFlatList
            data={drugs}
            renderItem={renderDrugItem}
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

export default DrugListScreen;
