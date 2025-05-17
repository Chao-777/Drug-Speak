import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl, Text } from 'react-native';
import { Colors, Spacing, Borders, Typography } from '../constants/color';
import AuthService from '../api/authService';
import UserService from '../api/userService';
import RecordService from '../api/recordService';
import { useSelector } from 'react-redux';
import { PrimaryButton, SecondaryButton } from '../components/Button';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorState from '../components/ErrorState';
import FormInput from '../components/FormInput';
import { SectionHeader } from '../components/SectionHeader';
import ContentSection from '../components/ContentSection';
import StatsBar from '../components/StatsBar';
import Header from '../components/Header';
import LabeledText from '../components/LabeledText';
import FormModal from '../components/FormModal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserProfileScreen = ({ navigation, setIsLoggedIn }) => {
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);
   const [refreshing, setRefreshing] = useState(false);
   const [syncing, setSyncing] = useState(false);
   const [error, setError] = useState(null);
   const [studyStats, setStudyStats] = useState({
      currentLearning: 0,
      finishedLearning: 0,
      totalScore: 0
   });
   
   const [showEditModal, setShowEditModal] = useState(false);
   const [username, setUsername] = useState('');
   const [password, setPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [updateLoading, setUpdateLoading] = useState(false);
   const [validationErrors, setValidationErrors] = useState({});
   
   const learningList = useSelector(state => state.learningList.learningList || []);
   const currentLearningCount = learningList.filter(drug => drug.status === 'current').length;
   const finishedLearningCount = learningList.filter(drug => drug.status === 'finished').length;

   // Calculate total score from learning list
   const calculateTotalScore = () => {
      return learningList.reduce((total, drug) => total + (drug.score || 0), 0);
   };

   useEffect(() => {
      const syncStats = async () => {
         if (studyStats.currentLearning !== currentLearningCount || 
            studyStats.finishedLearning !== finishedLearningCount) {
            
            setSyncing(true);
            try {
               const user = await AuthService.getCurrentUser();
               if (user && user.id) {
                  const newStats = {
                     currentLearning: currentLearningCount,
                     finishedLearning: finishedLearningCount,
                     totalScore: calculateTotalScore()
                  };
                  
                  await RecordService.upsertStudyRecord(newStats);
                  setStudyStats(newStats);
               }
            } catch (error) {
               console.error('Error syncing stats from Redux state:', error);
            } finally {
               setSyncing(false);
            }
         }
      };
      
      syncStats();
   }, [currentLearningCount, finishedLearningCount]);

   useEffect(() => {
      const unsubscribe = navigation.addListener('focus', () => {
         loadUserProfile();
      });

      return unsubscribe;
   }, [navigation]);

   const loadUserProfile = async () => {
      setLoading(true);
      setError(null);
      
      try {
         // First verify we have a token
         const token = await AsyncStorage.getItem('userToken');
         if (!token) {
            console.log('No auth token found, cannot load profile');
            setError('Authentication required. Please log in again.');
            setLoading(false);
            return;
         }
         
         // Attempt to get fresh data from server first
         try {
            const refreshedUser = await UserService.getUserProfile();
            if (refreshedUser) {
               setUser(refreshedUser);
               setUsername(refreshedUser?.username || '');
            } else {
               throw new Error('Failed to fetch user profile');
            }
         } catch (refreshError) {
            console.error('Error fetching user profile:', refreshError);
            // If server refresh fails, fall back to cached data
            const userData = await AuthService.getCurrentUser();
            if (!userData) {
               throw new Error('User data not available. Please log in again.');
            }
            setUser(userData);
            setUsername(userData?.username || '');
         }
         
         // Now get the study record if we have a user
         const userData = await AuthService.getCurrentUser();
         if (userData && userData.id) {
            try {
               const record = await RecordService.getStudyRecordById(userData.id);
               
               const remoteStats = {
                  currentLearning: record.currentLearning || 0,
                  finishedLearning: record.finishedLearning || 0,
                  totalScore: record.totalScore || 0
               };
               
               if (remoteStats.currentLearning !== currentLearningCount || 
                  remoteStats.finishedLearning !== finishedLearningCount ||
                  remoteStats.totalScore !== calculateTotalScore()) {
                  
                  const updatedStats = {
                     currentLearning: currentLearningCount,
                     finishedLearning: finishedLearningCount,
                     totalScore: calculateTotalScore()
                  };
                  
                  await RecordService.upsertStudyRecord(updatedStats);
                  setStudyStats(updatedStats);
               } else {
                  setStudyStats(remoteStats);
               }
            } catch (error) {
               if (error.message === "Study record not found for this user." || 
                  (error.response && error.response.status === 404)) {
                  
                  const newStats = {
                     currentLearning: currentLearningCount,
                     finishedLearning: finishedLearningCount,
                     totalScore: calculateTotalScore()
                  };
                  
                  try {
                     await RecordService.upsertStudyRecord(newStats);
                     setStudyStats(newStats);
                  } catch (createError) {
                     console.log('Error creating new record, will use default stats:', createError);
                  }
               } else {
                  console.error('Error loading study record:', error);
                  // Don't throw here, just use local stats
                  setStudyStats({
                     currentLearning: currentLearningCount,
                     finishedLearning: finishedLearningCount,
                     totalScore: calculateTotalScore()
                  });
               }
            }
         }
      } catch (error) {
         setError(error.message || 'Failed to load profile');
         console.error('Error loading profile:', error);
      } finally {
         setLoading(false);
         setRefreshing(false);
      }
   };

   const onRefresh = useCallback(() => {
      setRefreshing(true);
      loadUserProfile();
   }, []);

   const validateForm = () => {
      const errors = {};
      
      // Username validation
      if (!username.trim()) {
         errors.username = 'Username cannot be empty';
      } else if (username.trim().length < 3) {
         errors.username = 'Username must be at least 3 characters';
      }
      
      // Password validation (only if user entered something)
      if (password) {
         if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
         }
         
         if (password !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
         }
      } else if (confirmPassword) {
         errors.password = 'Password is required if confirmation is provided';
      }
      
      setValidationErrors(errors);
      return Object.keys(errors).length === 0;
   };

   const handleUpdate = () => {
      setValidationErrors({});
      setShowEditModal(true);
   };
   
   const handleUpdateSubmit = async () => {
      if (!validateForm()) {
         return;
      }
      
      setUpdateLoading(true);
      
      try {
         const updateData = {
            username: username.trim()
         };
         
         if (password) {
            updateData.password = password;
         }
         
         const updatedUser = await UserService.updateProfile(updateData);
         
         await AuthService.updateCurrentUser(updatedUser);
         setUser(updatedUser);
         
         setPassword('');
         setConfirmPassword('');
         
         setShowEditModal(false);
         Alert.alert('Success', 'Profile updated successfully');
         
         loadUserProfile();
      } catch (error) {
         Alert.alert('Error', error.message || 'Failed to update profile');
      } finally {
         setUpdateLoading(false);
      }
   };

   const handleCloseModal = () => {
      setShowEditModal(false);
      setPassword('');
      setConfirmPassword('');
      setUsername(user?.username || '');
      setValidationErrors({});
   };
   
   const handleSignOut = async () => {
      Alert.alert(
         "Sign Out", 
         "Are you sure you want to sign out?", 
         [
            {
               text: "Cancel",
               style: "cancel"
            },
            {
               text: "Sign Out",
               onPress: async () => {
                  try {
                     // Show a loading indicator
                     setLoading(true);
                     
                     // Clear any UI data first for immediate response
                     setUser(null);
                     
                     // Perform final sync before logout - use a special flag
                     console.log('Performing final sync before logout...');
                     await AsyncStorage.setItem('finalSync', 'true');
                     
                     // Now sync any final data
                     try {
                        const userData = await AuthService.getCurrentUser();
                        if (userData && userData.id) {
                           const finalStats = {
                              currentLearning: currentLearningCount,
                              finishedLearning: finishedLearningCount,
                              totalScore: calculateTotalScore()
                           };
                           await RecordService.upsertStudyRecord(finalStats);
                           console.log('Final sync completed successfully');
                        }
                     } catch (syncError) {
                        console.log('Final sync skipped:', syncError.message);
                     }
                     
                     // Clear final sync flag
                     await AsyncStorage.removeItem('finalSync');
                     
                     // Add a delay to allow pending operations to complete
                     console.log('Waiting for pending operations to complete before logout...');
                     await new Promise(resolve => setTimeout(resolve, 3000));
                     
                     // First log the user out
                     console.log('Attempting to sign out');
                     const logoutSuccess = await AuthService.logout();
                     console.log('Logout success:', logoutSuccess);
                     
                     // Add a short delay to ensure storage operations complete
                     setTimeout(() => {
                        // Then ensure UI is updated
                        if (setIsLoggedIn) {
                           console.log('Setting isLoggedIn to false');
                           setIsLoggedIn(false);
                        }
                        // Loading indicator will be hidden in finally block
                     }, 100);
                  } catch (error) {
                     console.error('Error signing out:', error);
                     Alert.alert('Error', 'Failed to sign out. Please try again.');
                     setLoading(false);
                  }
               }
            }
         ]
      );
   };

   if (loading && !refreshing) {
      return <LoadingIndicator message="Loading profile..." />;
   }

   if (error && !refreshing) {
      return <ErrorState message={error} onRetry={loadUserProfile} />;
   }

   return (
      <ScrollView 
         style={styles.container}
         refreshControl={
            <RefreshControl
               refreshing={refreshing}
               onRefresh={onRefresh}
               colors={[Colors.primary]}
            />
         }
      >
         <View style={styles.profileHeader}>
            <Icon name="account-circle" size={80} color={Colors.primary} />
            <Text style={styles.welcomeText}>Welcome, {user?.username || 'User'}!</Text>
            <Text style={styles.joinedText}>Member since {formatDate(user?.createdAt)}</Text>
         </View>
         
         <ContentSection style={styles.infoSection}>
            <LabeledText 
               label="User Name" 
               value={user?.username || 'N/A'} 
               style={styles.infoRow}
            />
            
            <LabeledText 
               label="Email" 
               value={user?.email || 'N/A'} 
               style={styles.infoRow}
            />
            
            <LabeledText 
               label="Gender" 
               value={user?.gender || 'N/A'} 
               style={styles.infoRow}
            />
         </ContentSection>
         
         <ContentSection>
            <SectionHeader title="Study Statistics" />
            
            <StatsBar 
               learningList={learningList}
               isSyncing={syncing}
            />
         </ContentSection>
         
         <View style={styles.buttonContainer}>
            <PrimaryButton 
               title="Update Profile"
               icon="edit"
               onPress={handleUpdate}
               style={styles.actionButton}
            />
            
            <SecondaryButton 
               title="Sign Out"
               icon="logout"
               onPress={handleSignOut}
               style={styles.actionButton}
            />
         </View>
         
         <FormModal
            visible={showEditModal}
            onClose={handleCloseModal}
            onSubmit={handleUpdateSubmit}
            title="Update Profile"
            isLoading={updateLoading}
         >
            <FormInput
               label="Username"
               value={username}
               onChangeText={(text) => {
                  setUsername(text);
                  if (validationErrors.username) {
                     setValidationErrors({...validationErrors, username: ''});
                  }
               }}
               placeholder="Enter username"
               editable={!updateLoading}
               error={validationErrors.username}
            />
            
            <FormInput
               label="New Password (optional)"
               value={password}
               onChangeText={(text) => {
                  setPassword(text);
                  if (validationErrors.password) {
                     setValidationErrors({...validationErrors, password: ''});
                  }
               }}
               placeholder="Enter new password"
               secureTextEntry
               editable={!updateLoading}
               error={validationErrors.password}
            />
            
            <FormInput
               label="Confirm Password"
               value={confirmPassword}
               onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (validationErrors.confirmPassword) {
                     setValidationErrors({...validationErrors, confirmPassword: ''});
                  }
               }}
               placeholder="Confirm new password"
               secureTextEntry
               editable={!updateLoading}
               error={validationErrors.confirmPassword}
            />
         </FormModal>
      </ScrollView>
   );
};

const formatDate = (dateString) => {
   if (!dateString) return 'N/A';
   
   try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
         month: 'long',
         day: 'numeric',
         year: 'numeric'
      });
   } catch (e) {
      return 'N/A';
   }
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: Colors.background,
   },
   infoSection: {
      marginTop: Spacing.lg,
   },
   infoRow: {
      flexDirection: 'row',
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
   },
   buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: Spacing.lg,
      marginTop: Spacing.sm,
      marginBottom: Spacing.xl,
   },
   actionButton: {
      marginHorizontal: Spacing.sm,
      flex: 1,
   },
   profileHeader: {
      alignItems: 'center',
      padding: Spacing.lg,
      backgroundColor: Colors.glass.background,
      borderRadius: Borders.radius.medium,
      marginHorizontal: Spacing.md,
      marginTop: Spacing.lg,
      shadowColor: Colors.glass.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
   },
   welcomeText: {
      fontSize: Typography.sizes.heading,
      fontWeight: Typography.weights.bold,
      color: Colors.textPrimary,
      marginTop: Spacing.md,
   },
   joinedText: {
      fontSize: Typography.sizes.body,
      color: Colors.textSecondary,
      marginTop: Spacing.xs,
   }
});

export default UserProfileScreen;
