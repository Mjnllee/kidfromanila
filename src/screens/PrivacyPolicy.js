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

const PrivacyPolicy = ({ navigation }) => {
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
        <Text style={styles.headerTitle}>Privacy Policy & Terms</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Policy</Text>
          <Text style={styles.lastUpdated}>Last updated: August 10, 2023</Text>
          
          <Text style={styles.paragraph}>
            At KidManila, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
            disclose, and safeguard your information when you use our mobile application and services.
          </Text>
          
          <Text style={styles.subheading}>Information We Collect</Text>
          <Text style={styles.paragraph}>
            We may collect personal information that you voluntarily provide when using our application, including:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Personal identifiers (name, email address, phone number)</Text>
            <Text style={styles.bulletItem}>• Account credentials</Text>
            <Text style={styles.bulletItem}>• Payment information</Text>
            <Text style={styles.bulletItem}>• Delivery address details</Text>
            <Text style={styles.bulletItem}>• Service appointment information</Text>
          </View>
          
          <Text style={styles.subheading}>How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use the information we collect to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Provide, maintain, and improve our services</Text>
            <Text style={styles.bulletItem}>• Process transactions and send related information</Text>
            <Text style={styles.bulletItem}>• Send notifications related to your account or purchases</Text>
            <Text style={styles.bulletItem}>• Respond to your comments and questions</Text>
            <Text style={styles.bulletItem}>• Monitor and analyze trends, usage, and activities</Text>
          </View>
          
          <Text style={styles.subheading}>Sharing of Information</Text>
          <Text style={styles.paragraph}>
            We may share your information with:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Service providers who perform services on our behalf</Text>
            <Text style={styles.bulletItem}>• Partners for marketing purposes (with your consent)</Text>
            <Text style={styles.bulletItem}>• Legal authorities when required by law</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms & Conditions</Text>
          <Text style={styles.lastUpdated}>Last updated: August 10, 2023</Text>
          
          <Text style={styles.paragraph}>
            By downloading or using our application, you agree to be bound by these Terms and Conditions. 
            If you disagree with any part of these terms, you do not have permission to access the application.
          </Text>
          
          <Text style={styles.subheading}>User Accounts</Text>
          <Text style={styles.paragraph}>
            When you create an account with us, you guarantee that the information you provide is accurate, 
            complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in 
            immediate termination of your account.
          </Text>
          
          <Text style={styles.subheading}>Ordering & Payment</Text>
          <Text style={styles.paragraph}>
            All orders are subject to availability and confirmation of the order price. Payment for all orders 
            must be made by credit or debit card or other payment methods available on the application. By placing 
            an order, you warrant that you possess the legal right to use the payment method provided.
          </Text>
          
          <Text style={styles.subheading}>Service Appointments</Text>
          <Text style={styles.paragraph}>
            Service appointments are subject to availability. We reserve the right to reschedule or cancel 
            appointments as necessary. A cancellation fee may apply for appointments canceled with less than 
            24 hours' notice.
          </Text>
          
          <Text style={styles.subheading}>Returns & Refunds</Text>
          <Text style={styles.paragraph}>
            Our return and refund policy varies by product category. Generally, items can be returned within 
            7 days of delivery if they are unused and in their original packaging. Services are non-refundable 
            once rendered.
          </Text>
          
          <Text style={styles.subheading}>Intellectual Property</Text>
          <Text style={styles.paragraph}>
            The application and its original content, features, and functionality are owned by KidManila and 
            are protected by international copyright, trademark, patent, trade secret, and other intellectual 
            property laws.
          </Text>
          
          <Text style={styles.subheading}>Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            In no event shall KidManila, nor its directors, employees, partners, agents, suppliers, or affiliates, 
            be liable for any indirect, incidental, special, consequential or punitive damages, including without 
            limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access 
            to or use of or inability to access or use the application.
          </Text>
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms and Privacy Policy, please contact us at:
          </Text>
          <Text style={styles.contactInfo}>Email: privacy@kidmanila.com</Text>
          <Text style={styles.contactInfo}>Phone: +63 2 8888 9999</Text>
          <Text style={styles.contactInfo}>Address: 123 Main Street, Makati City, Philippines</Text>
        </View>
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
    paddingBottom: 30,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e1e1e',
    marginBottom: 5,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
  },
  subheading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e1e1e',
    marginTop: 15,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: '#444',
    marginBottom: 10,
  },
  bulletList: {
    marginLeft: 5,
    marginBottom: 15,
  },
  bulletItem: {
    fontSize: 14,
    lineHeight: 22,
    color: '#444',
    marginBottom: 5,
  },
  contactSection: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e1e1e',
    marginBottom: 10,
  },
  contactInfo: {
    fontSize: 14,
    lineHeight: 22,
    color: '#444',
    marginBottom: 5,
  },
});

export default PrivacyPolicy; 