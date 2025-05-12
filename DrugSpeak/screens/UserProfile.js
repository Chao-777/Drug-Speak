import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Typography, Spacing, Borders } from '../constants/color';
import AuthService from '../api/authService';

const UserProfileScreen = ({ navigation }) => {
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

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
      } catch (error) {
         setError(error.message || 'Failed to load profile');
         Alert.alert('Error', error.message || 'Failed to load profile');
      } finally {
         setLoading(false);
      }
   };

   const handleUpdate = () => {
      navigation.navigate('EditProfile', { user });
   };
   
   const handleSignOut = async () => {
      try {
         await AuthService.logout();
         navigation.reset({
            index: 0,
            routes: [{ name: 'SignIn' }]
         });
      } catch (error) {
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
});

export default UserProfileScreen;
