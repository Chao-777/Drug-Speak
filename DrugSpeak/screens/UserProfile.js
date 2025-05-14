import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Typography, Spacing, Borders } from '../constants/color';
import AuthService from '../api/authService';
import UserService from '../api/userService';
import RecordService from '../api/recordService';
import { useSelector } from 'react-redux';

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
            const record = await RecordService.getStudyRecordById(userData.id);
            
            if (record.isDefaultRecord) {
               const newStats = {
               currentLearning: currentLearningCount,
               finishedLearning: finishedLearningCount,
               totalScore: 0
               };
               
               try {
               await RecordService.upsertStudyRecord(newStats);
               } catch (createError) {
               console.log('Error creating new record, will use default stats:', createError);
               }
            }
            
            setStudyStats({
               currentLearning: record.currentLearning || 0,
               finishedLearning: record.finishedLearning || 0,
               totalScore: record.totalScore || 0
            });
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
      return (
         <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading profile...</Text>
         </View>
      );
   }

   if (error) {
      return (
         <View style={styles.errorContainer}>
            <Icon name="error-outline" size={50} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
               style={styles.retryButton}
               onPress={loadUserProfile}
            >
               <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
         </View>
      );
   }

   return (
      <View style={styles.container}>
         <View style={styles.header}>
            <Text style={styles.headerTitle}>User Profile</Text>
         </View>
         
         <View style={styles.profileContainer}>
            <View style={styles.infoRow}>
               <Text style={styles.label}>User Name:</Text>
               <Text style={styles.value}>{user?.username || 'N/A'}</Text>
            </View>
            
            <View style={styles.infoRow}>
               <Text style={styles.label}>Email:</Text>
               <Text style={styles.value}>{user?.email || 'N/A'}</Text>
            </View>
            
            <View style={styles.infoRow}>
               <Text style={styles.label}>Gender:</Text>
               <Text style={styles.value}>{user?.gender || 'N/A'}</Text>
            </View>
         </View>
         
         <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Study Statistics</Text>
            
            <View style={styles.statsGrid}>
               <View style={styles.statItem}>
                  <Text style={styles.statValueCurrent}>{studyStats.currentLearning}</Text>
                  <Text style={styles.statLabel}>Current Learning</Text>
               </View>
               
               <View style={styles.statItem}>
                  <Text style={styles.statValueFinished}>{studyStats.finishedLearning}</Text>
                  <Text style={styles.statLabel}>Finished</Text>
               </View>
               
               <View style={styles.statItem}>
                  <Text style={styles.statValue}>{studyStats.totalScore}</Text>
                  <Text style={styles.statLabel}>Total Score</Text>
               </View>
            </View>
         </View>
         
         <View style={styles.buttonContainer}>
            <TouchableOpacity 
               style={styles.updateButton}
               onPress={handleUpdate}
            >
               <Icon name="edit" size={18} color="white" />
               <Text style={styles.buttonText}>Update</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
               style={styles.signOutButton}
               onPress={handleSignOut}
            >
               <Icon name="logout" size={18} color="white" />
               <Text style={styles.buttonText}>Sign Out</Text>
            </TouchableOpacity>
         </View>
         
         <Modal
            visible={showEditModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowEditModal(false)}
         >
            <View style={styles.modalContainer}>
               <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Update Profile</Text>
                  
                  <View style={styles.inputGroup}>
                     <Text style={styles.inputLabel}>Username</Text>
                     <TextInput
                        style={styles.input}
                        value={username}
                        onChangeText={setUsername}
                        placeholder="Enter username"
                        editable={!updateLoading}
                     />
                  </View>
                  
                  <View style={styles.inputGroup}>
                     <Text style={styles.inputLabel}>New Password (optional)</Text>
                     <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter new password"
                        secureTextEntry
                        editable={!updateLoading}
                     />
                  </View>
                  
                  <View style={styles.inputGroup}>
                     <Text style={styles.inputLabel}>Confirm Password</Text>
                     <TextInput
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Confirm new password"
                        secureTextEntry
                        editable={!updateLoading}
                     />
                  </View>
                  
                  <View style={styles.modalButtons}>
                     <TouchableOpacity 
                        style={styles.cancelModalButton}
                        onPress={() => {
                           setShowEditModal(false);
                           setPassword('');
                           setConfirmPassword('');
                           setUsername(user?.username || '');
                        }}
                        disabled={updateLoading}
                     >
                        <Text style={styles.cancelModalButtonText}>Cancel</Text>
                     </TouchableOpacity>
                     
                     <TouchableOpacity 
                        style={[styles.confirmButton, updateLoading && styles.disabledButton]}
                        onPress={handleUpdateSubmit}
                        disabled={updateLoading}
                     >
                        {updateLoading ? (
                           <ActivityIndicator size="small" color="white" />
                        ) : (
                           <Text style={styles.confirmButtonText}>Confirm</Text>
                        )}
                     </TouchableOpacity>
                  </View>
               </View>
            </View>
         </Modal>
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: Colors.background,
   },
   loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: Colors.background,
   },
   loadingText: {
      marginTop: Spacing.md,
      fontSize: Typography.sizes.body,
      color: Colors.textPrimary,
   },
   errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: Colors.background,
      padding: Spacing.lg,
   },
   errorText: {
      marginTop: Spacing.md,
      fontSize: Typography.sizes.body,
      color: Colors.error,
      textAlign: 'center',
      marginBottom: Spacing.lg,
   },
   retryButton: {
      backgroundColor: Colors.primary,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.lg,
      borderRadius: Borders.radius.medium,
   },
   retryButtonText: {
      color: 'white',
      fontSize: Typography.sizes.body,
      fontWeight: Typography.weights.medium,
   },
   header: {
      padding: Spacing.md,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
   },
   headerTitle: {
      fontSize: Typography.sizes.title,
      fontWeight: Typography.weights.bold,
      color: Colors.textPrimary,
   },
   profileContainer: {
      padding: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
   },
   infoRow: {
      flexDirection: 'row',
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
   },
   label: {
      flex: 1,
      fontSize: Typography.sizes.body,
      fontWeight: Typography.weights.medium,
      color: Colors.textPrimary,
   },
   value: {
      flex: 1,
      fontSize: Typography.sizes.body,
      color: Colors.textSecondary,
      textAlign: 'right',
   },
   statsContainer: {
      padding: Spacing.lg,
   },
   sectionTitle: {
      fontSize: Typography.sizes.subtitle,
      fontWeight: Typography.weights.bold,
      color: Colors.textPrimary,
      marginBottom: Spacing.md,
   },
   statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: Borders.radius.medium,
      overflow: 'hidden',
   },
   statItem: {
      flex: 1,
      padding: Spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderRightWidth: 1,
      borderRightColor: Colors.border,
      backgroundColor: Colors.cardBackground,
   },
   statValue: {
      fontSize: Typography.sizes.title,
      fontWeight: Typography.weights.bold,
      color: Colors.primary,
   },
   statValueCurrent: {
      fontSize: Typography.sizes.title,
      fontWeight: Typography.weights.bold,
      color: Colors.textPrimary, 
   },
   statValueFinished: {
      fontSize: Typography.sizes.title,
      fontWeight: Typography.weights.bold,
      color: Colors.success, 
   },
   statLabel: {
      fontSize: Typography.sizes.small,
      color: Colors.textSecondary,
      marginTop: Spacing.xs,
      textAlign: 'center',
   },
   buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: Spacing.lg,
      marginTop: Spacing.lg,
   },
   updateButton: {
      backgroundColor: Colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: Borders.radius.medium,
      minWidth: 120,
   },
   signOutButton: {
      backgroundColor: 'darkblue',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: Borders.radius.medium,
      minWidth: 120,
   },
   buttonText: {
      color: 'white',
      fontSize: Typography.sizes.body,
      fontWeight: Typography.weights.medium,
      marginLeft: Spacing.xs,
   },
   modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
   },
   modalContent: {
      backgroundColor: 'white',
      borderRadius: Borders.radius.medium,
      padding: Spacing.lg,
      width: '85%',
   },
   modalTitle: {
      fontSize: Typography.sizes.subtitle,
      fontWeight: Typography.weights.bold,
      color: Colors.textPrimary,
      marginBottom: Spacing.lg,
      textAlign: 'center',
   },
   inputGroup: {
      marginBottom: Spacing.md,
   },
   inputLabel: {
      fontSize: Typography.sizes.body,
      color: Colors.textPrimary,
      marginBottom: Spacing.xs,
   },
   input: {
      backgroundColor: Colors.cardBackground,
      borderRadius: Borders.radius.small,
      padding: Spacing.md,
      fontSize: Typography.sizes.body,
      borderWidth: 1,
      borderColor: Colors.border,
   },
   modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: Spacing.lg,
   },
   confirmButton: {
      backgroundColor: Colors.primary,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: Borders.radius.small,
      flex: 1,
      alignItems: 'center',
      marginLeft: Spacing.sm,
   },
   cancelModalButton: {
      backgroundColor: 'darkblue',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: Borders.radius.small,
      flex: 1,
      alignItems: 'center',
      marginRight: Spacing.sm,
   },
   confirmButtonText: {
      color: 'white',
      fontWeight: Typography.weights.medium,
   },
   cancelModalButtonText: {
      color: 'white',
      fontWeight: Typography.weights.medium,
   },
   disabledButton: {
      opacity: 0.7,
   },
});

export default UserProfileScreen;
