import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Colors, Spacing, Typography } from '../constants/color';
import AuthService from '../api/authService';
import FormContainer from '../components/FormContainer';
import FormTitle from '../components/FormTitle';
import FormInput from '../components/FormInput';
import { PrimaryButton, SecondaryButton } from '../components/Button';
import TextLink from '../components/TextLink';

const SignInScreen = ({ navigation, setIsLoggedIn }) => {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [loading, setLoading] = useState(false);
   const [validationErrors, setValidationErrors] = useState({});
   const [error, setError] = useState('');
   const [restoring, setRestoring] = useState(false);

   useEffect(() => {
      const restoreUserEmail = async () => {
         try {
            setRestoring(true);
            const lastEmail = await AuthService.getLastEmail();
            if (lastEmail) {
               setEmail(lastEmail);
            }
         } catch (error) {
            console.error('Error restoring user email:', error);
         } finally {
            setRestoring(false);
         }
      };
      
      restoreUserEmail();
   }, []);

   const validateForm = () => {
      const errors = {};
      
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
      
      setValidationErrors(errors);
      return Object.keys(errors).length === 0;
   };

   const handleSignIn = async () => {
      setError('');
      
      if (!validateForm()) {
         return;
      }
      
      setLoading(true);
      try {
         const result = await AuthService.login(email, password);
         
         await AuthService.saveLastEmail(email);
         
         setIsLoggedIn(true);
         
      } catch (error) {
         console.error('Login error:', error.message || 'Unknown error');
         setError(error.message || 'Login failed. Please try again.');
         setLoading(false);
      }
   };

   const handleClear = () => {
      setEmail('');
      setPassword('');
      setValidationErrors({});
      setError('');
   };

   const navigateToSignUp = () => {
      navigation.navigate('SignUp');
   };

   if (restoring) {
      return (
         <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading...</Text>
         </View>
      );
   }

   return (
      <FormContainer>
         <FormTitle title="Sign in with your email and password" />
         
         {error ? (
            <View style={styles.errorContainer}>
               <Text style={styles.errorText}>{error}</Text>
            </View>
         ) : null}
         
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
            placeholder="Enter your password"
            secureTextEntry
            editable={!loading}
            error={validationErrors.password}
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
               title="Sign in"
               icon="login" 
               onPress={handleSignIn}
               loading={loading}
               disabled={loading}
            />
         </View>
         
         <TextLink
            text="New User? Sign up here! →"
            onPress={navigateToSignUp}
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
      backgroundColor: Colors.error + '12',
      borderRadius: 6,
      borderLeftWidth: 3,
      borderLeftColor: Colors.error,
      padding: Spacing.sm,
      paddingLeft: Spacing.md,
      marginBottom: Spacing.md,
   },
   errorText: {
      color: Colors.error,
      fontSize: Typography.sizes.body,
   },
   loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.lg,
   },
   loadingText: {
      marginTop: Spacing.md,
      color: Colors.textPrimary,
      fontSize: Typography.sizes.body,
   },
});

export default SignInScreen;
