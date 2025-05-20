import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Colors, Spacing, Typography } from '../constants/color';
import AuthService from '../api/authService';

import FormContainer from '../components/FormContainer';
import FormTitle from '../components/FormTitle';
import FormInput from '../components/FormInput';
import { PrimaryButton, SecondaryButton } from '../components/Button';
import TextLink from '../components/TextLink';
import GenderSelector from '../components/GenderSelector';

const SignUpScreen = ({ navigation, setIsLoggedIn }) => {
   const [userName, setUserName] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [gender, setGender] = useState('');
   const [loading, setLoading] = useState(false);
   const [validationErrors, setValidationErrors] = useState({});
   const [error, setError] = useState('');

   const validateForm = () => {
      const errors = {};
      
      if (!userName) {
         errors.userName = 'Username is required';
      } else if (userName.length < 3) {
         errors.userName = 'Username must be at least 3 characters';
      }
      
      if (!email) {
         errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(email)) {
         errors.email = 'Please enter a valid email';
      }
      
      if (!password) {
         errors.password = 'Password is required';
      } else if (password.length < 6) {
         errors.password = 'Password must be at least 6 characters';
      }
      
      if (!confirmPassword) {
         errors.confirmPassword = 'Please confirm your password';
      } else if (confirmPassword !== password) {
         errors.confirmPassword = 'Passwords do not match';
      }
      
      if (!gender) {
         errors.gender = 'Please select a gender';
      }
      
      setValidationErrors(errors);
      return Object.keys(errors).length === 0;
   };

   const handleSignUp = async () => {
      setError('');
      
      if (!validateForm()) {
         return;
      }
      
      setLoading(true);
      try {
         const result = await AuthService.register({
            username: userName,
            email,
            password,
            gender,
         });
         
         await AuthService.saveLastEmail(email);
         
         setIsLoggedIn(true);
      } catch (error) {
         setError(error.message || 'Registration failed. Please try again.');
      } finally {
         setLoading(false);
      }
   };

   const handleClear = () => {
      setUserName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setGender('');
      setValidationErrors({});
      setError('');
   };

   const navigateToSignIn = () => {
      navigation.navigate('SignIn');
   };

   return (
      <FormContainer>
         <FormTitle title="Sign up a New User" />
         
         {error ? (
            <View style={styles.errorContainer}>
               <Text style={styles.errorText}>{error}</Text>
            </View>
         ) : null}
         
         <FormInput
            label="User Name"
            value={userName}
            onChangeText={(text) => {
               setUserName(text);
               setValidationErrors(prev => ({...prev, userName: ''}));
            }}
            placeholder="Enter your name"
            editable={!loading}
            error={validationErrors.userName}
         />
         

         
         <GenderSelector
            selectedGender={gender}
            onSelectGender={(value) => {
               setGender(value);
               setValidationErrors(prev => ({...prev, gender: ''}));
            }}
            disabled={loading}
            error={validationErrors.gender}
         />
         
         <FormInput
            label="Email"
            value={email}
            onChangeText={(text) => {
               setEmail(text);
               setValidationErrors(prev => ({...prev, email: ''}));
            }}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
            error={validationErrors.email}
         />
         
         <FormInput
            label="Password"
            value={password}
            onChangeText={(text) => {
               setPassword(text);
               setValidationErrors(prev => ({...prev, password: ''}));
            }}
            placeholder="Create a password"
            secureTextEntry
            editable={!loading}
            error={validationErrors.password}
         />
         
         <FormInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={(text) => {
               setConfirmPassword(text);
               setValidationErrors(prev => ({...prev, confirmPassword: ''}));
            }}
            placeholder="Confirm your password"
            secureTextEntry
            editable={!loading}
            error={validationErrors.confirmPassword}
         />
         
         <View style={styles.buttonContainer}>
            <SecondaryButton
               title="Clear"
               icon="clear"  
               onPress={handleClear}
               disabled={loading}
               style={styles.clearButton}
            />
         
            <PrimaryButton
               title="Sign Up"
               icon="person-add"  
               onPress={handleSignUp}
               loading={loading}
               disabled={loading}
            />
         </View>
         
         <TextLink
            text="Already have an account? Sign in here! →"
            onPress={navigateToSignIn}
            disabled={loading}
         />
      </FormContainer>
   );
};

const styles = StyleSheet.create({
   buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: Spacing.md,
   },
   clearButton: {
      marginRight: Spacing.md,
   },
   errorContainer: {
      backgroundColor: Colors.error + '20',
      borderRadius: 5,
      padding: Spacing.sm,
      marginBottom: Spacing.md,
   },
   errorText: {
      color: Colors.error,
      fontSize: Typography.sizes.body,
      textAlign: 'center',
   },
});

export default SignUpScreen;
