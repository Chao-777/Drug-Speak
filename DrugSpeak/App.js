import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, TouchableOpacity, Text, Alert, AppState, Platform, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { store, persistor } from './store';
import { Colors, Typography, Spacing } from './constants/color';
import { useSelector, useDispatch } from 'react-redux';
import CategoriesScreen from './screens/DrugCategories';
import DrugListScreen from './screens/DrugList';
import DrugDetailScreen from './screens/DrugDetail';
import LearningListScreen from './screens/LearningList';
import LearningScreen from './screens/Learning';
import SignUpScreen from './screens/SignUp';
import SignInScreen from './screens/SignIn';
import UserProfileScreen from './screens/UserProfile';
import CommunityScreen from './screens/Community';
import AuthService from './api/authService';
import UserService from './api/userService';
import LearningDataService from './api/learningDataService';
import * as SplashScreen from 'expo-splash-screen';
import EmptyState from './components/EmptyState';
import AudioRecorderManager from './services/AudioRecorderManager';
import RecordService from './api/recordService';
import { setLearningList } from './store/learningListSlice';

SplashScreen.preventAutoHideAsync();

const PlaceholderScreen = ({ title }) => (
  <View style={{ flex: 1, backgroundColor: Colors.background }}>
    <EmptyState 
      icon="construction"
      message={`${title} Screen is coming soon`}
      iconColor={Colors.textLight}
    />
  </View>
);

const Stack = createStackNavigator();
const ProfileStack = createStackNavigator();

