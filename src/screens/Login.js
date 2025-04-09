import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  
  // Get auth context
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  
  // Navigate to main app if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigation.navigate('MainDrawer');
    }
  }, [isAuthenticated, navigation]);
  
  // Show error from auth context
  useEffect(() => {
    if (error) {
      Alert.alert('Login Failed', error);
      clearError();
    }
  }, [error, clearError]);

  const validateForm = () => {
    let newErrors = {};
    
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (validateForm()) {
      const success = await login(email, password);
      if (success) {
        navigation.navigate('MainDrawer');
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ImageBackground
        source={require('../../assets/background.jpg')}
        style={styles.backgroundImage}
      >
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <StatusBar style="light" />
          
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>Premium Motorcycle Tires</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.loginPrompt}>Sign in to continue</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email or Username</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.email ? styles.inputError : null
                ]}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) {
                    const newErrors = {...errors};
                    delete newErrors.email;
                    setErrors(newErrors);
                  }
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isLoading}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.password ? styles.inputError : null
                ]}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) {
                    const newErrors = {...errors};
                    delete newErrors.password;
                    setErrors(newErrors);
                  }
                }}
                secureTextEntry
                editable={!isLoading}
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>
            
            <TouchableOpacity 
              style={styles.forgotPassword}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>LOGIN</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Signup')}
                disabled={isLoading}
              >
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.7)', // Darker overlay to match Signup
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    borderWidth: 3,
    borderColor: '#E50000', // Red border
    borderRadius: 60,
  },
  tagline: {
    fontSize: 18,
    color: 'white',
    marginTop: 10,
    fontWeight: 'bold',
  },
  formContainer: {
    width: '100%',
    borderRadius: 15,
    padding: 25,
    backgroundColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e1e1e',
    marginBottom: 5,
    textAlign: 'center',
  },
  loginPrompt: {
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#E50000', // Red border for errors
    borderWidth: 1,
  },
  errorText: {
    color: '#E50000', // Red text for errors
    fontSize: 12,
    marginTop: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#E50000', // Red text
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    width: '100%',
    height: 55,
    backgroundColor: 'black', // Black button
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#333', // Darker when disabled
    opacity: 0.8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  signupText: {
    color: '#555',
    fontSize: 15,
  },
  signupLink: {
    color: '#E50000', // Red link color
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default Login; 