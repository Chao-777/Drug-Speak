import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CategoriesScreen from './screens/DrugCategories';
import DrugListScreen from './screens/DrugList';

const Stack = createStackNavigator();

export default function App() {
  return (
      <SafeAreaProvider>
        <NavigationContainer>
            <StatusBar style="auto" />
            <Stack.Navigator 
              initialRouteName="Categories"
              screenOptions={{
                  headerStyle: {
                    backgroundColor: '#f8f8f8',
                  },
                  headerTintColor: '#333',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
              }}
            >
              <Stack.Screen 
                  name="Categories" 
                  component={CategoriesScreen} 
                  options={{title: 'Drugs',
                            headerTitleAlign: 'left'
                  }} 
              />
              <Stack.Screen
                  name="DrugList" 
                  component={DrugListScreen} 
                  options={({ route }) => ({
                      title: route.params?.categoryName || 'Drug List',
                  })}
              />
            </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
  );
}
