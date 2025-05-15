import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native';
import { useSelector } from 'react-redux';
import { getDrugsByCategory, categoryArray } from '../data/drugs';
import DrugCard from '../components/DrugCard';
import Header from '../components/Header';
import ReusableFlatList from '../components/ReusableFlatlist';
import { Colors } from '../constants/color';

const DrugListScreen = ({ route, navigation }) => {
   const { categoryId } = route.params;
   const [drugs, setDrugs] = useState([]);
   const [categoryName, setCategoryName] = useState('');
   const learningList = useSelector(state => state.learningList.learningList);

   useEffect(() => {
      const category = categoryArray.find(cat => cat.id === categoryId);
      const name = category ? category.name : 'Unknown Category';
      setCategoryName(name);
      
      navigation.setOptions({ 
         title: '',
         headerBackTitle: 'Drugs in Category'
      });
      
      const drugsInCategory = getDrugsByCategory(categoryId);
      setDrugs(drugsInCategory);
   }, [categoryId, navigation]);

   const renderDrugItem = ({ item }) => {
      const isInLearningList = learningList.some(drug => drug.id === item.id);
      
      return (
         <DrugCard 
            drug={item}
            isInLearningList={isInLearningList}
            onPress={() => navigation.navigate('DrugDetail', { drugId: item.id })}
         />
      );
   };

   return (
      <SafeAreaView style={{
         flex: 1,
         backgroundColor: Colors.background
      }}>
         <Header title={categoryName} />
         <ReusableFlatList
            data={drugs}
            renderItem={renderDrugItem}
            keyExtractor={(item) => item.id}
         />
      </SafeAreaView>
   );
};

export default DrugListScreen;
