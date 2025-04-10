import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const ServiceForm = ({ route, navigation }) => {
  // Get service data if editing an existing one
  const existingService = route.params?.service;
  const isEditing = !!existingService;
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Populate form if editing
  useEffect(() => {
    if (isEditing) {
      setName(existingService.name || '');
      setDescription(existingService.description || '');
      setPrice(existingService.price ? existingService.price.toString() : '');
      setDuration(existingService.duration ? existingService.duration.toString() : '');
      setCategory(existingService.category || '');
      setIsAvailable(existingService.isAvailable !== undefined ? existingService.isAvailable : true);
    }
  }, [isEditing, existingService]);
  
  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Service name is required');
      return false;
    }
    
    if (!price.trim() || isNaN(Number(price))) {
      Alert.alert('Error', 'Please enter a valid price');
      return false;
    }
    
    if (!duration.trim() || isNaN(Number(duration))) {
      Alert.alert('Error', 'Please enter a valid duration in minutes');
      return false;
    }
    
    return true;
  };
  
  const saveService = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const serviceData = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        duration: Number(duration),
        category: category.trim(),
        isAvailable,
        updatedAt: new Date().toISOString(),
      };
      
      // Firebase operations
      if (isEditing) {
        // Update existing service
        await setDoc(doc(db, 'services', existingService.id), 
          serviceData, 
          { merge: true }
        );
      } else {
        // Add new service
        serviceData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'services'), serviceData);
      }
      
      setLoading(false);
      Alert.alert(
        'Success', 
        `Service ${isEditing ? 'updated' : 'added'} successfully`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      
    } catch (error) {
      console.error('Error saving service:', error);
      setLoading(false);
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'add'} service. Please try again.`);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Service' : 'Add New Service'}
        </Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.formContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Service Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter service name"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter service description"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="e.g., Maintenance, Repair, etc."
          />
        </View>
        
        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Price (₱) *</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
          </View>
          
          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Duration (mins) *</Text>
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              placeholder="30"
              keyboardType="number-pad"
            />
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Available for Booking</Text>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: '#ccc', true: '#E50000' }}
              thumbColor="#fff"
            />
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={saveService}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Update Service' : 'Add Service'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
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
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  saveButton: {
    backgroundColor: '#E50000',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ServiceForm; 