import React, { useState } from 'react';
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
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

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
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: 'Home',
      name: 'John Doe',
      street: '123 Main Street, Apt 4B',
      city: 'Manila',
      state: 'Metro Manila',
      zipCode: '1000',
      country: 'Philippines',
      phone: '+63 912 345 6789',
      isDefault: true
    },
    {
      id: 2,
      type: 'Work',
      name: 'John Doe',
      street: '456 Office Tower, 7th Floor',
      city: 'Makati',
      state: 'Metro Manila',
      zipCode: '1200',
      country: 'Philippines',
      phone: '+63 923 456 7890',
      isDefault: false
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleAddAddress = () => {
    setCurrentAddress({
      id: addresses.length > 0 ? Math.max(...addresses.map(a => a.id)) + 1 : 1,
      type: 'Home',
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Philippines',
      phone: '',
      isDefault: addresses.length === 0
    });
    setIsEditing(false);
    setModalVisible(true);
  };

  const handleEditAddress = (address) => {
    setCurrentAddress({...address});
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleDeleteAddress = (id) => {
    const updatedAddresses = addresses.filter(address => address.id !== id);
    
    // If we deleted the default address and there are still addresses, set a new default
    if (addresses.find(address => address.id === id).isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true;
    }
    
    setAddresses(updatedAddresses);
  };

  const handleSetDefault = (id) => {
    const updatedAddresses = addresses.map(address => ({
      ...address,
      isDefault: address.id === id
    }));
    setAddresses(updatedAddresses);
  };

  const handleSaveAddress = () => {
    if (isEditing) {
      const updatedAddresses = addresses.map(address => 
        address.id === currentAddress.id ? currentAddress : address
      );
      setAddresses(updatedAddresses);
    } else {
      // If this is the first address or marked as default, ensure it's the only default
      if (currentAddress.isDefault) {
        const updatedAddresses = addresses.map(address => ({
          ...address,
          isDefault: false
        }));
        setAddresses([...updatedAddresses, currentAddress]);
      } else {
        setAddresses([...addresses, currentAddress]);
      }
    }
    setModalVisible(false);
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

      <ScrollView style={styles.content}>
        {addresses.length > 0 ? (
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

      <TouchableOpacity 
        style={styles.addButton} 
        onPress={handleAddAddress}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add New Address</Text>
      </TouchableOpacity>

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
                value={currentAddress?.name}
                onChangeText={(text) => setCurrentAddress({...currentAddress, name: text})}
                placeholder="Recipient's full name"
              />

              <Text style={styles.inputLabel}>Street Address</Text>
              <TextInput
                style={styles.input}
                value={currentAddress?.street}
                onChangeText={(text) => setCurrentAddress({...currentAddress, street: text})}
                placeholder="House/Unit #, Building, Street name"
              />

              <Text style={styles.inputLabel}>City</Text>
              <TextInput
                style={styles.input}
                value={currentAddress?.city}
                onChangeText={(text) => setCurrentAddress({...currentAddress, city: text})}
                placeholder="City"
              />

              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>State/Province</Text>
                  <TextInput
                    style={styles.input}
                    value={currentAddress?.state}
                    onChangeText={(text) => setCurrentAddress({...currentAddress, state: text})}
                    placeholder="State/Province"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>ZIP Code</Text>
                  <TextInput
                    style={styles.input}
                    value={currentAddress?.zipCode}
                    onChangeText={(text) => setCurrentAddress({...currentAddress, zipCode: text})}
                    placeholder="ZIP Code"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Country</Text>
              <TextInput
                style={styles.input}
                value={currentAddress?.country}
                onChangeText={(text) => setCurrentAddress({...currentAddress, country: text})}
                placeholder="Country"
              />

              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={currentAddress?.phone}
                onChangeText={(text) => setCurrentAddress({...currentAddress, phone: text})}
                placeholder="Contact phone number"
                keyboardType="phone-pad"
              />

              <View style={styles.defaultContainer}>
                <TouchableOpacity 
                  style={styles.checkboxContainer}
                  onPress={() => setCurrentAddress({
                    ...currentAddress, 
                    isDefault: !currentAddress.isDefault
                  })}
                >
                  <View style={[
                    styles.checkbox,
                    currentAddress?.isDefault && styles.checkboxSelected
                  ]}>
                    {currentAddress?.isDefault && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>Set as default address</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveAddress}
            >
              <Text style={styles.saveButtonText}>Save Address</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  rightPlaceholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  defaultBadge: {
    backgroundColor: '#e6f7ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  defaultText: {
    fontSize: 12,
    color: '#0070f3',
    fontWeight: '500',
  },
  addressActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 12,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  addressLine: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  phoneNumber: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  setDefaultButton: {
    marginTop: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#FF385C',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  setDefaultText: {
    color: '#FF385C',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#FF385C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 8,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    padding: 4,
  },
  formContainer: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    fontSize: 16,
    marginBottom: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeOption: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    marginRight: 8,
    borderRadius: 8,
  },
  typeOptionSelected: {
    borderColor: '#FF385C',
    backgroundColor: '#fff3f3',
  },
  typeText: {
    fontSize: 14,
    color: '#666',
  },
  typeTextSelected: {
    color: '#FF385C',
    fontWeight: '500',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  defaultContainer: {
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#FF385C',
    borderColor: '#FF385C',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#FF385C',
    padding: 16,
    alignItems: 'center',
    margin: 16,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MyAddresses; 