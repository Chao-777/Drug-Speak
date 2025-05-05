import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './store';
import CategoriesScreen from './screens/DrugCategories';
import DrugListScreen from './screens/DrugList';
import DrugDetailScreen from './screens/DrugDetail';
import { Colors, Typography } from './constants/color';

const Stack = createStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator 
            initialRouteName="Categories"
            screenOptions={{
              headerStyle: {
                backgroundColor: Colors.secondary,
              },
              headerTintColor: Colors.textPrimary,
              headerTitleStyle: {
                fontWeight: Typography.weights.bold,
              },
              headerTitleAlign: 'left',
            }}
          >
            <Stack.Screen 
              name="Categories" 
              component={CategoriesScreen} 
              options={{
                title: 'Drugs'
              }} 
            />
            <Stack.Screen
              name="DrugList" 
              component={DrugListScreen} 
              options={({ route }) => ({
                title: route.params?.categoryName || 'Drug List',
              })}
            />
            <Stack.Screen 
              name="DrugDetail" 
              component={DrugDetailScreen} 
              options={{ title: 'Drug Details' }} 
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}
