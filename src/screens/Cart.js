import React, { useState, useCallback, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useFocusEffect } from "@react-navigation/native";

const Cart = ({ navigation }) => {
  const scrollViewRef = useRef(null)
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMakeAppointment, setOpenmakeAppointment] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
      date: "",
      time: "",
    });
  // Calculate the total price of all items in cart
  const totalPrice = cartItems.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchCart();
      } else {
        setCartItems([]);
        setLoading(false);
      }
    }, [user])
  );

  const fetchCart = async () => {
    try {
      setLoading(true);
      const cartRef = doc(db, "carts", user.id);
      const cartDoc = await getDoc(cartRef);

      if (cartDoc.exists() && cartDoc.data().items) {
        setCartItems(cartDoc.data().items);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      Alert.alert("Error", "Failed to load cart items.");
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = async (index, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(index);
      return;
    }

    try {
      setLoading(true);

      // Update local state
      const updatedItems = [...cartItems];
      updatedItems[index].quantity = newQuantity;
      setCartItems(updatedItems);

      // Update in Firestore
      const cartRef = doc(db, "carts", user.id);
      await updateDoc(cartRef, {
        items: updatedItems,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
      Alert.alert("Error", "Failed to update item quantity.");
      // Revert local state on error
      fetchCart();
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (index) => {
    try {
      const updatedItems = [...cartItems];
      updatedItems.splice(index, 1);

      const cartRef = doc(db, "carts", user.id);

      if (updatedItems.length === 0) {
        // Delete the entire cart document if no items left
        await deleteDoc(cartRef);
        setCartItems([]);
      } else {
        // Update with remaining items
        await updateDoc(cartRef, {
          items: updatedItems,
          updatedAt: new Date().toISOString(),
        });
        setCartItems(updatedItems);
      }
    } catch (error) {
      console.error("Error removing item:", error);
      Alert.alert("Error", "Failed to remove item from cart.");
    }
  };

  const clearCart = () => {
    Alert.alert(
      "Clear Cart",
      "Are you sure you want to remove all items from your cart?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const cartRef = doc(db, "carts", user.id);
              await deleteDoc(cartRef);
              setCartItems([]);
            } catch (error) {
              console.error("Error clearing cart:", error);
              Alert.alert("Error", "Failed to clear cart.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const checkout = () => {
    if (!user) {
      Alert.alert("Login Required", "Please log in to checkout.");
      navigation.navigate("Login");
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert(
        "Empty Cart",
        "Your cart is empty. Add items before checking out."
      );
      return;
    }

    // Navigate to checkout with cart items and total price
    navigation.navigate("Checkout", {
      cartItems,
      totalPrice,
      appointmentData
    });
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const renderCartItem = ({ item, index }) => (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: item.imageUrl || "https://via.placeholder.com/100" }}
        style={styles.itemImage}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.productName}</Text>
        <Text style={styles.itemBrand}>{item.brand}</Text>
        <Text style={styles.itemSize}>Size: {item.size}</Text>
        <Text style={styles.itemPrice}>₱{item.price}</Text>
      </View>
      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateItemQuantity(index, item.quantity - 1)}
        >
          <Ionicons name="remove" size={18} color="#333" />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateItemQuantity(index, item.quantity + 1)}
        >
          <Ionicons name="add" size={18} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior="height" style={{flex: 1}}>
    <View style={styles.container}>
      <StatusBar barStyle={'dark-content'} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={clearCart}>
            <Text style={styles.clearCartText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E50000" />
          <Text style={styles.loadingText}>Loading cart...</Text>
        </View>
      ) : !user ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="person-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>Please log in to view your cart</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      ) : cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate("CategoriesTab")}
          >
            <Text style={styles.shopButtonText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.listContainer}
          />

          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>₱{totalPrice}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping:</Text>
              <Text style={styles.summaryValue}>Free</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>₱{totalPrice}</Text>
            </View>
            {!openMakeAppointment ? (
              <TouchableOpacity
                onPress={() => {
                  setOpenmakeAppointment(!openMakeAppointment);
                  setTimeout(() => {
                    scrollToBottom();
                  }, 100);
                }}
              >
                <Text
                  style={{
                    ...styles.totalLabel,
                    textDecorationLine: "underline",
                  }}
                >
                  Make an Appointment
                </Text>
              </TouchableOpacity>
            ) : (
              <View>
                <View style={styles.appointmentContainer}>
                  <Text
                    style={{
                      ...styles.totalLabel,
                      marginRight: 4,
                    }}
                  >
                    Make an Appointment
                  </Text>
                  <TouchableOpacity
                    onPress={() => setOpenmakeAppointment(!openMakeAppointment)}
                  >
                    <Ionicons name="close" size={25} color={"red"} />
                  </TouchableOpacity>
                </View>
                <View style={styles.formGroup}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Date</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="number-pad"
                      value={appointmentData.date}
                      maxLength={10}
                      onChangeText={(text) => {
                        const cleaned = text.replace(/[^0-9]/g, "");
                      
                        let formatted = "";
                        if (cleaned.length <= 2) {
                          formatted = cleaned;
                        } else if (cleaned.length <= 4) {
                          formatted = `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
                        } else {
                          formatted = `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4, 8)}`;
                        }
                      
                        if (formatted.length > 10) {
                          formatted = formatted.slice(0, 10);
                        }
                      
                        // Validate if fully typed (MM-DD-YYYY)
                        if (formatted.length === 10) {
                          const [mm, dd, yyyy] = formatted.split("-").map(Number);
                          const now = new Date();
                          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // no time
                          const maxYear = now.getFullYear() + 2;
                      
                          const isValidMonth = mm >= 1 && mm <= 12;
                          const isValidDay = dd >= 1 && dd <= 31;
                          const isValidYear = yyyy >= now.getFullYear() && yyyy <= maxYear;
                      
                          let isValidDate = false;
                          let constructedDate;
                      
                          if (isValidMonth && isValidDay && isValidYear) {
                            constructedDate = new Date(`${yyyy}-${mm}-${dd}`);
                            isValidDate =
                              constructedDate &&
                              constructedDate.getMonth() + 1 === mm &&
                              constructedDate.getDate() === dd &&
                              constructedDate.getFullYear() === yyyy;
                          }
                      
                          if (!isValidDate) {
                            Alert.alert("Invalid Date", "Please enter a valid date.");
                            setAppointmentData({
                              ...appointmentData,
                              date: "", // Clear the date field
                            });
                            return
                          } else if (constructedDate < today) {
                            Alert.alert("Invalid Date", "The date cannot be in the past.");
                            setAppointmentData({
                              ...appointmentData,
                              date: "", // Clear the date field
                            });
                            return
                          }
                        }
                      
                        setAppointmentData({
                          ...appointmentData,
                          date: formatted,
                        });
                      }}                      
                      placeholder="MM-DD-YYYY"
                      placeholderTextColor="#999"
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Time</Text>
                    <TextInput
                      style={[styles.input]}
                      keyboardType="number-pad"
                      value={appointmentData.time}
                      onChangeText={(text) => {
                        const cleaned = text.replace(/[^0-9]/g, "");

                        let formatted = "";
                        if (cleaned.length <= 2) {
                          formatted = cleaned;
                        } else if (cleaned.length <= 4) {
                          formatted = `${cleaned.slice(0, 2)}:${cleaned.slice(
                            2
                          )}`;
                        } else {
                          formatted = `${cleaned.slice(0, 2)}:${cleaned.slice(
                            2,
                            4
                          )}`;
                        }

                        setAppointmentData({
                          ...appointmentData,
                          time: formatted,
                        });
                      }}
                      placeholder="HH:MM"
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>
              </View>
            )}
            <TouchableOpacity style={styles.checkoutButton} onPress={checkout}>
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 50,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  clearCartText: {
    fontSize: 14,
    color: "#E50000",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: "#E50000",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  shopButton: {
    backgroundColor: "#E50000",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  shopButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 200, // Extra padding for summary
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#f5f5f5",
  },
  itemDetails: {
    flex: 1,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  itemBrand: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  itemSize: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E50000",
  },
  quantityControls: {
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 8,
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 4,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "bold",
    marginVertical: 4,
  },
  summaryContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E50000",
  },
  checkoutButton: {
    backgroundColor: "#E50000",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  checkoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  inputContainer: {
    width: "48%",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    backgroundColor: "white",
    height: 50,
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#333",
  },
  formGroup: {
    width: "100%",
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  appointmentContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingBottom: 12,
  },
});

export default Cart;
