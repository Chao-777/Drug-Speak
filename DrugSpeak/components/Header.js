import React from 'react';
import { 
   View, 
   Text, 
   StyleSheet 
} from 'react-native';

const Header = ({ title }) => {
   return (
      <View style={styles.header}>
         <Text style={styles.headerText}>{title}</Text>
      </View>
   );
};

const styles = StyleSheet.create({
   header: {
      backgroundColor: '#f0f0f0',
      padding: 15,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
   },
   headerText: {
      fontSize: 20,
      fontWeight: 'bold',
   },
});

export default Header;
