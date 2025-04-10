import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

// Available brands for tire products
const BRANDS = [
  { label: 'Select a brand', value: '' },
  { label: 'Shinko', value: 'Shinko' },
  { label: 'Pirelli', value: 'Pirelli' },
  { label: 'Motozo', value: 'Motozo' },
  { label: 'Eurogrip', value: 'Eurogrip' },
  { label: 'Michelin', value: 'Michelin' },
];

const ProductForm = ({ route, navigation }) => {
  // Get product data if editing an existing product
  const existingProduct = route.params?.product;
  const isEditMode = !!existingProduct;

  // Form state
  const [productData, setProductData] = useState({
    name: '',
    brand: '',
    description: '',
    imageUrl: '',
    sizes: []
  });
  
  // New size input state
  const [newSize, setNewSize] = useState({ size: '', price: '', stock: '0' });
  
  // Loading state
  const [loading, setLoading] = useState(false);
  // Form validation errors
  const [errors, setErrors] = useState({});

  // Load product data if in edit mode
  useEffect(() => {
    if (isEditMode && existingProduct) {
      setProductData({
        name: existingProduct.name || '',
        brand: existingProduct.brand || '',
        description: existingProduct.description || '',
        imageUrl: existingProduct.imageUrl || '',
        sizes: existingProduct.sizes ? existingProduct.sizes.map(size => ({
          ...size,
          stock: size.stock !== undefined ? size.stock : 0 // Add stock field if it doesn't exist
        })) : [],
      });
    }
  }, [isEditMode, existingProduct]);

  // Image picker function
  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setProductData({ ...productData, imageUrl: base64Image });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  // Add a new size and price
  const addSize = () => {
    // Validate size input
    if (!newSize.size.trim()) {
      setErrors({ ...errors, size: 'Size is required' });
      return;
    }
    
    // Validate price input
    if (!newSize.price.trim()) {
      setErrors({ ...errors, price: 'Price is required' });
      return;
    }
    
    const price = parseFloat(newSize.price);
    if (isNaN(price) || price <= 0) {
      setErrors({ ...errors, price: 'Price must be a positive number' });
      return;
    }
    
    // Validate stock input
    const stock = parseInt(newSize.stock);
    if (isNaN(stock) || stock < 0) {
      setErrors({ ...errors, stock: 'Stock must be a non-negative number' });
      return;
    }
    
    // Add size to the product data
    const newSizes = [...productData.sizes, {
      size: newSize.size.trim(),
      price: price,
      stock: stock
    }];
    
    setProductData({ ...productData, sizes: newSizes });
    setNewSize({ size: '', price: '', stock: '0' });
    setErrors({});
  };

  // Remove a size
  const removeSize = (index) => {
    const newSizes = [...productData.sizes];
    newSizes.splice(index, 1);
    setProductData({ ...productData, sizes: newSizes });
  };

  // Validate the form
  const validateForm = () => {
    const newErrors = {};
    
    if (!productData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!productData.brand) {
      newErrors.brand = 'Brand is required';
    }
    
    if (!productData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (productData.sizes.length === 0) {
      newErrors.sizes = 'At least one size and price is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save the product to Firestore
  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        setLoading(true);
        
        const productToSave = {
          name: productData.name.trim(),
          brand: productData.brand,
          description: productData.description.trim(),
          imageUrl: productData.imageUrl,
          sizes: productData.sizes,
          updatedAt: new Date().toISOString(),
        };
        
        if (!isEditMode) {
          // Add creation date for new products
          productToSave.createdAt = new Date().toISOString();
          
          // Create new product
          await addDoc(collection(db, 'products'), productToSave);
          Alert.alert('Success', 'Product created successfully');
        } else {
          // Update existing product
          const productRef = doc(db, 'products', existingProduct.id);
          await updateDoc(productRef, productToSave);
          Alert.alert('Success', 'Product updated successfully');
        }
        
        navigation.goBack();
      } catch (error) {
        console.error('Error saving product:', error);
        Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'create'} product`);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.scrollContainer}>
          <View style={styles.formContainer}>
            {/* Product Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Product Name</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={productData.name}
                onChangeText={(text) => setProductData({...productData, name: text})}
                placeholder="Enter product name"
                placeholderTextColor="#999"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Brand Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Brand</Text>
              <View style={[styles.pickerContainer, errors.brand && styles.inputError]}>
                <Picker
                  selectedValue={productData.brand}
                  onValueChange={(value) => setProductData({...productData, brand: value})}
                  style={styles.picker}
                >
                  {BRANDS.map((brand) => (
                    <Picker.Item 
                      key={brand.value} 
                      label={brand.label} 
                      value={brand.value} 
                    />
                  ))}
                </Picker>
              </View>
              {errors.brand && <Text style={styles.errorText}>{errors.brand}</Text>}
            </View>

            {/* Product Image */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Product Image</Text>
              <TouchableOpacity 
                style={styles.imagePickerContainer}
                onPress={pickImage}
              >
                {productData.imageUrl ? (
                  <Image source={{ uri: productData.imageUrl }} style={styles.productImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera" size={40} color="#999" />
                    <Text style={styles.imagePlaceholderText}>Tap to select an image</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Product Description */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.textArea, errors.description && styles.inputError]}
                value={productData.description}
                onChangeText={(text) => setProductData({...productData, description: text})}
                placeholder="Enter product description"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
            </View>

            {/* Sizes, Prices and Stock */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Sizes, Prices & Stock</Text>
              
              {productData.sizes.length > 0 ? (
                <View style={styles.sizesList}>
                  {productData.sizes.map((sizeItem, index) => (
                    <View key={index} style={styles.sizeItem}>
                      <View style={styles.sizeItemContent}>
                        <Text style={styles.sizeText}>
                          {sizeItem.size} - ₱{sizeItem.price}
                        </Text>
                        <Text style={styles.stockText}>
                          Stock: {sizeItem.stock || 0}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.removeSizeButton}
                        onPress={() => removeSize(index)}
                      >
                        <Ionicons name="close-circle" size={22} color="#F44336" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.noSizesContainer}>
                  <Text style={styles.noSizesText}>No sizes added yet</Text>
                </View>
              )}

              {errors.sizes && <Text style={styles.errorText}>{errors.sizes}</Text>}
              
              <View style={styles.addSizeContainer}>
                <TextInput
                  style={[styles.sizeInput, errors.size && styles.inputError]}
                  value={newSize.size}
                  onChangeText={(text) => setNewSize({...newSize, size: text})}
                  placeholder="Size (e.g. 120/70-17)"
                  placeholderTextColor="#999"
                />
                <TextInput
                  style={[styles.priceInput, errors.price && styles.inputError]}
                  value={newSize.price}
                  onChangeText={(text) => setNewSize({...newSize, price: text})}
                  placeholder="Price"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.stockInput, errors.stock && styles.inputError]}
                  value={newSize.stock}
                  onChangeText={(text) => setNewSize({...newSize, stock: text})}
                  placeholder="Stock"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.addSizeButton}
                  onPress={addSize}
                >
                  <Ionicons name="add" size={22} color="white" />
                </TouchableOpacity>
              </View>
              {errors.size && <Text style={styles.errorText}>{errors.size}</Text>}
              {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
              {errors.stock && <Text style={styles.errorText}>{errors.stock}</Text>}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isEditMode ? 'Update Product' : 'Save Product'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  keyboardAvoidContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
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
  scrollContainer: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    backgroundColor: 'white',
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingTop: 12,
    fontSize: 16,
    color: '#333',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  imagePickerContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
    height: 200,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: '#999',
    fontSize: 14,
  },
  sizesList: {
    marginBottom: 10,
  },
  sizeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sizeItemContent: {
    flex: 1,
  },
  sizeText: {
    fontSize: 16,
    color: '#333',
  },
  stockText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  removeSizeButton: {
    padding: 4,
  },
  noSizesContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  noSizesText: {
    color: '#999',
    fontSize: 14,
  },
  addSizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sizeInput: {
    flex: 1.2,
    backgroundColor: 'white',
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  priceInput: {
    flex: 0.8,
    backgroundColor: 'white',
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  stockInput: {
    flex: 0.6,
    backgroundColor: 'white',
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  addSizeButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputError: {
    borderColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#E50000',
    borderRadius: 8,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ffcccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProductForm; 