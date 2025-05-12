import React, { useState } from 'react';
import { 
   View, 
   Text, 
   TextInput, 
   TouchableOpacity, 
   StyleSheet, 
   ActivityIndicator, 
   Alert,
   Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Typography, Spacing, Borders } from '../constants/color';
import UserService from '../api/userService';
import AuthService from '../api/authService';

const EditProfileScreen = ({ route, navigation }) => {
   const { user } = route.params || {};
   
   const [username, setUsername] = useState(user?.username || '');
   const [email, setEmail] = useState(user?.email || '');
   const [gender, setGender] = useState(user?.gender || '');
   const [loading, setLoading] = useState(false);
   const [showModal, setShowModal] = useState(false);
   
   const handleUpdate = async () => {
      if (!username) {
         Alert.alert('Error', 'Username cannot be empty');
         return;
      }
      
      setLoading(true);
      try {
         const updateData = {
            username,
            ...(email !== user?.email && { email }),
            ...(gender !== user?.gender && { gender })
         };
         
         const updatedUser = await UserService.updateProfile(updateData);
         
         await AuthService.updateCurrentUser(updatedUser);
         
         Alert.alert('Success', 'Profile updated successfully', [
            { text: 'OK', onPress: () => navigation.goBack() }
         ]);
      } catch (error) {
         Alert.alert('Error', error.message || 'Failed to update profile');
      } finally {
         setLoading(false);
      }
   };
   
   const handleCancel = () => {
      if (username !== user?.username || email !== user?.email || gender !== user?.gender) {
         setShowModal(true);
      } else {
         navigation.goBack();
      }
   };
   
   return (
      <View style={styles.container}>
         <View style={styles.header}>
            <Text style={styles.headerTitle}>Edit Profile</Text>
         </View>
         
         <View style={styles.profileContainer}>
            <View style={styles.inputGroup}>
               <Text style={styles.label}>Username</Text>
               <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter username"
                  editable={!loading}
               />
            </View>
            
            <View style={styles.inputGroup}>
               <Text style={styles.label}>Email</Text>
               <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter email"
                  keyboardType="email-address"
                  editable={!loading}
               />
            </View>
            
            <View style={styles.inputGroup}>
               <Text style={styles.label}>Gender</Text>
               <TextInput
                  style={styles.input}
                  value={gender}
                  onChangeText={setGender}
                  placeholder="Enter gender"
                  editable={!loading}
               />
            </View>
            
            <View style={styles.buttonContainer}>
               <TouchableOpacity 
                  style={styles.confirmButton}
                  onPress={handleUpdate}
                  disabled={loading}
               >
                  {loading ? (
                  <ActivityIndicator size="small" color="white" />
                  ) : (
                  <>
                     <Icon name="check" size={18} color="white" />
                     <Text style={styles.buttonText}>Confirm</Text>
                  </>
                  )}
               </TouchableOpacity>
               
               <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  disabled={loading}
               >
                  <Icon name="close" size={18} color="white" />
                  <Text style={styles.buttonText}>Cancel</Text>
               </TouchableOpacity>
            </View>
         </View>
         
         {/* Confirmation Modal */}
         <Modal
            visible={showModal}
            transparent
            animationType="fade"
         >
            <View style={styles.modalContainer}>
               <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Discard Changes?</Text>
                  <Text style={styles.modalText}>
                  Are you sure you want to discard your changes?
                  </Text>
                  
                  <View style={styles.modalButtons}>
                  <TouchableOpacity 
                     style={styles.modalCancelButton}
                     onPress={() => setShowModal(false)}
                  >
                     <Text style={styles.modalCancelText}>No, Keep Editing</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                     style={styles.modalConfirmButton}
                     onPress={() => {
                        setShowModal(false);
                        navigation.goBack();
                     }}
                  >
                     <Text style={styles.modalConfirmText}>Yes, Discard</Text>
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
   inputGroup: {
      marginBottom: Spacing.lg,
   },
   label: {
      fontSize: Typography.sizes.body,
      fontWeight: Typography.weights.medium,
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
   buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: Spacing.sm,
      marginTop: Spacing.lg,
   },
   confirmButton: {
      backgroundColor: Colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: Borders.radius.medium,
      minWidth: 120,
      marginRight: Spacing.md,
   },
   cancelButton: {
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
   // Modal styles
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
      width: '80%',
      alignItems: 'center',
   },
   modalTitle: {
      fontSize: Typography.sizes.subtitle,
      fontWeight: Typography.weights.bold,
      color: Colors.textPrimary,
      marginBottom: Spacing.md,
   },
   modalText: {
      fontSize: Typography.sizes.body,
      color: Colors.textSecondary,
      textAlign: 'center',
      marginBottom: Spacing.lg,
   },
   modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
   },
   modalCancelButton: {
      padding: Spacing.md,
      borderRadius: Borders.radius.small,
      flex: 1,
      marginRight: Spacing.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: Colors.border,
   },
   modalCancelText: {
      color: Colors.textPrimary,
      fontSize: Typography.sizes.small,
   },
   modalConfirmButton: {
      backgroundColor: Colors.error,
      padding: Spacing.md,
      borderRadius: Borders.radius.small,
      flex: 1,
      alignItems: 'center',
   },
   modalConfirmText: {
      color: 'white',
      fontSize: Typography.sizes.small,
      fontWeight: Typography.weights.medium,
   },
});

export default EditProfileScreen;
