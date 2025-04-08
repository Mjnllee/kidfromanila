import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Header from '../components/Header';
import ServiceFormModal from '../components/ServiceFormModal';

const services = [
  {
    id: '1',
    title: 'Wheel balance',
    price: '₱500',
  },
  {
    id: '2',
    title: 'Tire weight',
    price: '₱100',
    priceUnit: 'per gram',
  },
  {
    id: '3',
    title: 'Change oil',
    price: '₱300',
  },
  {
    id: '4',
    title: 'Caliper service',
    price: '₱100',
    priceUnit: 'per caliper',
  },
  {
    id: '5',
    title: 'Chain service',
    price: '₱250',
  },
  {
    id: '6',
    title: 'Others',
    price: 'Custom',
  },
];

// Service Card Component
const ServiceCard = ({ title, price, priceUnit, onPress }) => (
  <TouchableOpacity style={styles.serviceCard} onPress={onPress}>
    <Text style={styles.serviceTitle}>{title}</Text>
    <Text style={styles.servicePrice}>
      {price}{priceUnit ? ` ${priceUnit}` : ''}
    </Text>
  </TouchableOpacity>
);

const Appointment = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleServicePress = (service) => {
    setSelectedService(service);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedService(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Header title="Book a Service" />
      
      <ScrollView style={styles.scrollView}>
        <Text style={styles.sectionTitle}>Select a Service</Text>
        <View style={styles.serviceList}>
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              title={service.title}
              price={service.price}
              priceUnit={service.priceUnit}
              onPress={() => handleServicePress(service)}
            />
          ))}
        </View>
      </ScrollView>

      <ServiceFormModal
        visible={modalVisible}
        onClose={handleCloseModal}
        service={selectedService}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  serviceList: {
    gap: 12,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceTitle: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  servicePrice: {
    fontSize: 16,
    color: '#FF0000',
    fontWeight: '500',
  },
});

export default Appointment; 