import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const ServiceFormModal = ({ visible, onClose, service }) => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    date: new Date(),
    notes: '',
    customService: '',
    customPrice: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const isCustomService = service?.title === 'Others';

  const handleSubmit = async () => {
    if (isCustomService && (!formData.customService || !formData.customPrice)) {
      alert('Please fill in the custom service details');
      return;
    }
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 2000);
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      setShowTimePicker(true);
    }
    if (selectedDate) {
      setFormData(prev => ({ ...prev, date: selectedDate }));
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDateTime = new Date(formData.date);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      setFormData(prev => ({ ...prev, date: newDateTime }));
    }
  };

  if (success) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.centeredView}>
          <View style={styles.successModal}>
            <Text style={styles.successText}>Booking Successful!</Text>
            <Text style={styles.successSubtext}>We'll contact you shortly.</Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>
              Book {isCustomService ? 'Custom Service' : service?.title}
            </Text>
            {!isCustomService && (
              <Text style={styles.priceText}>
                {service?.price}{service?.priceUnit ? ` ${service?.priceUnit}` : ''}
              </Text>
            )}

            {isCustomService && (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Service Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter service name"
                    value={formData.customService}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, customService: text }))}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Service Price</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter price (₱)"
                    keyboardType="numeric"
                    value={formData.customPrice}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, customPrice: text }))}
                  />
                </View>
              </>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Contact Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter contact number"
                keyboardType="phone-pad"
                value={formData.contact}
                onChangeText={(text) => setFormData(prev => ({ ...prev, contact: text }))}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Preferred Date/Time</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {formData.date.toLocaleString()}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Additional Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Any special requests or notes"
                multiline
                numberOfLines={4}
                value={formData.notes}
                onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
              />
            </View>

            {(showDatePicker || showTimePicker) && Platform.OS === 'android' && (
              <DateTimePicker
                value={formData.date}
                mode={showDatePicker ? 'date' : 'time'}
                is24Hour={true}
                onChange={showDatePicker ? handleDateChange : handleTimeChange}
              />
            )}

            {Platform.OS === 'ios' && showDatePicker && (
              <DateTimePicker
                value={formData.date}
                mode="datetime"
                is24Hour={true}
                onChange={handleDateChange}
              />
            )}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.buttonText, styles.submitButtonText]}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  priceText: {
    fontSize: 18,
    color: '#FF0000',
    marginBottom: 20,
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f8f8',
  },
  submitButton: {
    backgroundColor: '#000',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButtonText: {
    color: '#000',
  },
  submitButtonText: {
    color: '#fff',
  },
  successModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00C853',
    marginBottom: 8,
  },
  successSubtext: {
    fontSize: 16,
    color: '#666',
  },
});

export default ServiceFormModal; 