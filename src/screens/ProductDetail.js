import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc, setDoc, collection, addDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../config/firebase';

const ProductDetail = ({ route, navigation }) => {
  const { product } = route.params;
  const { user } = useAuth();
  
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  // Find the selected size object
  const selectedSizeObject = selectedSize 
    ? product.sizes.find(s => s.size === selectedSize) 
    : null;

  // Calculate the total price
  const totalPrice = selectedSizeObject ? selectedSizeObject.price * quantity : 0;

  // Handle quantity change
  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Handle add to cart
  const addToCart = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to add items to your cart.');
      navigation.navigate('Login');
      return;
    }
    
    if (!selectedSize) {
      Alert.alert('Size Required', 'Please select a size before adding to cart.');
      return;
    }

    try {
      setLoading(true);
      
      // Reference to the user's cart
      const cartRef = doc(db, 'carts', user.id);
      
      // Get the current cart
      const cartDoc = await getDoc(cartRef);
      
      if (cartDoc.exists()) {
        // Cart exists, check if item already exists
        const cartData = cartDoc.data();
        const items = cartData.items || [];
        
        // Check if same product and size already in cart
        const existingItemIndex = items.findIndex(
          item => item.productId === product.id && item.size === selectedSize
        );
        
        if (existingItemIndex !== -1) {
          // Update existing item quantity
          items[existingItemIndex].quantity += quantity;
          
          await updateDoc(cartRef, {
            items: items,
            updatedAt: new Date().toISOString()
          });
        } else {
          // Add new item to cart
          await updateDoc(cartRef, {
            items: arrayUnion({
              productId: product.id,
              productName: product.name,
              brand: product.brand,
              size: selectedSize,
              price: selectedSizeObject.price,
              quantity: quantity,
              imageUrl: product.imageUrl || '',
              addedAt: new Date().toISOString()
            }),
            updatedAt: new Date().toISOString()
          });
        }
      } else {
        // Create new cart
        await setDoc(cartRef, {
          userId: user.id,
          items: [{
            productId: product.id,
            productName: product.name,
            brand: product.brand,
            size: selectedSize,
            price: selectedSizeObject.price,
            quantity: quantity,
            imageUrl: product.imageUrl || '',
            addedAt: new Date().toISOString()
          }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      Alert.alert(
        'Added to Cart', 
        `${product.name} (${selectedSize}) has been added to your cart.`,
        [
          {
            text: 'Continue Shopping',
            onPress: () => navigation.goBack(),
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {product.imageUrl ? (
            <Image 
              source={{ uri: product.imageUrl }} 
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.noImageContainer}>
              <Ionicons name="image-outline" size={80} color="#ccc" />
              <Text style={styles.noImageText}>No image available</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfoContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productBrand}>{product.brand}</Text>
          {selectedSizeObject && (
            <Text style={styles.productPrice}>₱{selectedSizeObject.price}</Text>
          )}
          
          <View style={styles.divider} />
          
          {/* Product Description */}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
          
          <View style={styles.divider} />
          
          {/* Size Selection */}
          <Text style={styles.sectionTitle}>Select Size</Text>
          <View style={styles.sizesContainer}>
            {product.sizes && product.sizes.map((sizeObj, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.sizeButton,
                  selectedSize === sizeObj.size && styles.selectedSizeButton
                ]}
                onPress={() => setSelectedSize(sizeObj.size)}
              >
                <Text 
                  style={[
                    styles.sizeButtonText,
                    selectedSize === sizeObj.size && styles.selectedSizeButtonText
                  ]}
                >
                  {sizeObj.size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Quantity */}
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={decreaseQuantity}
              disabled={quantity <= 1}
            >
              <Ionicons 
                name="remove" 
                size={20} 
                color={quantity <= 1 ? '#ccc' : '#333'} 
              />
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{quantity}</Text>
            
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={increaseQuantity}
            >
              <Ionicons name="add" size={20} color="#333" />
            </TouchableOpacity>
          </View>
          
          {/* Total */}
          {selectedSizeObject && (
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalPrice}>₱{totalPrice}</Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Add to Cart Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={addToCart}
          disabled={loading || !selectedSize}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="cart-outline" size={20} color="white" style={styles.cartIcon} />
              <Text style={styles.addToCartButtonText}>Add to Cart</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
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
  imageContainer: {
    backgroundColor: 'white',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  noImageText: {
    color: '#999',
    fontSize: 16,
    marginTop: 8,
  },
  productInfoContainer: {
    padding: 16,
    backgroundColor: 'white',
    marginTop: 8,
    borderRadius: 8,
    marginHorizontal: 8,
    marginBottom: 80, // Space for bottom button
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E50000',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  sizesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  sizeButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedSizeButton: {
    borderColor: '#E50000',
    backgroundColor: '#E50000',
  },
  sizeButtonText: {
    fontSize: 14,
    color: '#333',
  },
  selectedSizeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E50000',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addToCartButton: {
    flexDirection: 'row',
    backgroundColor: '#E50000',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartIcon: {
    marginRight: 8,
  },
  addToCartButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductDetail; 