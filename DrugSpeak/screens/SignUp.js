import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Spacing } from '../constants/color';
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
      <FormContainer>
         <FormTitle title="Sign up a New User" />
         
         <FormInput
            label="User Name"
            value={userName}
            onChangeText={setUserName}
            placeholder="Enter your name"
            editable={!loading}
         />
         
         <FormInput
            label="Gender"
            value=""
            onChangeText={() => {}}
            placeholder=""
            editable={false}
            style={{ marginBottom: 0 }}
         />
         
         <GenderSelector
            selectedGender={gender}
            onSelectGender={setGender}
            disabled={loading}
         />
         
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
            placeholder="Create a password"
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
});

export default SignUpScreen;
