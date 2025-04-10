import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  doc, 
  query, 
  where, 
  setDoc,
  serverTimestamp
} from 'firebase/firestore';

const AddressItem = ({ address, isDefault, onEdit, onDelete, onSetDefault }) => {
  return (
    <View style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.addressType}>
          <Text style={styles.addressTypeText}>{address.type}</Text>
          {isDefault && <View style={styles.defaultBadge}><Text style={styles.defaultText}>Default</Text></View>}
        </View>
        <View style={styles.addressActions}>
          <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
            <Ionicons name="create-outline" size={20} color="#FF385C" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
            <Ionicons name="trash-outline" size={20} color="#FF385C" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.recipientName}>{address.name}</Text>
      <Text style={styles.addressLine}>{address.street}</Text>
      <Text style={styles.addressLine}>{address.city}, {address.state} {address.zipCode}</Text>
      <Text style={styles.addressLine}>{address.country}</Text>
      <Text style={styles.phoneNumber}>{address.phone}</Text>

      {!isDefault && (
        <TouchableOpacity style={styles.setDefaultButton} onPress={onSetDefault}>
          <Text style={styles.setDefaultText}>Set as Default</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const MyAddresses = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingAddress, setSavingAddress] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch addresses from Firebase when component mounts
  useEffect(() => {
    if (user) {
      fetchAddresses();
    } else {
      setAddresses([]);
      setLoading(false);
    }
  }, [user]);

  // Function to fetch user's addresses from Firestore
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const addressesRef = collection(db, `users/${user.id}/addresses`);
      const snapshot = await getDocs(addressesRef);
      
      const addressList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setAddresses(addressList);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      Alert.alert('Error', 'Failed to load your saved addresses.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setCurrentAddress({
      type: 'Home',
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Philippines',
      phone: '',
      isDefault: addresses.length === 0 // Set as default if it's the first address
    });
    setIsEditing(false);
    setModalVisible(true);
  };

  const handleEditAddress = (address) => {
    setCurrentAddress({...address});
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleDeleteAddress = async (id) => {
    // Confirm deletion with user
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              // Check if this is the default address
              const isDefaultAddress = addresses.find(addr => addr.id === id)?.isDefault;
              
              // Delete the address document from Firestore
              await deleteDoc(doc(db, `users/${user.id}/addresses/${id}`));
              
              // If we deleted the default address and there are still addresses,
              // set a new default address in Firestore
              if (isDefaultAddress) {
                const remainingAddresses = addresses.filter(addr => addr.id !== id);
                if (remainingAddresses.length > 0) {
                  const newDefaultId = remainingAddresses[0].id;
                  await updateDoc(doc(db, `users/${user.id}/addresses/${newDefaultId}`), {
                    isDefault: true,
                    updatedAt: serverTimestamp()
                  });
                }
              }
              
              // Refresh the address list
              fetchAddresses();
              
            } catch (error) {
              console.error('Error deleting address:', error);
              Alert.alert('Error', 'Failed to delete address. Please try again.');
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleSetDefault = async (id) => {
    try {
      setLoading(true);
      
      // Update all addresses to not be default
      for (const address of addresses) {
        if (address.isDefault) {
          await updateDoc(doc(db, `users/${user.id}/addresses/${address.id}`), {
            isDefault: false,
            updatedAt: serverTimestamp()
          });
        }
      }
      
      // Set the selected address as default
      await updateDoc(doc(db, `users/${user.id}/addresses/${id}`), {
        isDefault: true,
        updatedAt: serverTimestamp()
      });
      
      // Refresh the address list
      fetchAddresses();
      
    } catch (error) {
      console.error('Error setting default address:', error);
      Alert.alert('Error', 'Failed to set default address. Please try again.');
      setLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    // Validate address data
    if (!currentAddress.name || !currentAddress.street || !currentAddress.city || 
        !currentAddress.state || !currentAddress.zipCode || !currentAddress.phone) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }
    
    try {
      setSavingAddress(true);
      
      // Prepare the address data
      const addressData = {
        ...currentAddress,
        updatedAt: serverTimestamp()
      };
      
      // Remove the id field if present (we don't want to store it in the document data)
      if (addressData.id) {
        delete addressData.id;
      }
      
      if (isEditing) {
        // If the address is being set as default, update all other addresses first
        if (addressData.isDefault) {
          for (const address of addresses) {
            if (address.id !== currentAddress.id && address.isDefault) {
              await updateDoc(doc(db, `users/${user.id}/addresses/${address.id}`), {
                isDefault: false,
                updatedAt: serverTimestamp()
              });
            }
          }
        }
        
        // Update existing address
        await updateDoc(doc(db, `users/${user.id}/addresses/${currentAddress.id}`), addressData);
      } else {
        // If this is the first address or marked as default, ensure it's the only default
        if (addressData.isDefault) {
          for (const address of addresses) {
            if (address.isDefault) {
              await updateDoc(doc(db, `users/${user.id}/addresses/${address.id}`), {
                isDefault: false,
                updatedAt: serverTimestamp()
              });
            }
          }
        }
        
        // Set created timestamp for new address
        addressData.createdAt = serverTimestamp();
        
        // Add new address
        await addDoc(collection(db, `users/${user.id}/addresses`), addressData);
      }
      
      // Refresh the addresses list
      await fetchAddresses();
      
      // Close the modal
      setModalVisible(false);
      
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Failed to save address. Please try again.');
    } finally {
      setSavingAddress(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={loading && styles.centerContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF385C" />
            <Text style={styles.loadingText}>Loading addresses...</Text>
          </View>
        ) : !user ? (
          <View style={styles.emptyState}>
            <Ionicons name="person-outline" size={60} color="#ccc" />
            <Text style={styles.emptyStateText}>Please log in</Text>
            <Text style={styles.emptyStateSubtext}>You need to be logged in to manage addresses</Text>
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        ) : addresses.length > 0 ? (
          addresses.map(address => (
            <AddressItem 
              key={address.id}
              address={address}
              isDefault={address.isDefault}
              onEdit={() => handleEditAddress(address)}
              onDelete={() => handleDeleteAddress(address.id)}
              onSetDefault={() => handleSetDefault(address.id)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={60} color="#ccc" />
            <Text style={styles.emptyStateText}>No saved addresses</Text>
            <Text style={styles.emptyStateSubtext}>Add an address to save time during checkout</Text>
          </View>
        )}
      </ScrollView>

      {user && (
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={handleAddAddress}
          disabled={loading}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add New Address</Text>
        </TouchableOpacity>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditing ? 'Edit Address' : 'Add New Address'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.inputLabel}>Address Type</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity 
                  style={[
                    styles.typeOption, 
                    currentAddress?.type === 'Home' && styles.typeOptionSelected
                  ]}
                  onPress={() => setCurrentAddress({...currentAddress, type: 'Home'})}
                >
                  <Text style={[
                    styles.typeText,
                    currentAddress?.type === 'Home' && styles.typeTextSelected
                  ]}>
                    Home
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.typeOption, 
                    currentAddress?.type === 'Work' && styles.typeOptionSelected
                  ]}
                  onPress={() => setCurrentAddress({...currentAddress, type: 'Work'})}
                >
                  <Text style={[
                    styles.typeText,
                    currentAddress?.type === 'Work' && styles.typeTextSelected
                  ]}>
                    Work
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.typeOption, 
                    currentAddress?.type === 'Other' && styles.typeOptionSelected
                  ]}
                  onPress={() => setCurrentAddress({...currentAddress, type: 'Other'})}
                >
                  <Text style={[
                    styles.typeText,
                    currentAddress?.type === 'Other' && styles.typeTextSelected
                  ]}>
                    Other
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter recipient's full name"
                value={currentAddress?.name}
                onChangeText={(text) => setCurrentAddress({...currentAddress, name: text})}
              />

              <Text style={styles.inputLabel}>Street Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter street address, building, apt #"
                value={currentAddress?.street}
                onChangeText={(text) => setCurrentAddress({...currentAddress, street: text})}
              />

              <Text style={styles.inputLabel}>City</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter city"
                value={currentAddress?.city}
                onChangeText={(text) => setCurrentAddress({...currentAddress, city: text})}
              />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ width: '48%' }}>
                  <Text style={styles.inputLabel}>State/Province</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter state"
                    value={currentAddress?.state}
                    onChangeText={(text) => setCurrentAddress({...currentAddress, state: text})}
                  />
                </View>
                <View style={{ width: '48%' }}>
                  <Text style={styles.inputLabel}>ZIP/Postal Code</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter ZIP code"
                    value={currentAddress?.zipCode}
                    onChangeText={(text) => setCurrentAddress({...currentAddress, zipCode: text})}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Country</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter country"
                value={currentAddress?.country}
                onChangeText={(text) => setCurrentAddress({...currentAddress, country: text})}
              />

              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                value={currentAddress?.phone}
                onChangeText={(text) => setCurrentAddress({...currentAddress, phone: text})}
                keyboardType="phone-pad"
              />

              <TouchableOpacity 
                style={styles.checkbox}
                onPress={() => setCurrentAddress({
                  ...currentAddress, 
                  isDefault: !currentAddress.isDefault
                })}
              >
                <View style={[
                  styles.checkboxSquare,
                  currentAddress?.isDefault && styles.checkboxSelected
                ]}>
                  {currentAddress?.isDefault && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <Text style={styles.checkboxText}>Set as default address</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.formActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
                disabled={savingAddress}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, savingAddress && styles.disabledButton]}
                onPress={handleSaveAddress}
                disabled={savingAddress}
              >
                {savingAddress ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Address</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50, // For status bar on iOS
    backgroundColor: '#fff',
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
  rightPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  centerContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 24,
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  defaultBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  defaultText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  addressActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 6,
    marginLeft: 8,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  addressLine: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 14,
    color: '#555',
    marginTop: 8,
  },
  setDefaultButton: {
    borderWidth: 1,
    borderColor: '#FF385C',
    borderRadius: 4,
    padding: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  setDefaultText: {
    color: '#FF385C',
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    left: 24,
    backgroundColor: '#FF385C',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  formContainer: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 8,
  },
  typeOptionSelected: {
    borderColor: '#FF385C',
    backgroundColor: '#FFF5F7',
  },
  typeText: {
    fontSize: 14,
    color: '#666',
  },
  typeTextSelected: {
    color: '#FF385C',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF385C',
    fontSize: 14,
    marginTop: -8,
    marginBottom: 16,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#FF385C',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#FF385C',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#FF385C',
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ffb3c0',
  },
  loadingContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#777',
    fontSize: 16,
    marginTop: 16,
  },
  loginButton: {
    backgroundColor: '#FF385C',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 16,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxSquare: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: '#FF385C',
    backgroundColor: '#FF385C',
  },
});

export default MyAddresses; 