import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Typography, Spacing } from '../constants/color';
import AuthService from '../api/authService';

const SignUpScreen = ({ navigation, setIsLoggedIn }) => {
   const [userName, setUserName] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [gender, setGender] = useState('');
   const [loading, setLoading] = useState(false);

   const handleSignUp = async () => {
      if (!userName || !email || !password || !gender) {
         alert('Please fill in all fields');
         return;
      }
   
      setLoading(true);
      try {
         await AuthService.register({
            username: userName,
            email,
            password,
            gender,
         });
   
         alert('Signup successful!');
         setIsLoggedIn(true);
      } catch (error) {
         alert(error.message);
      } finally {
         setLoading(false);
      }
   };

   const handleClear = () => {
      setUserName('');
      setEmail('');
      setPassword('');
      setGender('');
   };

   const navigateToSignIn = () => {
      navigation.navigate('SignIn');
   };

   return (
      <View style={styles.container}>
         <View style={styles.formContainer}>
         <Text style={styles.title}>Sign up a New User</Text>
         
         <Text style={styles.label}>User Name</Text>
         <TextInput
            style={styles.input}
            value={userName}
            onChangeText={setUserName}
            placeholder="Enter your name"
            editable={!loading}
         />
         
         <Text style={styles.label}>Gender</Text>
         <View style={styles.genderContainer}>
            <TouchableOpacity
               style={[
                  styles.genderButton,
                  gender === 'male' && styles.genderButtonSelected,
                  loading && styles.disabledButton
               ]}
               onPress={() => setGender('male')}
               disabled={loading}
            >
               <Text style={[
                  styles.genderButtonText,
                  gender === 'male' && styles.genderButtonTextSelected
               ]}>Male</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
               style={[
                  styles.genderButton,
                  gender === 'female' && styles.genderButtonSelected,
                  loading && styles.disabledButton
               ]}
               onPress={() => setGender('female')}
               disabled={loading}
            >
               <Text style={[
                  styles.genderButtonText,
                  gender === 'female' && styles.genderButtonTextSelected
               ]}>Female</Text>
            </TouchableOpacity>
         </View>
         
         <Text style={styles.label}>Email</Text>
         <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
         />
         
         <Text style={styles.label}>Password</Text>
         <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password"
            secureTextEntry
            editable={!loading}
         />
         
         <View style={styles.buttonContainer}>
            <TouchableOpacity 
               style={[styles.clearButton, loading && styles.disabledButton]} 
               onPress={handleClear}
               disabled={loading}
            >
               <Icon name="clear" size={16} color="white" />
               <Text style={styles.buttonText}>Clear</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
               style={[styles.signUpButton, loading && styles.disabledButton]} 
               onPress={handleSignUp}
               disabled={loading}
            >
               {loading ? (
                  <ActivityIndicator size="small" color="white" />
               ) : (
                  <>
                     <Icon name="person-add" size={16} color="white" />
                     <Text style={styles.buttonText}>Sign Up</Text>
                  </>
               )}
            </TouchableOpacity>
         </View>
         
         <TouchableOpacity 
            style={styles.switchContainer} 
            onPress={navigateToSignIn}
            disabled={loading}
         >
            <Text style={styles.switchText}>Already have an account? Sign in here! →</Text>
         </TouchableOpacity>
         </View>
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white',
      padding: Spacing.md,
   },
   formContainer: {
      width: '100%',
      backgroundColor: '#F1F1F1',
      padding: Spacing.lg,
      borderRadius: 8,
      shadowColor: Colors.shadow,
   },
   title: {
      fontSize: Typography.sizes.title,
      fontWeight: Typography.weights.bold,
      color: Typography.textPrimary,
      marginBottom: Spacing.lg,
   },
   label: {
      fontSize: Typography.sizes.body,
      color: Typography.textPrimary,
      marginTop: Spacing.sm,
      marginBottom: Spacing.xs,
   },
   input: {
      backgroundColor: 'white',
      borderRadius: 4,
      padding: Spacing.md,
      fontSize: Typography.sizes.body,
      color: Colors.textPrimary,
      marginBottom: Spacing.md,
   },
   genderContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      marginBottom: Spacing.md,
   },
   genderButton: {
      backgroundColor: '#ECECEC',
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.lg,
      borderRadius: 20,
      minWidth: 80,
      alignItems: 'center',
      marginRight: Spacing.md,
      borderWidth: 1,
      borderColor: '#DDDDDD',
   },
   genderButtonSelected: {
      backgroundColor: Colors.primary,
      borderColor: Colors.primary,
   },
   genderButtonText: {
      color: Colors.textSecondary,
      fontWeight: Typography.weights.medium,
   },
   genderButtonTextSelected: {
      color: 'white',
   },
   buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: Spacing.md,
   },
   clearButton: {
      backgroundColor: 'darkblue',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.md,
      borderRadius: 4,
      flex: 1,
      marginRight: Spacing.md,
   },
   signUpButton: {
      backgroundColor: Colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.md,
      borderRadius: 4,
      flex: 1,
   },
   disabledButton: {
      opacity: 0.7,
   },
   buttonText: {
      color: 'white',
      marginLeft: Spacing.xs,
      fontWeight: Typography.weights.medium,
   },
   switchContainer: {
      alignItems: 'center',
      marginTop: Spacing.xl,
   },
   switchText: {
      color: 'darkblue',
      fontSize: Typography.sizes.small,
   },
});

export default SignUpScreen;
