import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../config/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

const PAYMENT_METHODS = [
  { id: "cash", name: "Cash on Delivery", icon: "cash-outline" },
  { id: "gcash", name: "GCash", icon: "wallet-outline" },
  { id: "maya", name: "Maya", icon: "card-outline" },
  { id: "paypal", name: "PayPal", icon: "logo-paypal" },
  { id: "card", name: "Credit/Debit Card", icon: "card-outline" },
];

const Checkout = ({ route, navigation }) => {
  const { user } = useAuth();
  const { cartItems, totalPrice, appointmentData } = route.params || {
    cartItems: [],
    totalPrice: 0,
  };

  

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0].id);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchAddresses();
    } else {
      Alert.alert("Login Required", "Please log in to checkout.");
      navigation.navigate("Login");
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const addressesRef = collection(db, `users/${user.id}/addresses`);
      const snapshot = await getDocs(addressesRef);

      const addressList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAddresses(addressList);

      // Select the default address or the first one in the list
      const defaultAddress = addressList.find((addr) => addr.isDefault);
      setSelectedAddress(
        defaultAddress || (addressList.length > 0 ? addressList[0] : null)
      );
    } catch (error) {
      console.error("Error fetching addresses:", error);
      Alert.alert("Error", "Failed to load your addresses.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setAddressModalVisible(false);
  };

  const placeOrder = async () => {
    if (!selectedAddress) {
      Alert.alert("Address Required", "Please select a shipping address.");
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert(
        "Empty Cart",
        "Your cart is empty. Add items before checking out."
      );
      return;
    }

    try {
      setPlacingOrder(true);

      // Create order in Firestore
      const orderData = {
        userId: user.id,
        items: cartItems,
        shippingAddress: selectedAddress,
        paymentMethod: selectedPayment,
        total: totalPrice,
        status: "pending",
        appointment: {
          date: appointmentData.date || null,
          time: appointmentData.time || null,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Add order to Firestore
      const orderRef = await addDoc(collection(db, "orders"), orderData);

      // Clear the user's cart
      await deleteDoc(doc(db, "carts", user.id));

      // Show success and navigate back
      Alert.alert(
        "Order Placed Successfully!",
        `Your order #${orderRef.id.slice(
          -6
        )} has been placed and is pending approval.`,
        [
          {
            text: "OK",
            onPress: () =>
              navigation.reset({
                index: 0,
                routes: [{ name: "MainDrawer" }],
              }),
          },
        ]
      );
    } catch (error) {
      console.error("Error placing order:", error);
      Alert.alert("Error", "Failed to place your order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const renderAddressItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.addressItem,
        selectedAddress?.id === item.id && styles.selectedAddressItem,
      ]}
      onPress={() => handleAddressSelect(item)}
    >
      <View style={styles.addressHeader}>
        <Text style={styles.addressType}>{item.type}</Text>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
      </View>
      <Text style={styles.addressName}>{item.name}</Text>
      <Text style={styles.addressText}>{item.street}</Text>
      <Text style={styles.addressText}>
        {item.city}, {item.state} {item.zipCode}
      </Text>
      <Text style={styles.addressText}>{item.country}</Text>
      <Text style={styles.addressPhone}>{item.phone}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView behavior="height" style={{flex: 1}}>
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E50000" />
          <Text style={styles.loadingText}>Loading checkout...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {/* Shipping Address Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Shipping Address</Text>
              <TouchableOpacity
                style={styles.changeButton}
                onPress={() => setAddressModalVisible(true)}
              >
                <Text style={styles.changeButtonText}>Change</Text>
              </TouchableOpacity>
            </View>

            {selectedAddress ? (
              <View style={styles.selectedAddress}>
                <Text style={styles.addressType}>{selectedAddress.type}</Text>
                <Text style={styles.addressName}>{selectedAddress.name}</Text>
                <Text style={styles.addressText}>{selectedAddress.street}</Text>
                <Text style={styles.addressText}>
                  {selectedAddress.city}, {selectedAddress.state}{" "}
                  {selectedAddress.zipCode}
                </Text>
                <Text style={styles.addressText}>
                  {selectedAddress.country}
                </Text>
                <Text style={styles.addressPhone}>{selectedAddress.phone}</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addAddressButton}
                onPress={() => navigation.navigate("MyAddresses")}
              >
                <Ionicons name="add-circle-outline" size={20} color="#E50000" />
                <Text style={styles.addAddressText}>
                  Add a shipping address
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Payment Method Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>

            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethod,
                  selectedPayment === method.id && styles.selectedPaymentMethod,
                ]}
                onPress={() => setSelectedPayment(method.id)}
              >
                <View style={styles.paymentIcon}>
                  <Ionicons name={method.icon} size={24} color="#333" />
                </View>
                <Text style={styles.paymentName}>{method.name}</Text>
                {selectedPayment === method.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#E50000" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Order Summary Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>

            {cartItems.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <View style={styles.orderItemInfo}>
                  <Text style={styles.orderItemName}>{item.productName}</Text>
                  <Text style={styles.orderItemDetails}>
                    Size: {item.size} · Qty: {item.quantity}
                  </Text>
                </View>
                <Text style={styles.orderItemPrice}>
                  ₱{item.price * item.quantity}
                </Text>
              </View>
            ))}

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₱{totalPrice}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>Free</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalPrice}>₱{totalPrice}</Text>
            </View>
          </View>
        </ScrollView>
      )}

      {!loading && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.placeOrderButton}
            onPress={placeOrder}
            disabled={placingOrder || !selectedAddress}
          >
            {placingOrder ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.placeOrderButtonText}>Place Order</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Address Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addressModalVisible}
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Address</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setAddressModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {addresses.length > 0 ? (
              <FlatList
                data={addresses}
                renderItem={renderAddressItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.addressList}
              />
            ) : (
              <View style={styles.emptyAddresses}>
                <Text style={styles.emptyAddressesText}>
                  No saved addresses found
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.addNewAddressButton}
              onPress={() => {
                setAddressModalVisible(false);
                navigation.navigate("MyAddresses");
              }}
            >
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.addNewAddressText}>Add New Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 50,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  changeButton: {
    padding: 4,
  },
  changeButtonText: {
    color: "#E50000",
    fontSize: 14,
    fontWeight: "500",
  },
  selectedAddress: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  addressType: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
    marginBottom: 4,
  },
  addressName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  addressPhone: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  addAddressButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#ccc",
    borderRadius: 8,
    justifyContent: "center",
  },
  addAddressText: {
    color: "#E50000",
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedPaymentMethod: {
    borderColor: "#E50000",
    backgroundColor: "#FFF5F5",
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  paymentName: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  orderItemDetails: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  orderItemPrice: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#777",
  },
  summaryValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E50000",
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  placeOrderButton: {
    backgroundColor: "#E50000",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  placeOrderButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#777",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 8,
  },
  addressList: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 80,
  },
  addressItem: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  selectedAddressItem: {
    borderColor: "#E50000",
    backgroundColor: "#FFF5F5",
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  defaultBadge: {
    backgroundColor: "#E8F5E9",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  defaultText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
  },
  emptyAddresses: {
    padding: 24,
    alignItems: "center",
  },
  emptyAddressesText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
  },
  addNewAddressButton: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    flexDirection: "row",
    backgroundColor: "#E50000",
    borderRadius: 8,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  addNewAddressText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default Checkout;
