import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
  Modal,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Header from '../components/Header';

const Categories = () => {
  const [filterVisible, setFilterVisible] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [selectedBrands, setSelectedBrands] = useState({
    michelin: false,
    eurogrip: false,
    shinko: false,
    motoz: false,
    pirelli: false
  });

  const toggleFilterModal = () => {
    setFilterVisible(!filterVisible);
  };

  const resetFilters = () => {
    setPriceRange({ min: 0, max: 10000 });
    setSelectedBrands({
      michelin: false,
      eurogrip: false,
      shinko: false,
      motoz: false,
      pirelli: false
    });
  };

  const applyFilters = () => {
    // Here you would implement the logic to filter products
    // For now, we just close the modal
    toggleFilterModal();
  };

  const toggleBrand = (brand) => {
    setSelectedBrands({
      ...selectedBrands,
      [brand]: !selectedBrands[brand]
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <Header title="All Products" />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={toggleFilterModal}>
          <MaterialIcons name="tune" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Empty Products Message */}
      <View style={styles.emptyProductsContainer}>
        <MaterialIcons name="shopping-bag" size={60} color="#ccc" />
        <Text style={styles.emptyProductsText}>NO product listings yet</Text>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={filterVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={toggleFilterModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Products</Text>
              <TouchableOpacity onPress={toggleFilterModal}>
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
              <View style={styles.brandFilterContainer}>
                {Object.keys(selectedBrands).map((brand) => (
                  <TouchableOpacity 
                    key={brand} 
                    style={styles.brandFilterItem}
                    onPress={() => toggleBrand(brand)}
                  >
                    <View style={[styles.checkBox, selectedBrands[brand] && styles.checkBoxSelected]}>
                      {selectedBrands[brand] && <Ionicons name="checkmark" size={16} color="white" />}
                    </View>
                    <Text style={styles.brandFilterText}>{brand.charAt(0).toUpperCase() + brand.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Filter Actions */}
            <View style={styles.filterActions}>
              <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
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
    backgroundColor: '#f8f8f8',
  },
  header: {
    height: 60,
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  menuButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  headerIconButton: {
    marginLeft: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: 44,
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: 'white',
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyProductsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyProductsText: {
    fontSize: 18,
    color: '#666',
    marginTop: 15,
    textAlign: 'center',
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
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
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
    marginBottom: 5,
  },
  priceInput: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
  },
  pesoCurrency: {
    fontSize: 16,
    color: '#333',
    marginRight: 5,
  },
  priceInputText: {
    flex: 1,
    fontSize: 16,
  },
  priceSeparator: {
    fontSize: 18,
    color: '#666',
  },
  brandFilterContainer: {
    marginTop: 5,
  },
  brandFilterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkBox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBoxSelected: {
    backgroundColor: '#e30613',
    borderColor: '#e30613',
  },
  brandFilterText: {
    fontSize: 16,
    color: '#333',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  resetButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    alignItems: 'center',
    width: '48%',
  },
  resetButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  applyButton: {
    padding: 12,
    backgroundColor: '#e30613',
    borderRadius: 5,
    alignItems: 'center',
    width: '48%',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Categories; 