import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  updateDoc,
  doc
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// User collection reference
const usersCollection = collection(db, 'users');

// Service for Firebase operations
const FirebaseService = {
  // Register a new user
  registerUser: async (userData) => {
    try {
      // Check if email already exists
      const emailQuery = query(usersCollection, where('email', '==', userData.email));
      const emailQuerySnapshot = await getDocs(emailQuery);
      
      if (!emailQuerySnapshot.empty) {
        return { error: 'Email already in use' };
      }

      // Create new user in Firestore
      const docRef = await addDoc(usersCollection, {
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        gender: userData.gender || '',
        birthdate: userData.birthdate || '',
        profileImageUrl: userData.profileImageUrl || '',
        password: userData.password, // Store password (would be hashed in production)
        createdAt: new Date().toISOString(),
      });

      // Return user without password
      const newUser = {
        id: docRef.id,
        ...userData,
      };
      delete newUser.password;
      delete newUser.confirmPassword;

      return { user: newUser };
    } catch (error) {
      console.error('Error registering user:', error);
      return { error: 'Failed to create account' };
    }
  },

  // Login user
  loginUser: async (email, password) => {
    try {
      // Query for user with matching email
      const userQuery = query(usersCollection, where('email', '==', email));
      const querySnapshot = await getDocs(userQuery);
      
      if (querySnapshot.empty) {
        return { error: 'Invalid email or password' };
      }

      // Get the first matching document
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      // In a real app, you would hash passwords and compare hashes
      // This is simplified for demonstration purposes
      if (userData.password !== password) {
        return { error: 'Invalid email or password' };
      }

      // Return user data (without password)
      const user = {
        id: userDoc.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        gender: userData.gender || '',
        birthdate: userData.birthdate || '',
        profileImageUrl: userData.profileImageUrl || '',
      };

      // Save user session
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      return { user };
    } catch (error) {
      console.error('Error logging in:', error);
      return { error: 'Login failed' };
    }
  },

  // Logout user
  logoutUser: async () => {
    try {
      await AsyncStorage.removeItem('user');
      return { success: true };
    } catch (error) {
      console.error('Error logging out:', error);
      return { error: 'Logout failed' };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const userJSON = await AsyncStorage.getItem('user');
      if (userJSON) {
        return { user: JSON.parse(userJSON) };
      }
      return { user: null };
    } catch (error) {
      console.error('Error getting current user:', error);
      return { user: null };
    }
  },

  // Update user profile
  updateUserProfile: async (userId, userData) => {
    try {
      // Reference to the user document
      const userDocRef = doc(db, 'users', userId);
      
      // Update the user document
      await updateDoc(userDocRef, {
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        gender: userData.gender || '',
        birthdate: userData.birthdate || '',
        updatedAt: new Date().toISOString(),
        ...(userData.profileImageUrl && { profileImageUrl: userData.profileImageUrl }),
      });
      
      // Get the updated user data
      const updatedUser = {
        id: userId,
        ...userData
      };
      
      // Update the user in AsyncStorage
      const currentUserJSON = await AsyncStorage.getItem('user');
      if (currentUserJSON) {
        const currentUser = JSON.parse(currentUserJSON);
        const mergedUser = { ...currentUser, ...updatedUser };
        await AsyncStorage.setItem('user', JSON.stringify(mergedUser));
      }
      
      return { user: updatedUser };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { error: 'Failed to update profile' };
    }
  }
};

export default FirebaseService; 