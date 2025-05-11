import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Typography, Spacing } from '../constants/color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const SignUpScreen = ({ navigation, setIsLoggedIn }) => {
   const [userName, setUserName] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [gender, setGender] = useState('');

   const handleSignUp = async () => {
      if (!userName || !email || !password || !gender) {
         alert('Please fill in all fields');
         return;
      }
   
      try {
         const response = await axios.post('http://localhost:3000/users', {
            username: userName,
            email,
            password,
            gender,
         });
   
         if (response.data && response.data.token) {
            alert('Signup successful!');
            setIsLoggedIn(true);
   
            await AsyncStorage.setItem('token', response.data.token);
         }
      } catch (error) {
         if (error.response && error.response.status === 409) {
            alert('Email already in use.');
         } else if (error.response && error.response.status === 400) {
            alert('Invalid input. Please check all fields.');
         } else {
            alert('An error occurred during signup.');
         }
         console.error(error.response?.data || error.message);
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
         />
         
         <Text style={styles.label}>Gender</Text>
         <View style={styles.genderContainer}>
            <TouchableOpacity
               style={[
               styles.genderButton,
               gender === 'male' && styles.genderButtonSelected
               ]}
               onPress={() => setGender('male')}
            >
               <Text style={[
               styles.genderButtonText,
               gender === 'male' && styles.genderButtonTextSelected
               ]}>Male</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
               style={[
               styles.genderButton,
               gender === 'female' && styles.genderButtonSelected
               ]}
               onPress={() => setGender('female')}
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
         />
         
         <Text style={styles.label}>Password</Text>
         <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password"
            secureTextEntry
         />
         
         <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
               <Icon name="clear" size={16} color="white" />
               <Text style={styles.buttonText}>Clear</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
               <Icon name="person-add" size={16} color="white" />
               <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
         </View>
         
         <TouchableOpacity style={styles.switchContainer} onPress={navigateToSignIn}>
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
