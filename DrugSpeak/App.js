import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, Animated, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { store, persistor } from './store';
import { Colors, Typography, Spacing } from './constants/color';
import { useSelector } from 'react-redux';
import CategoriesScreen from './screens/DrugCategories';
import DrugListScreen from './screens/DrugList';
import DrugDetailScreen from './screens/DrugDetail';
import LearningListScreen from './screens/LearningList';
import LearningScreen from './screens/Learning';
import SignUpScreen from './screens/SignUp';
import SignInScreen from './screens/SignIn';
import UserProfileScreen from './screens/UserProfile';
import AuthService from './api/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';


const SplashScreen = () => {
  const fadeAnim = new Animated.Value(1);
  
  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }, 2500);
    
    return () => clearTimeout(fadeTimer);
  }, []);
  
  return (
    <Animated.View 
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        opacity: fadeAnim,
      }}
    >
      <View style={{
        backgroundColor: Colors.primary, 
        borderRadius: 60,
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
      }}>
        <Text style={{
          color: 'white',
          fontSize: 60,
          fontWeight: 'bold',
        }}>DS</Text>
      </View>
      <Text style={{
        fontSize: 40,
        fontWeight: 'bold',
        color: Colors.primary, 
        marginBottom: 12,
      }}>Drug Speak</Text>
      <Text style={{
        fontSize: 18,
        color: Colors.textPrimary, 
      }}>Your Medication Information Pal</Text>
    </Animated.View>
  );
};

const PlaceholderScreen = ({ title }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
    <Text style={{ fontSize: Typography.sizes.heading, color: Colors.textPrimary }}>
      {title} Screen
    </Text>
    <Text style={{ fontSize: Typography.sizes.body, color: Colors.textSecondary, marginTop: Spacing.md }}>
      This section is coming soon
    </Text>
  </View>
);

const Stack = createStackNavigator();
const ProfileStack = createStackNavigator();

export const CustomTabBar = ({ activeTab, setActiveTab, isLoggedIn }) => {
  const learningList = useSelector(state => state.learningList.learningList || []);
  const currentLearningCount = learningList.filter(drug => drug.status === 'current').length;
  
  const [recordingsBadge, setRecordingsBadge] = useState(0);
  
  useEffect(() => {
    const loadRecordingCounts = async () => {
      try {
        if (!isLoggedIn) return;
        
        let totalRecordings = 0;
        
        for (const drug of learningList.filter(d => d.status === 'current')) {
          const storageKey = `recordings_${drug.id}`;
          const savedRecordings = await AsyncStorage.getItem(storageKey);
          
          if (savedRecordings) {
            const recordings = JSON.parse(savedRecordings);
            totalRecordings += recordings.length;
          }
        }
        
        setRecordingsBadge(totalRecordings > 0 ? totalRecordings : 0);
      } catch (error) {
        console.error('Error loading recording counts for badge:', error);
      }
    };
    
    loadRecordingCounts();
  }, [isLoggedIn, learningList]);
  
  const handleLearningPress = () => {
    if (!isLoggedIn) {
      Alert.alert(
        "Login Required",
        "You need to be logged in to access the Learning section.",
        [
          { text: "OK", onPress: () => console.log("OK Pressed") }
        ]
      );
    } else {
      setActiveTab('learning');
    }
  };
  
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
        onPress={handleLearningPress}
      >
        <View style={{ position: 'relative' }}>
          <Icon name="school" size={24} color={activeTab === 'learning' ? Colors.primary : Colors.textSecondary} />
          
          {isLoggedIn && currentLearningCount > 0 && (
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
                {currentLearningCount}
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


const ProfileNavigator = ({ isLoggedIn, setIsLoggedIn }) => {
  return (
    <ProfileStack.Navigator
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
      {isLoggedIn ? (
        <>
          <ProfileStack.Screen 
            name="UserProfile" 
            component={props => <UserProfileScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
            options={{
              title: '',
            }}
          />
        </>
      ) : (
        <>
          <ProfileStack.Screen 
            name="SignIn" 
            component={props => <SignInScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
            options={{ title: '' }}
          />
          <ProfileStack.Screen 
            name="SignUp" 
            component={props => <SignUpScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
            options={{ title: '' }}
          />
        </>
      )}
    </ProfileStack.Navigator>
  );
};

const MainApp = () => {
  const [activeTab, setActiveTab] = useState('drugs');
  const [isLoggedIn, setIsLoggedInState] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const isAuthenticated = await AuthService.isLoggedIn();
        setIsLoggedInState(isAuthenticated);
      } catch (error) {
        console.error('Error checking login status:', error);
        setIsLoggedInState(false);
      }
    };
    
    checkLoginStatus();
  }, []);

  const setIsLoggedIn = (status) => {
    setIsLoggedInState(status);
  };

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
        if (isLoggedIn) {
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
        } else {
          setActiveTab('drugs');
          return null;
        }
      
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
        return <ProfileNavigator isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />;
      
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {renderContent()}
      <CustomTabBar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isLoggedIn={isLoggedIn} 
      />
    </View>
  );
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          {isLoading ? (
            <SplashScreen />
          ) : (
            <NavigationContainer>
              <MainApp />
            </NavigationContainer>
          )}
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}
