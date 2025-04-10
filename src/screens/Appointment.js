import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Header from '../components/Header';
import { db } from '../config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const standardServices = [
  { id: 'std1', name: 'Wheel balance', price: '500' },
  { id: 'std2', name: 'Tire weight', price: '100 per gram' },
  { id: 'std3', name: 'Change oil', price: '300' },
  { id: 'std4', name: 'Caliper service', price: '100 per caliper' },
  { id: 'std5', name: 'Chain service', price: '250' },
  { id: 'std6', name: 'Others', price: 'Custom' },
];

const ServiceCard = ({ title, price, onPress }) => (
  <TouchableOpacity style={styles.serviceCard} onPress={onPress}>
    <Text style={styles.serviceTitle}>{title}</Text>
    <Text style={styles.servicePrice}>₱{price}</Text>
  </TouchableOpacity>
);

const Appointment = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [customDetails, setCustomDetails] = useState('');

  useEffect(() => {
    fetchAvailableServices();
  }, []);

  const fetchAvailableServices = async () => {
    try {
      setLoading(true);
      const servicesRef = collection(db, 'services');
      const q = query(servicesRef, where('isAvailable', '==', true));
      const snapshot = await getDocs(q);
      const availableServices = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      const combined = [...availableServices, ...standardServices];
      setServices(combined);
    } catch (error) {
      console.error('Error fetching services:', error);
      Alert.alert('Error', 'Failed to load services.');
    } finally {
      setLoading(false);
    }
  };

  const handleServicePress = (service) => {
    setSelectedService(service);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Header title="Book a Service" />

      <ScrollView style={styles.scrollView}>
        <Text style={styles.sectionTitle}>Select a Service</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E50000" />
            <Text style={styles.loadingText}>Loading services...</Text>
          </View>
        ) : services.length > 0 ? (
          <View style={styles.serviceList}>
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                title={service.name}
                price={service.price}
                onPress={() => handleServicePress(service)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No services available.</Text>
          </View>
        )}

        {selectedService && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Booking for: {selectedService.name}</Text>

            {selectedService.name === 'Others' && (
              <TextInput
                style={styles.input}
                placeholder="Describe your request..."
                value={customDetails}
                onChangeText={setCustomDetails}
              />
            )}

            <TextInput style={styles.input} placeholder="Full Name*" />
            <TextInput style={styles.input} placeholder="Contact Number*" keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder="Motorcycle Brand*" />
            <TextInput style={styles.input} placeholder="Motorcycle Model*" />
            <TextInput style={styles.input} placeholder="Plate Number*" />
            <TextInput style={styles.input} placeholder="Preferred Date*" />
            <TextInput style={styles.input} placeholder="Preferred Time*" />
            <TextInput style={styles.input} placeholder="Additional Notes" multiline />

            <TouchableOpacity style={styles.submitButton}>
              <Text style={styles.submitButtonText}>Confirm Booking</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  scrollView: { flex: 1, padding: 20 },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  serviceList: { gap: 12 },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceTitle: { fontSize: 16, color: '#000', fontWeight: '500' },
  servicePrice: { fontSize: 16, color: '#FF0000', fontWeight: '500' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 },
  emptyText: { fontSize: 16, color: '#666', textAlign: 'center' },
  formContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 4,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#E50000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Appointment;