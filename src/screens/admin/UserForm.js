import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Picker } from '@react-native-picker/picker';

// Available roles for users
const ROLES = [
  { label: 'Select a role', value: '' },
  { label: 'Admin', value: 'admin' },
  { label: 'Manager', value: 'manager' },
  { label: 'Staff', value: 'staff' },
  { label: 'Inventory', value: 'inventory' },
  { label: 'Service', value: 'service' },
];

const UserForm = ({ route, navigation }) => {
  // Get user data if editing an existing user
  const existingUser = route.params?.user;
  const isEditMode = !!existingUser;

  // Form state
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Load user data if in edit mode
  useEffect(() => {
    if (isEditMode && existingUser) {
      setUserData({
        name: existingUser.name || '',
        email: existingUser.email || '',
        phone: existingUser.phone || '',
        password: existingUser.password || '',
        role: existingUser.role || null,
      });
    }
  }, [isEditMode, existingUser]);

  const validateForm = () => {
    const newErrors = {};

    if (!userData.name) newErrors.name = 'Name is required';
    if (!userData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!isEditMode && !userData.password) {
      newErrors.password = 'Password is required';
    } else if (!isEditMode && userData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!userData.role) newErrors.role = 'Role is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        setLoading(true);

        const userDataToSave = {
          name: userData.name,
          email: userData.email,
          phone: userData.phone || '',
          role: userData.role,
          updatedAt: new Date().toISOString(),
        };

        if (!isEditMode) {
          // Add password for new users
          userDataToSave.password = userData.password;
          userDataToSave.createdAt = new Date().toISOString();
          
          // Create new user
          await addDoc(collection(db, 'users'), userDataToSave);
          Alert.alert('Success', 'User created successfully');
        } else {
          // Update existing user
          const userRef = doc(db, 'users', existingUser.id);
          
          // Only update password if it was changed
          if (userData.password && userData.password !== existingUser.password) {
            userDataToSave.password = userData.password;
          }
          
          await updateDoc(userRef, userDataToSave);
          Alert.alert('Success', 'User updated successfully');
        }

        navigation.goBack();
      } catch (error) {
        console.error('Error saving user:', error);
        Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'create'} user`);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? 'Edit User' : 'Add New User'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={userData.name}
                onChangeText={(text) => setUserData({...userData, name: text})}
                placeholder="Enter user's name"
                placeholderTextColor="#999"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={userData.email}
                onChangeText={(text) => setUserData({...userData, email: text})}
                placeholder="Enter user's email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={userData.phone}
                onChangeText={(text) => setUserData({...userData, phone: text})}
                placeholder="Enter user's phone number (optional)"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Password {isEditMode && '(leave blank to keep current)'}</Text>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                value={userData.password}
                onChangeText={(text) => setUserData({...userData, password: text})}
                placeholder={isEditMode ? "Enter new password (optional)" : "Enter password"}
                placeholderTextColor="#999"
                secureTextEntry
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Role</Text>
              <View style={[styles.pickerContainer, errors.role && styles.inputError]}>
                <Picker
                  selectedValue={userData.role}
                  onValueChange={(value) => setUserData({...userData, role: value})}
                  style={styles.picker}
                >
                  {ROLES.map((role) => (
                    <Picker.Item 
                      key={role.value} 
                      label={role.label} 
                      value={role.value} 
                    />
                  ))}
                </Picker>
              </View>
              {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isEditMode ? 'Update User' : 'Create User'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  keyboardAvoidContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContainer: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
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
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  inputError: {
    borderColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#1976D2',
    borderRadius: 8,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#90CAF9',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserForm; 