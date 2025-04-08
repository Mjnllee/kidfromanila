import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const ServiceHistory = ({ navigation }) => {
  // Empty placeholder service history array
  const serviceHistory = [];

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
        <Text style={styles.headerTitle}>Service History</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {serviceHistory.length > 0 ? (
          serviceHistory.map((service, index) => (
            <View key={index} style={styles.serviceCard}>
              {/* Service history details would go here */}
            </View>
          ))
        ) : (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="time-outline" size={80} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No Service History</Text>
            <Text style={styles.emptyStateDescription}>
              You haven't used any services yet. Completed services will appear here.
            </Text>
            <TouchableOpacity 
              style={styles.bookButton}
              onPress={() => navigation.navigate('MainTabs', { screen: 'AppointmentTab' })}
            >
              <Text style={styles.bookButtonText}>Book a Service</Text>
            </TouchableOpacity>
          </View>
        )}
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
    flexGrow: 1,
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginBottom: 30,
  },
  bookButton: {
    backgroundColor: '#e30613',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ServiceHistory; 