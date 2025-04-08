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

const TermsOfService = ({ navigation }) => {
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
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms of Service</Text>
          <Text style={styles.lastUpdated}>Last updated: August 10, 2023</Text>
          
          <Text style={styles.paragraph}>
            Welcome to KidManila. These Terms of Service ("Terms") govern your use of our mobile application
            and the services offered through it. By accessing or using our application, you agree to be bound
            by these Terms. Please read them carefully.
          </Text>
          
          <Text style={styles.subheading}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing or using our application, you acknowledge that you have read, understood, and agree to be
            bound by these Terms. If you do not agree to these Terms, you should not use our application or services.
          </Text>
          
          <Text style={styles.subheading}>2. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these Terms at any time. We will provide notice of significant changes by
            posting the updated Terms on our application with a new effective date. Your continued use of the application
            after such changes constitutes your acceptance of the new Terms.
          </Text>
          
          <Text style={styles.subheading}>3. User Accounts</Text>
          <Text style={styles.paragraph}>
            3.1. To use certain features of our application, you may need to create an account. You are responsible
            for maintaining the confidentiality of your account information and for all activities that occur under your account.
          </Text>
          <Text style={styles.paragraph}>
            3.2. You agree to provide accurate, current, and complete information during the registration process and to
            update such information to keep it accurate, current, and complete.
          </Text>
          <Text style={styles.paragraph}>
            3.3. We reserve the right to suspend or terminate your account if any information provided proves to be
            inaccurate, not current, or incomplete.
          </Text>
          
          <Text style={styles.subheading}>4. User Conduct</Text>
          <Text style={styles.paragraph}>
            You agree not to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Use our application for any illegal purpose</Text>
            <Text style={styles.bulletItem}>• Violate any applicable laws or regulations</Text>
            <Text style={styles.bulletItem}>• Impersonate any person or entity</Text>
            <Text style={styles.bulletItem}>• Interfere with the proper functioning of the application</Text>
            <Text style={styles.bulletItem}>• Attempt to gain unauthorized access to our systems</Text>
            <Text style={styles.bulletItem}>• Collect user information without consent</Text>
          </View>
          
          <Text style={styles.subheading}>5. Products and Services</Text>
          <Text style={styles.paragraph}>
            5.1. All products and services displayed on our application are subject to availability.
          </Text>
          <Text style={styles.paragraph}>
            5.2. We reserve the right to discontinue any product or service at any time.
          </Text>
          <Text style={styles.paragraph}>
            5.3. Prices for products and services may change without notice.
          </Text>
          
          <Text style={styles.subheading}>6. Ordering and Payment</Text>
          <Text style={styles.paragraph}>
            6.1. When placing an order, you agree to provide current, complete, and accurate purchase information.
          </Text>
          <Text style={styles.paragraph}>
            6.2. We reserve the right to refuse or cancel your order if fraud or an unauthorized transaction is suspected.
          </Text>
          <Text style={styles.paragraph}>
            6.3. Payment must be made at the time of ordering using the methods available in the application.
          </Text>
          
          <Text style={styles.subheading}>7. Service Appointments</Text>
          <Text style={styles.paragraph}>
            7.1. Service appointments are subject to availability of service providers.
          </Text>
          <Text style={styles.paragraph}>
            7.2. You must be present at the scheduled time and location for your appointment.
          </Text>
          <Text style={styles.paragraph}>
            7.3. Cancellation or rescheduling of appointments must be done at least 24 hours in advance to avoid
            cancellation fees.
          </Text>
          
          <Text style={styles.subheading}>8. Returns and Refunds</Text>
          <Text style={styles.paragraph}>
            8.1. Products may be returned within 7 days of delivery if they are unused and in their original packaging.
          </Text>
          <Text style={styles.paragraph}>
            8.2. Services are non-refundable once rendered.
          </Text>
          <Text style={styles.paragraph}>
            8.3. Refunds will be processed using the original method of payment.
          </Text>
          
          <Text style={styles.subheading}>9. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            9.1. All content, designs, graphics, logos, and service names are trademarks of KidManila or its licensors.
          </Text>
          <Text style={styles.paragraph}>
            9.2. You may not use, copy, reproduce, or modify any content from our application without our express
            written consent.
          </Text>
          
          <Text style={styles.subheading}>10. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            10.1. KidManila shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
          </Text>
          <Text style={styles.paragraph}>
            10.2. Our liability for any claim arising from these Terms shall not exceed the amount you paid to us in the
            three months preceding the claim.
          </Text>
          
          <Text style={styles.subheading}>11. Dispute Resolution</Text>
          <Text style={styles.paragraph}>
            11.1. Any disputes arising from these Terms shall be resolved through binding arbitration in accordance with
            the laws of the Philippines.
          </Text>
          <Text style={styles.paragraph}>
            11.2. The arbitration shall take place in Makati City, Philippines.
          </Text>
          
          <Text style={styles.subheading}>12. Termination</Text>
          <Text style={styles.paragraph}>
            We reserve the right to terminate or suspend your account and access to our application at our sole
            discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users,
            us, or third parties, or for any other reason.
          </Text>
          
          <Text style={styles.subheading}>13. Governing Law</Text>
          <Text style={styles.paragraph}>
            These Terms shall be governed by and construed in accordance with the laws of the Philippines, without
            regard to its conflict of law provisions.
          </Text>
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms of Service, please contact us at:
          </Text>
          <Text style={styles.contactInfo}>Email: terms@kidmanila.com</Text>
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

export default TermsOfService; 