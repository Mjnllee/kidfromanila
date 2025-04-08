import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';

const HelpSupport = ({ navigation }) => {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const faqs = [
    {
      id: '1',
      question: 'How do I track my order?',
      answer: 'You can track your order by going to "My Orders" in your profile and selecting the order you want to track. You will be able to see the current status and location of your package.'
    },
    {
      id: '2',
      question: 'What payment methods do you accept?',
      answer: 'We accept credit/debit cards, cash on delivery (COD), and bank transfers. You can manage your payment methods in the "Payment Methods" section of your profile.'
    },
    {
      id: '3',
      question: 'How do I schedule a service appointment?',
      answer: 'You can schedule a service appointment by going to the "Book a Service" tab in the app. Select the service you need, choose your preferred date and time, and provide any additional details.'
    },
    {
      id: '4',
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for most items. Products must be in original condition with all packaging. Some exceptions apply for certain items. Please contact our support team for specific return instructions.'
    },
    {
      id: '5',
      question: 'How do I change my delivery address?',
      answer: 'You can update your delivery address by going to "My Addresses" in your profile. You can add a new address, edit existing ones, or set a default address for future orders.'
    }
  ];
  
  const contactOptions = [
    {
      id: '1',
      title: 'Call Us',
      description: 'Speak to our customer service',
      icon: <FontAwesome name="phone" size={24} color="#e30613" />,
      action: () => Linking.openURL('tel:+639123456789')
    },
    {
      id: '2',
      title: 'Email',
      description: 'Send us an email',
      icon: <MaterialIcons name="email" size={24} color="#e30613" />,
      action: () => Linking.openURL('mailto:support@kidmanila.com')
    },
    {
      id: '3',
      title: 'WhatsApp',
      description: 'Chat with us on WhatsApp',
      icon: <FontAwesome name="whatsapp" size={24} color="#e30613" />,
      action: () => Linking.openURL('https://wa.me/639123456789')
    },
    {
      id: '4',
      title: 'Facebook Messenger',
      description: 'Message us on Facebook',
      icon: <FontAwesome name="facebook-square" size={24} color="#e30613" />,
      action: () => Linking.openURL('https://m.me/kidmanila')
    }
  ];
  
  const toggleFaq = (id) => {
    if (expandedFaq === id) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(id);
    }
  };
  
  const filteredFaqs = searchQuery.length > 0
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for answers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => (
              <TouchableOpacity 
                key={faq.id} 
                style={styles.faqItem}
                onPress={() => toggleFaq(faq.id)}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Ionicons 
                    name={expandedFaq === faq.id ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#666"
                  />
                </View>
                
                {expandedFaq === faq.id && (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noResultsContainer}>
              <Ionicons name="search-outline" size={48} color="#ccc" />
              <Text style={styles.noResultsText}>No results found</Text>
              <Text style={styles.noResultsDescription}>
                Try using different keywords or browse our FAQ section below
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.sectionDescription}>
            Still need help? Reach out to our support team.
          </Text>
          
          <View style={styles.contactGrid}>
            {contactOptions.map((option) => (
              <TouchableOpacity 
                key={option.id} 
                style={styles.contactCard}
                onPress={option.action}
              >
                <View style={styles.contactIcon}>
                  {option.icon}
                </View>
                <Text style={styles.contactTitle}>{option.title}</Text>
                <Text style={styles.contactDescription}>{option.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.businessHours}>
          <Text style={styles.businessHoursTitle}>Business Hours</Text>
          <Text style={styles.businessHoursText}>Monday - Friday: 9:00 AM - 6:00 PM</Text>
          <Text style={styles.businessHoursText}>Saturday: 9:00 AM - 5:00 PM</Text>
          <Text style={styles.businessHoursText}>Sunday: Closed</Text>
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
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e1e1e',
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  faqItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e1e1e',
    flex: 1,
    paddingRight: 10,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    lineHeight: 20,
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 5,
  },
  noResultsDescription: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  contactCard: {
    width: '50%',
    padding: 5,
  },
  contactCardInner: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffeaeb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e1e1e',
    marginVertical: 5,
  },
  contactDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  businessHours: {
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
  businessHoursTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e1e1e',
    marginBottom: 10,
  },
  businessHoursText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});

export default HelpSupport; 