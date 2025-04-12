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
  KeyboardAvoidingView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Header from '../components/Header';
import { db } from '../config/firebase';
import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { useIsFocused } from '@react-navigation/native';  // Importing useIsFocused

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
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [motorcycleBrand, setMotorcycleBrand] = useState('');
  const [motorcycleModel, setMotorcycleModel] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');

  const isFocused = useIsFocused();  // Detect if the screen is focused

  useEffect(() => {
    fetchAvailableServices();
  }, []);

  useEffect(() => {
    if (!isFocused) {
      setSelectedService(null); // Reset selectedService when navigating away
    }
  }, [isFocused]);  // When the screen focus changes

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
  const submitServiceAppointment = async () => {
    // Validation for empty fields
    if (
      !selectedService ||
      !fullName.trim() ||
      !contactNumber.trim() ||
      !motorcycleBrand.trim() ||
      !motorcycleModel.trim() ||
      !plateNumber.trim() ||
      !preferredDate.trim() ||
      !preferredTime.trim() ||
      (selectedService.name === 'Others' && !customDetails.trim())
    ) {
      Alert.alert('Error', 'All fields are required');
      return { success: false };
    }
  
    const appointmentData = {
      serviceName: selectedService,
      isCustom: selectedService === 'Others',
      customDetails: customDetails || '',
      fullName: fullName,
      contactNumber: contactNumber,
      motorcycleBrand: motorcycleBrand,
      motorcycleModel: motorcycleModel,
      plateNumber: plateNumber,
      preferredDate: preferredDate,
      preferredTime: preferredTime,
      createdAt: serverTimestamp(),
    };
  
    try {
      const docRef = await addDoc(collection(db, 'appointments'), appointmentData);
      console.log('Appointment booked with ID:', docRef.id);
      Alert.alert('Success', 'Your appointment has been booked!');
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error saving appointment:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      return { success: false, error };
    }
  };

  return (
    <KeyboardAvoidingView
      behavior="height"
      style={{flex: 1}}

    >
    <View style={styles.container}>
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
            <Text style={styles.formTitle}>Service: {selectedService.name}</Text>

            {/* Type of Service* Label and Input for 'Others' service */}
            {selectedService.name === 'Others' && (
              <>
                <Text style={styles.label}>Type of Service*</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Specify the service you need"
                  value={customDetails}
                  onChangeText={setCustomDetails}
                />
              </>
            )}

            {/* Full Name */}
            <Text style={styles.label}>Full Name*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
            />

            {/* Contact Number */}
            <Text style={styles.label}>Phone Number*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              value={contactNumber}
              onChangeText={setContactNumber}
            />

            {/* Motorcycle Brand */}
            <Text style={styles.label}>Motorcycle Brand*</Text>
            <TextInput
              style={styles.input}
              placeholder="Honda, Yamaha, etc."
              value={motorcycleBrand}
              onChangeText={setMotorcycleBrand}
            />

            {/* Motorcycle Model */}
            <Text style={styles.label}>Motorcycle Model*</Text>
            <TextInput
              style={styles.input}
              placeholder="CBR 150, MT-15, etc."
              value={motorcycleModel}
              onChangeText={setMotorcycleModel}
            />

            {/* Plate Number */}
            <Text style={styles.label}>Plate Number*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter plate number"
              value={plateNumber}
              onChangeText={setPlateNumber}
            />

            {/* Preferred Date and Time */}
            <View style={styles.dateTimeContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Preferred Date*</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Select date"
                  value={preferredDate}
                  onChangeText={setPreferredDate}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Preferred Time*</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Select time"
                  value={preferredTime}
                  onChangeText={setPreferredTime}
                />
              </View>
            </View>

            {/* Additional Notes */}
            <Text style={styles.label}>Any special requests or details we should know?</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any special requests or details?"
              multiline
              numberOfLines={4}
              value={customDetails}
              onChangeText={setCustomDetails}
            />

            <TouchableOpacity onPress={submitServiceAppointment} style={styles.submitButton}>
              <Text style={styles.submitButtonText}>Confirm Booking</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
    </KeyboardAvoidingView>
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
    paddingBottom: 12,
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  textArea: {
    height: 100, // Adjust the height as needed
    textAlignVertical: 'top', // Ensures the text starts from the top of the text area
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  inputContainer: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#E50000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Appointment;
