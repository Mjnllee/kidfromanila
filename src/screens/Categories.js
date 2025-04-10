import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
  Modal,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const Categories = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter modal state
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [selectedBrands, setSelectedBrands] = useState({});
  const [applyingFilters, setApplyingFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      filterProducts();
    }
  }, [searchQuery, products, applyingFilters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsCollection = collection(db, 'products');
      const snapshot = await getDocs(productsCollection);
      
      if (snapshot.empty) {
        setProducts([]);
        setFilteredProducts([]);
        setLoading(false);
        return;
      }
      
      const productsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Extract unique brands for filter
      const uniqueBrands = [...new Set(productsList.map(product => product.brand).filter(Boolean))];
      setBrands(uniqueBrands);
      
      // Initialize selected brands state
      const initialSelectedBrands = {};
      uniqueBrands.forEach(brand => {
        initialSelectedBrands[brand] = false;
      });
      setSelectedBrands(initialSelectedBrands);
      
      setProducts(productsList);
      setFilteredProducts(productsList);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];
    
    // Apply brand filter if any brand is selected
    const selectedBrandsList = Object.keys(selectedBrands).filter(brand => selectedBrands[brand]);
    if (selectedBrandsList.length > 0) {
      filtered = filtered.filter(product => selectedBrandsList.includes(product.brand));
    }
    
    // Apply price range filter - only if product has sizes and prices
    if (priceRange.min > 0 || priceRange.max < 10000) {
      filtered = filtered.filter(product => {
        // Skip price filtering if product has no sizes or prices
        if (!product.sizes || product.sizes.length === 0) return true;
        
        // Check if any size's price falls within the range
        return product.sizes.some(size => {
          const price = parseFloat(size.price);
          return !isNaN(price) && price >= priceRange.min && price <= priceRange.max;
        });
      });
    }
    
    // Apply search query filter
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name?.toLowerCase().includes(lowercasedQuery) || 
        product.brand?.toLowerCase().includes(lowercasedQuery) ||
        product.description?.toLowerCase().includes(lowercasedQuery)
      );
    }
    
    setFilteredProducts(filtered);
  };

  // Format price to have commas for thousands
  const formatPrice = (price) => {
    return price ? price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
  };

  const renderProductItem = ({ item }) => {
    // Get the lowest price for display
    const lowestPrice = item.sizes && item.sizes.length > 0 
      ? Math.min(...item.sizes.map(s => parseFloat(s.price) || 0))
      : null;
    
    return (
      <View style={styles.productCard}>
        <View style={styles.productImageContainer}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
          ) : (
            <View style={styles.noImageContainer}>
              <Ionicons name="image-outline" size={40} color="#ccc" />
            </View>
          )}
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productBrand}>{item.brand} Tires</Text>
          <Text style={styles.productName} numberOfLines={1}>
            {item.name}
          </Text>
          {lowestPrice && lowestPrice > 0 ? (
            <Text style={styles.productPrice}>
              ₱{formatPrice(lowestPrice)}
            </Text>
          ) : (
            <Text style={styles.productPrice}>Price not available</Text>
          )}
          <TouchableOpacity 
            style={styles.viewButton}
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
          >
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  const toggleBrand = (brand) => {
    setSelectedBrands({
      ...selectedBrands,
      [brand]: !selectedBrands[brand]
    });
  };
  
  const applyFilters = () => {
    setApplyingFilters(!applyingFilters); // Toggle to trigger useEffect
    setFilterModalVisible(false);
  };
  
  const resetFilters = () => {
    setPriceRange({ min: 0, max: 10000 });
    
    const resetBrands = {};
    Object.keys(selectedBrands).forEach(brand => {
      resetBrands[brand] = false;
    });
    setSelectedBrands(resetBrands);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Products</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="notifications-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerIcon}
            onPress={() => navigation.navigate('CartTab')}
          >
            <Ionicons name="cart-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="chatbubble-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="options-outline" size={20} color="#000" />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E50000" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : (
        filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="sad-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySubText}>
              Try adjusting your filters or search terms
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={item => item.id}
            numColumns={2}
            contentContainerStyle={styles.productsContainer}
          />
        )
      )}
      
      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Products</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {/* Price Range */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Price Range</Text>
              <View style={styles.priceInputContainer}>
                <View style={styles.priceInputWrapper}>
                  <Text style={styles.priceInputLabel}>Min</Text>
                  <View style={styles.priceInput}>
                    <Text style={styles.pesoCurrency}>₱</Text>
                    <TextInput 
                      value={priceRange.min.toString()}
                      onChangeText={(text) => setPriceRange({...priceRange, min: parseInt(text) || 0})}
                      style={styles.priceInputText}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <Text style={styles.priceSeparator}>-</Text>
                <View style={styles.priceInputWrapper}>
                  <Text style={styles.priceInputLabel}>Max</Text>
                  <View style={styles.priceInput}>
                    <Text style={styles.pesoCurrency}>₱</Text>
                    <TextInput 
                      value={priceRange.max.toString()}
                      onChangeText={(text) => setPriceRange({...priceRange, max: parseInt(text) || 0})}
                      style={styles.priceInputText}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            </View>
            
            {/* Brands */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Brands</Text>
              <ScrollView style={styles.brandFilterList}>
                {brands.map((brand) => (
                  <TouchableOpacity 
                    key={brand} 
                    style={styles.brandFilterItem}
                    onPress={() => toggleBrand(brand)}
                  >
                    <View style={[
                      styles.checkbox, 
                      selectedBrands[brand] && styles.checkboxSelected
                    ]}>
                      {selectedBrands[brand] && <Ionicons name="checkmark" size={16} color="white" />}
                    </View>
                    <Text style={styles.brandFilterText}>{brand}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {/* Filter Actions */}
            <View style={styles.filterActions}>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={applyFilters}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
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
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 36,
    fontSize: 16,
  },
  filterButton: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  productsContainer: {
    padding: 8,
  },
  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: 'white',
    borderRadius: 4,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productImageContainer: {
    height: 140,
    backgroundColor: '#f5f5f5',
    padding: 8,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  productInfo: {
    padding: 12,
  },
  productBrand: {
    fontSize: 12,
    color: '#E50000',
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    color: '#E50000',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  viewButton: {
    backgroundColor: '#E50000',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  viewButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceInputWrapper: {
    width: '45%',
  },
  priceInputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 44,
  },
  pesoCurrency: {
    fontSize: 16,
    color: '#666',
    marginRight: 4,
  },
  priceInputText: {
    flex: 1,
    fontSize: 16,
  },
  priceSeparator: {
    fontSize: 20,
    color: '#666',
    paddingHorizontal: 10,
  },
  brandFilterList: {
    maxHeight: 200,
  },
  brandFilterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#E50000',
    borderColor: '#E50000',
  },
  brandFilterText: {
    fontSize: 16,
    color: '#333',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    color: '#666',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    backgroundColor: '#E50000',
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default Categories; 