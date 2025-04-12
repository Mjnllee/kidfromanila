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
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const Signup = ({ navigation }) => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    birthdate: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  
  // Get auth context
  const { register, isLoading, error, clearError, isAuthenticated, user } = useAuth();
  
  // Navigate to main app if already authenticated
  useEffect(() => {
    if (isAuthenticated) {  
      if(user.role === null){
        navigation.navigate('MainDrawer');
      }
      navigation.navigate('EmployeeDashboard')
    }
  }, [isAuthenticated, navigation]);
  
  // Show error from auth context
  useEffect(() => {
    if (error) {
      Alert.alert('Registration Failed', error);
      clearError();
    }
  }, [error, clearError]);

  const handleInputChange = (field, value) => {
    setProfile({
      ...profile,
      [field]: value
    });
    // Clear error for this field if it exists
    if (errors[field]) {
      const newErrors = {...errors};
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    let newErrors = {};
    
    // Simple validation
    if (!profile.name) newErrors.name = 'Name is required';
    if (!profile.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!profile.password) newErrors.password = 'Password is required';
    else if (profile.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (profile.password !== profile.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (validateForm()) {
      const success = await register(profile);
      if (success) {
        // Registration and auto-login successful
        // Navigation is handled by the auth context
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
          behavior={Platform.OS === 'ios' ? 'padding' : null}
        >
          <ScrollView contentContainerStyle={styles.scrollView}>
            <StatusBar style="light" />
            
            <View style={styles.headerContainer}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                disabled={isLoading}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Create Account</Text>
              <View style={styles.placeholder} />
            </View>
            
            <View style={styles.profileImageSection}>
              <View style={styles.profileImageContainer}>
                <Image 
                  source={require('../../assets/logo.png')} 
                  style={styles.profileImage}
                />
                <TouchableOpacity style={styles.cameraButton} disabled={isLoading}>
                  <MaterialIcons name="camera-alt" size={22} color="white" />
                </TouchableOpacity>
              </View>
              <Text style={styles.addPhotoText}>Add Profile Photo</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.name ? styles.inputError : null
                  ]}
                  placeholder="Enter your full name"
                  placeholderTextColor="#999"
                  value={profile.name}
                  onChangeText={(text) => handleInputChange('name', text)}
                  editable={!isLoading}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.email ? styles.inputError : null
                  ]}
                  placeholder="Enter your email"
                  placeholderTextColor="#999"
                  value={profile.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!isLoading}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#999"
                  value={profile.phone}
                  onChangeText={(text) => handleInputChange('phone', text)}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Gender</Text>
                <View style={styles.genderSelector}>
                  <TouchableOpacity 
                    style={[
                      styles.genderOption, 
                      profile.gender === 'Male' && styles.genderOptionSelected
                    ]}
                    onPress={() => handleInputChange('gender', 'Male')}
                    disabled={isLoading}
                  >
                    <Text style={[
                      styles.genderText,
                      profile.gender === 'Male' && styles.genderTextSelected
                    ]}>Male</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.genderOption, 
                      profile.gender === 'Female' && styles.genderOptionSelected
                    ]}
                    onPress={() => handleInputChange('gender', 'Female')}
                    disabled={isLoading}
                  >
                    <Text style={[
                      styles.genderText,
                      profile.gender === 'Female' && styles.genderTextSelected
                    ]}>Female</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.genderOption, 
                      profile.gender === 'Other' && styles.genderOptionSelected
                    ]}
                    onPress={() => handleInputChange('gender', 'Other')}
                    disabled={isLoading}
                  >
                    <Text style={[
                      styles.genderText,
                      profile.gender === 'Other' && styles.genderTextSelected
                    ]}>Other</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Birthdate</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor="#999"
                  value={profile.birthdate}
                  onChangeText={(text) => handleInputChange('birthdate', text)}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.password ? styles.inputError : null
                  ]}
                  placeholder="Create a password"
                  placeholderTextColor="#999"
                  value={profile.password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  secureTextEntry
                  editable={!isLoading}
                />
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.confirmPassword ? styles.inputError : null
                  ]}
                  placeholder="Confirm your password"
                  placeholderTextColor="#999"
                  value={profile.confirmPassword}
                  onChangeText={(text) => handleInputChange('confirmPassword', text)}
                  secureTextEntry
                  editable={!isLoading}
                />
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>

              <TouchableOpacity 
                style={[styles.button, isLoading && styles.buttonDisabled]} 
                onPress={handleSignup}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
                )}
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Login')}
                  disabled={isLoading}
                >
                  <Text style={styles.loginLink}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
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
    backgroundColor: 'rgba(0,0,0,0.7)', // Darker overlay
  },
  scrollView: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 20,
    marginBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  profileImageSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#E50000', // Bright red border
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#E50000', // Red camera button
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  addPhotoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  formContainer: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
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
  genderSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    flex: 1,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 2,
    borderRadius: 8,
  },
  genderOptionSelected: {
    backgroundColor: '#E50000', // Red background for selected
    borderColor: '#E50000',
  },
  genderText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '500',
  },
  genderTextSelected: {
    color: 'white',
  },
  button: {
    width: '100%',
    height: 55,
    backgroundColor: 'black', // Black button with red gradient later
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#555',
    fontSize: 15,
  },
  loginLink: {
    color: '#E50000', // Red login link
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default Signup; 