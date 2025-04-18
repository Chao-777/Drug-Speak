import React from 'react';
import { 
   TouchableOpacity, 
   Text, 
   StyleSheet 
} from 'react-native';

const CategoryCard = ({ category, onPress }) => {
   return (
      <TouchableOpacity
         style={styles.categoryItem}
         onPress={onPress}
      >
         <Text style={styles.categoryText}>
            {category.name}({category.count})
         </Text>
      </TouchableOpacity>
   );
};

const styles = StyleSheet.create({
   categoryItem: {
      backgroundColor: '#fff',
      padding: 20,
      marginVertical: 8,
      borderRadius: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1,
      elevation: 2,
   },
   categoryText: {
      fontSize: 16,
   },
});

export default CategoryCard;
