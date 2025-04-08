import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const EditProfile = ({ navigation, route }) => {
  // Get initial profile data from route params or use defaults
  const initialProfile = route.params?.profile || {
    name: 'Guest User',
    email: 'guest@example.com',
    phone: '',
    gender: '',
    birthdate: '',
  };
  
  const [profile, setProfile] = useState(initialProfile);
  const [errors, setErrors] = useState({});
  
  const validateForm = () => {
    let newErrors = {};
    
    // Simple validation
    if (!profile.name) newErrors.name = 'Name is required';
    if (!profile.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleUpdateProfile = () => {
    if (validateForm()) {
      // Save profile (would typically be an API call)
      Alert.alert(
        'Success',
        'Profile updated successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileImageSection}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.changePhotoButton}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
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
              value={profile.name}
              onChangeText={(text) => {
                setProfile({...profile, name: text});
                if (errors.name) {
                  setErrors({...errors, name: null});
                }
              }}
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
              keyboardType="email-address"
              autoCapitalize="none"
              value={profile.email}
              onChangeText={(text) => {
                setProfile({...profile, email: text});
                if (errors.email) {
                  setErrors({...errors, email: null});
                }
              }}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              value={profile.phone}
              onChangeText={(text) => setProfile({...profile, phone: text})}
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
                onPress={() => setProfile({...profile, gender: 'Male'})}
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
                onPress={() => setProfile({...profile, gender: 'Female'})}
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
                onPress={() => setProfile({...profile, gender: 'Other'})}
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
              value={profile.birthdate}
              onChangeText={(text) => setProfile({...profile, birthdate: text})}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleUpdateProfile}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.changePasswordButton}>
          <Text style={styles.changePasswordText}>Change Password</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    height: 60,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e1e1e',
  },
  rightPlaceholder: {
    width: 40,
  },
  scrollContent: {
    padding: 15,
  },
  profileImageSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  changePhotoText: {
    fontSize: 14,
    color: '#1e1e1e',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e1e1e',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#e53935',
  },
  errorText: {
    color: '#e53935',
    fontSize: 12,
    marginTop: 5,
  },
  genderSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  genderOptionSelected: {
    backgroundColor: '#ffeaeb',
    borderColor: '#e30613',
  },
  genderText: {
    fontSize: 14,
    color: '#666',
  },
  genderTextSelected: {
    color: '#e30613',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#e30613',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  changePasswordButton: {
    borderWidth: 1,
    borderColor: '#1e1e1e',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  changePasswordText: {
    color: '#1e1e1e',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default EditProfile; 