import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Colors, Spacing, Borders } from '../constants/color';
import AuthService from '../api/authService';
import UserService from '../api/userService';
import RecordService from '../api/recordService';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const UserProfileScreen = ({ navigation, setIsLoggedIn }) => {
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);
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
   
   const learningList = useSelector(state => state.learningList.learningList || []);
   const currentLearningCount = learningList.filter(drug => drug.status === 'current').length;
   const finishedLearningCount = learningList.filter(drug => drug.status === 'finished').length;

   useEffect(() => {
      const syncStats = async () => {
         if (studyStats.currentLearning !== currentLearningCount || 
            studyStats.finishedLearning !== finishedLearningCount) {
            
            const userDataString = await AsyncStorage.getItem('userData');
            if (userDataString) {
               const userData = JSON.parse(userDataString);
               
               if (userData && userData.id) {
                  const newStats = {
                     currentLearning: currentLearningCount,
                     finishedLearning: finishedLearningCount,
                     totalScore: studyStats.totalScore
                  };
                  
                  try {
                     await RecordService.upsertStudyRecord(newStats);
                     setStudyStats(newStats);
                  } catch (error) {
                     console.error('Error syncing stats from Redux state:', error);
                  }
               }
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
         const userData = await AuthService.getCurrentUser();
         setUser(userData);
         setUsername(userData?.username || '');
         
         if (userData && userData.id) {
            try {
               const record = await RecordService.getStudyRecordById(userData.id);
               
               const remoteStats = {
                  currentLearning: record.currentLearning || 0,
                  finishedLearning: record.finishedLearning || 0,
                  totalScore: record.totalScore || 0
               };
               
               if (remoteStats.currentLearning !== currentLearningCount || 
                  remoteStats.finishedLearning !== finishedLearningCount) {
                  
                  const updatedStats = {
                     currentLearning: currentLearningCount,
                     finishedLearning: finishedLearningCount,
                     totalScore: remoteStats.totalScore
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
                     totalScore: 0
                  };
                  
                  try {
                     await RecordService.upsertStudyRecord(newStats);
                     setStudyStats(newStats);
                  } catch (createError) {
                     console.log('Error creating new record, will use default stats:', createError);
                  }
               } else {
                  throw error;
               }
            }
         }
      } catch (error) {
         setError(error.message || 'Failed to load profile');
         Alert.alert('Error', error.message || 'Failed to load profile');
      } finally {
         setLoading(false);
      }
   };

   const handleUpdate = () => {
      setShowEditModal(true);
   };
   
   const handleUpdateSubmit = async () => {
      if (!username.trim()) {
         Alert.alert('Error', 'Username cannot be empty');
         return;
      }
      
      if (password && password.length < 6) {
         Alert.alert('Error', 'Password must be at least 6 characters');
         return;
      }
      
      if (password && password !== confirmPassword) {
         Alert.alert('Error', 'Passwords do not match');
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
   };
   
   const handleSignOut = async () => {
      try {
         await AuthService.logout();
         
         if (setIsLoggedIn) {
            setIsLoggedIn(false);
         }
      } catch (error) {
         console.error('Error signing out:', error);
         Alert.alert('Error', 'Failed to sign out. Please try again.');
      }
   };

   if (loading) {
      return <LoadingIndicator message="Loading profile..." />;
   }

   if (error) {
      return <ErrorState message={error} onRetry={loadUserProfile} />;
   }

   return (
      <ScrollView style={styles.container}>
         <Header title="User Profile" />
         
         <ContentSection>
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
            />
         </ContentSection>
         
         <View style={styles.buttonContainer}>
            <PrimaryButton 
               title="Update"
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
               onChangeText={setUsername}
               placeholder="Enter username"
               editable={!updateLoading}
            />
            
            <FormInput
               label="New Password (optional)"
               value={password}
               onChangeText={setPassword}
               placeholder="Enter new password"
               secureTextEntry
               editable={!updateLoading}
            />
            
            <FormInput
               label="Confirm Password"
               value={confirmPassword}
               onChangeText={setConfirmPassword}
               placeholder="Confirm new password"
               secureTextEntry
               editable={!updateLoading}
            />
         </FormModal>
      </ScrollView>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: Colors.background,
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
      marginTop: Spacing.lg,
   },
   actionButton: {
      marginHorizontal: Spacing.sm,
      flex: 1,
   }
});

export default UserProfileScreen;