const headerOptions = {
  headerStyle: {
    backgroundColor: 'white',
  },
  headerTintColor: Colors.textPrimary,
  headerTitleStyle: {
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  headerTitleAlign: 'left',
};

export const CustomTabBar = ({ activeTab, setActiveTab, isLoggedIn }) => {
  const learningList = useSelector(state => state.learningList.learningList || []);
  const currentLearningCount = learningList.filter(drug => drug.status === 'current').length;
  
  const [recordingsBadge, setRecordingsBadge] = useState(0);
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (isLoggedIn) {
      const loadData = async () => {
        try {
          const user = await AuthService.getCurrentUser();
          if (user) {
            const userId = user.id || user._id;
            const learningData = await LearningDataService.loadLearningList(userId);
            if (learningData && learningData.length > 0) {
              dispatch(setLearningList(learningData));
            }
          }
        } catch (error) {
          // Error handling
        }
      };
      loadData();
    }
  }, [isLoggedIn, dispatch]);
  
  useEffect(() => {
    const loadRecordingCounts = async () => {
      try {
        if (!isLoggedIn) return;
        
        const counts = await UserService.getRecordingCounts();
        setRecordingsBadge(counts.total || 0);
      } catch (error) {
        // Error handling
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
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: () => setActiveTab('profile') }
        ]
      );
    } else {
      setActiveTab('learning');
    }
  };
  
  const handleCommunityPress = () => {
    if (!isLoggedIn) {
      Alert.alert(
        "Login Required",
        "You need to be logged in to access the Community rankings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: () => setActiveTab('profile') }
        ]
      );
    } else {
      setActiveTab('community');
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
              backgroundColor: Colors.secondary,
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
        onPress={handleCommunityPress}
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

const ProfileNavigator = ({ isLoggedIn, setIsLoggedIn, authStateKey }) => {
  const navigationKey = `profile-stack-${isLoggedIn ? 'user' : 'auth'}-${authStateKey}`;
  
  if (isLoggedIn) {
    return (
      <ProfileStack.Navigator 
        key={navigationKey} 
        screenOptions={headerOptions}
      >
        <ProfileStack.Screen 
          name="UserProfile" 
          options={{ title: '' }}
        >
          {props => <UserProfileScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
        </ProfileStack.Screen>
      </ProfileStack.Navigator>
    );
  } else {
    return (
      <ProfileStack.Navigator 
        key={navigationKey} 
        screenOptions={headerOptions}
      >
        <ProfileStack.Screen 
          name="SignIn" 
          options={{ title: '' }}
        >
          {props => <SignInScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
        </ProfileStack.Screen>
        <ProfileStack.Screen 
          name="SignUp" 
          options={{ title: '' }}
        >
          {props => <SignUpScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
        </ProfileStack.Screen>
      </ProfileStack.Navigator>
    );
  }
};

// Custom loading component to replace LoadingIndicator
const LoadingView = ({ message = "Loading..." }) => (
  <View style={{ 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: Colors.background
  }}>
    <ActivityIndicator size="large" color={Colors.primary} />
    <Text style={{ 
      marginTop: Spacing.md,
      fontSize: Typography.sizes.medium,
      color: Colors.textSecondary
    }}>
      {message}
    </Text>
  </View>
);

const MainApp = () => {
  const [activeTab, setActiveTab] = useState('drugs');
  const [isLoggedIn, setIsLoggedInState] = useState(false);
  const [loading, setLoading] = useState(true);
  const appState = useRef(AppState.currentState);
  const navigationRef = useRef();
  const authStateKey = useRef(0);
  const dispatch = useDispatch();
  
  const loadLearningData = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) {
        return;
      }
      
      const userId = user.id || user._id;
      const learningList = await LearningDataService.loadLearningList(userId);
      
      if (learningList && learningList.length > 0) {
        dispatch(setLearningList(learningList));
      }
    } catch (error) {
      // Error handling
    }
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const isAuthenticated = await AuthService.isLoggedIn();
        setIsLoggedInState(isAuthenticated);
        
        if (isAuthenticated) {
          try {
            await AuthService.refreshUserData();
            await loadLearningData();
          } catch (refreshError) {
            // Not critical, continue
          }
        }
      } catch (error) {
        setIsLoggedInState(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkLoginStatus();
    
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        checkLoginStatus();
      }
      
      appState.current = nextAppState;
    });
    
    return () => {
      subscription.remove();
    };
  }, []);

  const setIsLoggedIn = async (status) => {
    if (status === false && isLoggedIn === true) {
      setIsLoggedInState(false);
      authStateKey.current += 1;
      setActiveTab('drugs');
    } else if (status === true && isLoggedIn === false) {
      setIsLoggedInState(true);
      authStateKey.current += 1;
      setActiveTab('profile');
      
      setTimeout(async () => {
        try {
          const userData = await AuthService.refreshUserData();
          if (userData) {
            try {
              await RecordService.getStudyRecordById(userData.id || userData._id);
              await loadLearningData();
            } catch (recordError) {
              // Not critical
            }
          }
        } catch (refreshError) {
          // Not showing 404 errors
        }
      }, 1000);
    } else {
      setIsLoggedInState(status);
      authStateKey.current += 1;
    }
  };

  if (loading) {
    return <LoadingView message="Loading..." />;
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'drugs':
        return (
          <Stack.Navigator screenOptions={headerOptions}>
            <Stack.Screen 
              name="Categories" 
              component={CategoriesScreen} 
              options={{ title: 'Drugs' }} 
            />
            <Stack.Screen
              name="DrugList" 
              component={DrugListScreen} 
              options={{ title: 'Drug List'}}
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
            <Stack.Navigator screenOptions={headerOptions}>
              <Stack.Screen 
                name="LearningList" 
                component={LearningListScreen} 
                options={{ title: 'Learning List' }} 
              />
              <Stack.Screen 
                name="LearningScreen" 
                component={LearningScreen} 
                options={{ title: '' }}
              />
            </Stack.Navigator>
          );
        } else {
          setActiveTab('drugs');
          return null;
        }
      
      case 'community':
        if (isLoggedIn) {
          return (
            <Stack.Navigator screenOptions={headerOptions}>
              <Stack.Screen 
                name="Community" 
                component={CommunityScreen} 
                options={{ title: 'Community' }} 
              />
            </Stack.Navigator>
          );
        } else {
          setActiveTab('profile');
          return null;
        }
      
      case 'profile':
        return <ProfileNavigator isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} authStateKey={authStateKey.current} />;
      
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
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await AuthService.isLoggedIn();
      } catch (e) {
        // Error handling
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        // Error handling
      }
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingView message="Loading..." />} persistor={persistor}>
        <SafeAreaProvider onLayout={onLayoutRootView}>
          <StatusBar style="dark" /> 
          <NavigationContainer>
            <MainApp />
          </NavigationContainer>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}
