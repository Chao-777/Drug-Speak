import React, { useEffect, useState } from 'react';
import {  
   FlatList, 
   SafeAreaView 
} from 'react-native';
import { getDrugsByCategory, categoryArray } from '../data/drugs';
import DrugCard from '../components/DrugCard';
import Header from '../components/Header';
import { Colors, Spacing } from '../constants/color';

const DrugListScreen = ({ route, navigation }) => {
   const { categoryId } = route.params;
   const [drugs, setDrugs] = useState([]);
   const [categoryName, setCategoryName] = useState('');

   useEffect(() => {
      const category = categoryArray.find(cat => cat.id === categoryId);
      const name = category ? category.name : 'Unknown Category';
      setCategoryName(name);
      
      navigation.setOptions({ 
         title: name,
         headerBackTitle: 'Back'
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
      <SafeAreaView style={{
         flex: 1, 
         backgroundColor: Colors.background
      }}>
         <Header title={categoryName} />
         <FlatList
            data={drugs}
            renderItem={renderDrugItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
               padding: Spacing.md,
               paddingBottom: Spacing.xxl
            }}
            showsVerticalScrollIndicator={true}
         />
      </SafeAreaView>
   );
};

export default DrugListScreen;
