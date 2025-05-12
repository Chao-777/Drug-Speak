import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Typography, Spacing } from '../constants/color';
import AuthService from '../api/authService';

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
      <View style={styles.container}>
         <View style={styles.formContainer}>
            <Text style={styles.title}>Sign in</Text>
            
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
               placeholder="Enter your password"
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
                  style={[styles.signInButton, loading && styles.disabledButton]} 
                  onPress={handleSignIn}
                  disabled={loading}
               >
                  {loading ? (
                     <ActivityIndicator size="small" color="white" />
                  ) : (
                     <>
                        <Icon name="login" size={16} color="white" />
                        <Text style={styles.buttonText}>Sign In</Text>
                     </>
                  )}
               </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
               style={styles.switchContainer} 
               onPress={navigateToSignUp}
               disabled={loading}
            >
               <Text style={styles.switchText}>New User? Sign up here! → </Text>
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
   signInButton: {
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

export default SignInScreen;
