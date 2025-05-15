import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Spacing } from '../constants/color';
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

   const handleSignIn = async () => {
      if (!email || !password) {
         alert('Please enter both email and password');
         return;
      }
      
      setLoading(true);
      try {
         const { user } = await AuthService.login(email, password);
         alert(`Welcome, ${user.username}`);
         setIsLoggedIn(true);
         } catch (error) {
         alert(error.message);
         } finally {
         setLoading(false);
      }
   };

   const handleClear = () => {
      setEmail('');
      setPassword('');
   };

   const navigateToSignUp = () => {
      navigation.navigate('SignUp');
   };

   return (
      <FormContainer>
         <FormTitle title="Sign in with your email and password" />
         
         <FormInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
         />
         
         <FormInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            editable={!loading}
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
});

export default SignInScreen;
