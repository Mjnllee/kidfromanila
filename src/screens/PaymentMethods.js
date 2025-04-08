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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';

const PaymentMethods = ({ navigation }) => {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: '1',
      type: 'credit',
      cardNumber: '**** **** **** 4242',
      cardHolder: 'GUEST USER',
      expiryDate: '11/25',
      isDefault: true,
    }
  ]);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [newCard, setNewCard] = useState({
    type: 'credit',
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    isDefault: false,
  });

  const handleAddCard = () => {
    // Basic validation
    if (!newCard.cardNumber || !newCard.cardHolder || !newCard.expiryDate || !newCard.cvv) {
      alert('Please fill in all fields');
      return;
    }

    // Mask the card number for display
    const lastFour = newCard.cardNumber.slice(-4);
    const maskedNumber = `**** **** **** ${lastFour}`;

    // Create a new card with a unique ID
    const newCardWithId = {
      ...newCard,
      id: Date.now().toString(),
      cardNumber: maskedNumber,
    };

    // Remove CVV for security
    delete newCardWithId.cvv;

    // Update default card if needed
    let updatedCards = [...paymentMethods];
    if (newCard.isDefault) {
      updatedCards = updatedCards.map(card => ({
        ...card,
        isDefault: false,
      }));
    }

    // Add the new card
    setPaymentMethods([...updatedCards, newCardWithId]);
    
    // Reset form and close modal
    setNewCard({
      type: 'credit',
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: '',
      isDefault: false,
    });
    setModalVisible(false);
  };

  const handleRemoveCard = (id) => {
    // Prevent removing the last card if it's the default
    if (paymentMethods.length === 1 && paymentMethods[0].isDefault) {
      alert('You cannot remove your default payment method.');
      return;
    }
    
    const filteredCards = paymentMethods.filter(card => card.id !== id);
    
    // If we're removing the default card, make the first remaining card the default
    if (paymentMethods.find(card => card.id === id)?.isDefault && filteredCards.length > 0) {
      filteredCards[0].isDefault = true;
    }
    
    setPaymentMethods(filteredCards);
  };

  const handleSetDefaultCard = (id) => {
    const updatedCards = paymentMethods.map(card => ({
      ...card,
      isDefault: card.id === id,
    }));
    setPaymentMethods(updatedCards);
  };
  
  const formatCardNumber = (number) => {
    // Format in groups of 4
    return number.replace(/[^\d]/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiryDate = (text) => {
    // Format as MM/YY
    const cleanText = text.replace(/[^\d]/g, '');
    if (cleanText.length <= 2) return cleanText;
    return `${cleanText.slice(0, 2)}/${cleanText.slice(2, 4)}`;
  };

  const getCardIcon = (type) => {
    switch(type) {
      case 'credit':
        return <FontAwesome name="credit-card" size={24} color="#1976d2" />;
      case 'debit':
        return <FontAwesome name="credit-card" size={24} color="#4caf50" />;
      default:
        return <FontAwesome name="credit-card" size={24} color="#1e1e1e" />;
    }
  };

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
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {paymentMethods.map((card) => (
          <View key={card.id} style={styles.cardContainer}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTypeContainer}>
                {getCardIcon(card.type)}
                {card.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity 
                onPress={() => handleRemoveCard(card.id)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={20} color="#e30613" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.cardNumber}>{card.cardNumber}</Text>
            <View style={styles.cardDetails}>
              <View>
                <Text style={styles.cardLabel}>CARD HOLDER</Text>
                <Text style={styles.cardValue}>{card.cardHolder}</Text>
              </View>
              <View>
                <Text style={styles.cardLabel}>EXPIRES</Text>
                <Text style={styles.cardValue}>{card.expiryDate}</Text>
              </View>
            </View>
            
            {!card.isDefault && (
              <TouchableOpacity 
                style={styles.defaultButton}
                onPress={() => handleSetDefaultCard(card.id)}
              >
                <Text style={styles.defaultButtonText}>Set as Default</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={24} color="white" />
          <Text style={styles.addButtonText}>Add Payment Method</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Card Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Payment Method</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Card Type</Text>
                <View style={styles.typeSelector}>
                  <TouchableOpacity 
                    style={[
                      styles.typeOption, 
                      newCard.type === 'credit' && styles.typeOptionSelected
                    ]}
                    onPress={() => setNewCard({...newCard, type: 'credit'})}
                  >
                    <FontAwesome name="credit-card" size={20} color={newCard.type === 'credit' ? '#e30613' : '#666'} />
                    <Text style={[
                      styles.typeText,
                      newCard.type === 'credit' && styles.typeTextSelected
                    ]}>Credit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.typeOption, 
                      newCard.type === 'debit' && styles.typeOptionSelected
                    ]}
                    onPress={() => setNewCard({...newCard, type: 'debit'})}
                  >
                    <FontAwesome name="credit-card" size={20} color={newCard.type === 'debit' ? '#e30613' : '#666'} />
                    <Text style={[
                      styles.typeText,
                      newCard.type === 'debit' && styles.typeTextSelected
                    ]}>Debit</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Card Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  keyboardType="numeric"
                  maxLength={19} // 16 digits + 3 spaces
                  value={newCard.cardNumber}
                  onChangeText={(text) => setNewCard({
                    ...newCard, 
                    cardNumber: formatCardNumber(text)
                  })}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Card Holder Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="NAME ON CARD"
                  autoCapitalize="characters"
                  value={newCard.cardHolder}
                  onChangeText={(text) => setNewCard({
                    ...newCard, 
                    cardHolder: text.toUpperCase()
                  })}
                />
              </View>
              
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Expiry Date</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    keyboardType="numeric"
                    maxLength={5} // MM/YY format
                    value={newCard.expiryDate}
                    onChangeText={(text) => setNewCard({
                      ...newCard, 
                      expiryDate: formatExpiryDate(text)
                    })}
                  />
                </View>
                
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    keyboardType="numeric"
                    maxLength={3}
                    secureTextEntry={true}
                    value={newCard.cvv}
                    onChangeText={(text) => setNewCard({...newCard, cvv: text})}
                  />
                </View>
              </View>
              
              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setNewCard({...newCard, isDefault: !newCard.isDefault})}
                >
                  {newCard.isDefault ? (
                    <Ionicons name="checkbox" size={24} color="#e30613" />
                  ) : (
                    <Ionicons name="square-outline" size={24} color="#666" />
                  )}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>Set as default payment method</Text>
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleAddCard}
              >
                <Text style={styles.saveButtonText}>Save Card</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  cardContainer: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  defaultBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginLeft: 10,
  },
  defaultText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  deleteButton: {
    padding: 5,
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e1e1e',
    letterSpacing: 1,
    marginBottom: 15,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  defaultButton: {
    borderWidth: 1,
    borderColor: '#1e1e1e',
    borderRadius: 5,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  defaultButtonText: {
    fontSize: 14,
    color: '#1e1e1e',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#e30613',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginTop: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingBottom: 25,
    maxHeight: '90%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e1e1e',
  },
  modalBody: {
    padding: 15,
    maxHeight: '70%',
  },
  formGroup: {
    marginBottom: 15,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#1e1e1e',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  typeOptionSelected: {
    backgroundColor: '#ffeaeb',
    borderColor: '#e30613',
  },
  typeText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  typeTextSelected: {
    color: '#e30613',
    fontWeight: '500',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#1e1e1e',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#e30613',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default PaymentMethods; 