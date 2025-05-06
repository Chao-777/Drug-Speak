import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { store } from './store';
import { Colors, Typography, Spacing } from './constants/color';
import { useSelector } from 'react-redux';
import CategoriesScreen from './screens/DrugCategories';
import DrugListScreen from './screens/DrugList';
import DrugDetailScreen from './screens/DrugDetail';
import LearningListScreen from './screens/LearningList';
import LearningScreen from './screens/Learning';


const PlaceholderScreen = ({ title }) => (
  <View >
    <Text >
    </Text>
    <Text>
    </Text>
  </View>
);

const Stack = createStackNavigator();

export const CustomTabBar = ({ activeTab, setActiveTab }) => {
  const learningList = useSelector(state => state.learningList.learningList || []);
  const learningCount = learningList.length;
  
  return (
    <View style={{
      flexDirection: 'row',
      height: 80,
      backgroundColor: Colors.cardBackground,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
      paddingBottom: 15,
      paddingTop: 10,
    }}>
      <TouchableOpacity 
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: activeTab === 'drugs' ? 1 : 0.6,
        }}
        onPress={() => setActiveTab('drugs')}
      >
        <Icon name="medication" size={24} color={activeTab === 'drugs' ? Colors.primary : Colors.textSecondary} />
        <Text style={{
          fontSize: Typography.sizes.small,
          color: activeTab === 'drugs' ? Colors.primary : Colors.textSecondary,
          marginTop: Spacing.xs,
        }}>Drugs</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: activeTab === 'learning' ? 1 : 0.6,
        }}
        onPress={() => setActiveTab('learning')}
      >
        <View style={{ position: 'relative' }}>
          <Icon name="school" size={24} color={activeTab === 'learning' ? Colors.primary : Colors.textSecondary} />
          
          {learningCount > 0 && (
            <View style={{
              position: 'absolute',
              top: -8,
              right: -12,
              backgroundColor: Colors.error,
              borderRadius: 12,
              minWidth: 18,
              height: 18,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 4,
            }}>
              <Text style={{
                fontSize: 10,
                color: 'white',
                fontWeight: 'bold',
              }}>
                {learningCount}
              </Text>
            </View>
          )}
        </View>
        <Text style={{
          fontSize: Typography.sizes.small,
          color: activeTab === 'learning' ? Colors.primary : Colors.textSecondary,
          marginTop: Spacing.xs,
        }}>Learning</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: activeTab === 'community' ? 1 : 0.6,
        }}
        onPress={() => setActiveTab('community')}
      >
        <Icon name="people" size={24} color={activeTab === 'community' ? Colors.primary : Colors.textSecondary} />
        <Text style={{
          fontSize: Typography.sizes.small,
          color: activeTab === 'community' ? Colors.primary : Colors.textSecondary,
          marginTop: Spacing.xs,
        }}>Community</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: activeTab === 'profile' ? 1 : 0.6,
        }}
        onPress={() => setActiveTab('profile')}
      >
        <Icon name="person" size={24} color={activeTab === 'profile' ? Colors.primary : Colors.textSecondary} />
        <Text style={{
          fontSize: Typography.sizes.small,
          color: activeTab === 'profile' ? Colors.primary : Colors.textSecondary,
          marginTop: Spacing.xs,
        }}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const MainApp = () => {
  const [activeTab, setActiveTab] = useState('drugs');

  const renderContent = () => {
    switch(activeTab) {
      case 'drugs':
        return (
          <Stack.Navigator
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
              options={{ title: 'Drugs' }} 
            />
            <Stack.Screen
              name="DrugList" 
              component={DrugListScreen} 
              options={{ title:'Drug List'}}
            />
            <Stack.Screen 
              name="DrugDetail" 
              component={DrugDetailScreen} 
              options={{ title: 'Drug Details' }} 
            />
          </Stack.Navigator>
        );
      
      case 'learning':
        return (
          <Stack.Navigator
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
              name="LearningList" 
              component={LearningListScreen} 
              options={{ title: 'Learning List' }} 
            />
            <Stack.Screen 
            name="LearningScreen" 
            component={LearningScreen} 
            options={({ route }) => ({ 
                title: '' 
            })}
      />
          </Stack.Navigator>
        );
      
      case 'community':
        return (
          <Stack.Navigator
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
              name="Community" 
              component={() => <PlaceholderScreen title="Community" />} 
              options={{ title: 'Community' }} 
            />
          </Stack.Navigator>
        );
      
      case 'profile':
        return (
          <Stack.Navigator
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
              name="Profile" 
              component={() => <PlaceholderScreen title="Profile" />} 
              options={{ title: 'My Profile' }} 
            />
          </Stack.Navigator>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {renderContent()}
      <CustomTabBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </View>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <MainApp />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}
