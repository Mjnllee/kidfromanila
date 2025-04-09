import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons, AntDesign } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import * as ImagePicker from 'expo-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';
import { doc, updateDoc } from 'firebase/firestore';
import * as FileSystem from 'expo-file-system';
import Header from '../components/Header';

const EditProfile = ({ navigation }) => {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({
    displayName: '',
    phoneNumber: '',
    birthDate: new Date(),
    gender: 'male',
    bio: '',
    profileImage: null,
  });
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      try {
        console.log('User birthdate from database:', user.birthdate);
        console.log('User gender from database:', user.gender);
        
        let birthDateObj;
        if (user.birthdate) {
          // Try to parse MM/DD/YYYY format first
          if (user.birthdate.includes('/')) {
            const [month, day, year] = user.birthdate.split('/');
            birthDateObj = new Date(year, month - 1, day); // month is 0-indexed in JS Date
          } else {
            // Fallback to standard ISO parsing
            birthDateObj = new Date(user.birthdate);
          }
          
          // Check if valid date
          if (isNaN(birthDateObj.getTime())) {
            console.log('Invalid date format. Using current date.');
            birthDateObj = new Date();
          } else {
            console.log('Successfully parsed birthdate:', birthDateObj);
          }
        } else {
          console.log('No birthdate found. Using current date.');
          birthDateObj = new Date();
        }
        
        // Normalize gender to lowercase for consistent comparison
        let normalizedGender = 'male';
        if (user.gender) {
          // Convert stored gender value to lowercase for consistent comparison
          const lowerGender = user.gender.toLowerCase();
          if (lowerGender.includes('male') || lowerGender === 'm') {
            normalizedGender = 'male';
          } else if (lowerGender.includes('female') || lowerGender === 'f') {
            normalizedGender = 'female';
          } else if (lowerGender.includes('other')) {
            normalizedGender = 'other';
          }
          console.log('Normalized gender:', normalizedGender);
        }
        
        setProfile({
          displayName: user.name || '',
          phoneNumber: user.phone || '',
          birthDate: birthDateObj,
          gender: normalizedGender,
          bio: user.bio || '',
          profileImage: user.profileImageUrl || null,
        });
      } catch (error) {
        console.error('Error setting profile:', error);
        // Set default profile with current date
        setProfile({
          displayName: user.name || '',
          phoneNumber: user.phone || '',
          birthDate: new Date(),
          gender: 'male',
          bio: user.bio || '',
          profileImage: user.profileImageUrl || null,
        });
      }
    }
  }, [user]);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    setProfile({ ...profile, birthDate: date });
    hideDatePicker();
  };

  const validateForm = () => {
    let tempErrors = {};
    
    if (!profile.displayName) tempErrors.displayName = 'Display name is required';
    
    if (profile.phoneNumber && !/^\+?[0-9]{10,15}$/.test(profile.phoneNumber)) {
      tempErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
    if (profile.bio && profile.bio.length > 200) {
      tempErrors.bio = 'Bio must be less than 200 characters';
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Convert image URI to base64
  const uriToBase64 = async (uri) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error("Error converting image to base64:", error);
      return null;
    }
  };

  const pickImage = async () => {
    try {
      console.log("Starting image picker...");
      
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log("Permission status:", status);
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }
      
      // Launch image picker with proper error handling
      console.log("Launching image picker...");
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
      
      console.log("Image picker result:", JSON.stringify(result));
      
      // Check if user canceled or if there was an error
      if (result.canceled) {
        console.log("User canceled image picking");
        return;
      }
      
      if (!result.assets || !result.assets.length) {
        console.log("No assets returned from picker");
        Alert.alert("Error", "Failed to get the selected image. Please try again.");
        return;
      }
      
      // Successfully got image
      console.log("Image selected successfully:", result.assets[0].uri);
      setProfile({ ...profile, profileImage: result.assets[0].uri });
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "There was a problem selecting the image. Please try again.");
    }
  };

  const saveProfile = async () => {
    try {
      setIsUploading(true);
      
      // Validate required fields
      if (!profile.displayName.trim()) {
        Alert.alert('Error', 'Display name is required');
        setIsUploading(false);
        return;
      }
      
      let updatedProfile = {
        name: profile.displayName,
        phone: profile.phoneNumber || '',
        bio: profile.bio || '',
        location: profile.location || '',
        interests: profile.interests || [],
        updatedAt: new Date().toISOString()
      };

      // Format gender to match database expectation (capitalize first letter)
      if (profile.gender) {
        // Convert to "Male", "Female", or "Other" format
        updatedProfile.gender = profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1);
      }
      
      // Only add birthdate if it's a valid date
      if (profile.birthDate && !isNaN(profile.birthDate.getTime())) {
        // Format date as MM/DD/YYYY to match the format from registration
        const month = String(profile.birthDate.getMonth() + 1).padStart(2, '0');
        const day = String(profile.birthDate.getDate()).padStart(2, '0');
        const year = profile.birthDate.getFullYear();
        updatedProfile.birthdate = `${month}/${day}/${year}`;
      }
      
      // Handle profile image if changed - convert to base64 instead of uploading to storage
      if (profile.profileImage && profile.profileImage !== user.profileImageUrl) {
        console.log("Converting image to base64...");
        const base64Image = await uriToBase64(profile.profileImage);
        if (base64Image) {
          updatedProfile.profileImageUrl = base64Image;
          console.log("Image converted to base64 successfully");
        } else {
          console.error("Failed to convert image to base64");
        }
      }
      
      // Update Firestore
      console.log("Updating user profile in Firestore...");
      await updateDoc(doc(db, 'users', user.id), updatedProfile);
      console.log("Firestore update successful");
      
      // Update local user state
      setUser({ ...user, ...updatedProfile });
      
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Header title="Edit Profile" showBackButton={true} hideIcons={true} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileImageSection}>
          <TouchableOpacity 
            style={styles.profileImageContainer} 
            onPress={pickImage}
            disabled={isUploading}
            activeOpacity={0.8}
          >
            <Image 
              source={profile.profileImage ? { uri: profile.profileImage } : require('../../assets/logo.png')} 
              style={styles.profileImage}
            />
            <View style={styles.imageOverlay}>
              <Ionicons name="camera" size={24} color="white" />
              <Text style={styles.changeImageText}>Change</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.changePhotoButton} 
            onPress={pickImage} 
            disabled={isUploading}
          >
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.formContainer}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Display Name</Text>
            <TextInput
              style={[
                styles.input,
                errors.displayName ? styles.inputError : null
              ]}
              placeholder="Enter your display name"
              value={profile.displayName}
              onChangeText={(text) => {
                setProfile({...profile, displayName: text});
                if (errors.displayName) {
                  setErrors({...errors, displayName: null});
                }
              }}
              editable={!isUploading}
            />
            {errors.displayName && <Text style={styles.errorText}>{errors.displayName}</Text>}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={[
                styles.input,
                errors.phoneNumber ? styles.inputError : null
              ]}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              value={profile.phoneNumber}
              onChangeText={(text) => setProfile({...profile, phoneNumber: text})}
              editable={!isUploading}
            />
            {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Birth Date</Text>
            <TouchableOpacity 
              style={styles.datePickerButton} 
              onPress={showDatePicker}
              disabled={isUploading}
            >
              <Text style={styles.datePickerButtonText}>
                {profile.birthDate && !isNaN(profile.birthDate.getTime())
                  ? profile.birthDate.toDateString()
                  : 'Select a date'}
              </Text>
            </TouchableOpacity>
            
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
              date={profile.birthDate}
              maximumDate={new Date()}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderSelector}>
              <TouchableOpacity 
                style={[
                  styles.genderOption, 
                  profile.gender === 'male' && styles.genderOptionSelected
                ]}
                onPress={() => setProfile({...profile, gender: 'male'})}
                disabled={isUploading}
              >
                <Text style={[
                  styles.genderText,
                  profile.gender === 'male' && styles.genderTextSelected
                ]}>Male</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.genderOption, 
                  profile.gender === 'female' && styles.genderOptionSelected
                ]}
                onPress={() => setProfile({...profile, gender: 'female'})}
                disabled={isUploading}
              >
                <Text style={[
                  styles.genderText,
                  profile.gender === 'female' && styles.genderTextSelected
                ]}>Female</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.genderOption, 
                  profile.gender === 'other' && styles.genderOptionSelected
                ]}
                onPress={() => setProfile({...profile, gender: 'other'})}
                disabled={isUploading}
              >
                <Text style={[
                  styles.genderText,
                  profile.gender === 'other' && styles.genderTextSelected
                ]}>Other</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[
                styles.input,
                styles.bioInput,
                errors.bio ? styles.inputError : null
              ]}
              placeholder="Tell us about yourself"
              multiline
              maxLength={200}
              value={profile.bio}
              onChangeText={(text) => setProfile({...profile, bio: text})}
              editable={!isUploading}
            />
            {errors.bio && <Text style={styles.errorText}>{errors.bio}</Text>}
            <Text style={styles.charCount}>{profile.bio ? profile.bio.length : 0}/200</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, isUploading && styles.saveButtonDisabled]}
          onPress={saveProfile}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.changePasswordButton}
          disabled={isUploading}
        >
          <Text style={styles.changePasswordText}>Change Password</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  scrollContent: {
    padding: 15,
  },
  profileImageSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  profileImageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeImageText: {
    color: 'white',
    fontSize: 12,
    marginTop: 2,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f5f5f5',
    height: 45,
    borderRadius: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputError: {
    borderColor: '#FF385C',
  },
  errorText: {
    color: '#FF385C',
    fontSize: 12,
    marginTop: 5,
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
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#eee',
    marginHorizontal: 2,
  },
  genderOptionSelected: {
    backgroundColor: '#FF385C',
    borderColor: '#FF385C',
  },
  genderText: {
    color: '#333',
  },
  genderTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#FF385C',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  saveButtonDisabled: {
    backgroundColor: '#ffb3c0',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  changePasswordButton: {
    backgroundColor: 'transparent',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  changePasswordText: {
    color: '#1e1e1e',
    fontSize: 16,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    alignSelf: 'flex-end',
    color: '#888',
    fontSize: 12,
    marginTop: 5,
  },
});

export default EditProfile; 