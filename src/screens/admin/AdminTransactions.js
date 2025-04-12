import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { db } from '../../config/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Order statuses and their corresponding colors
const ORDER_STATUSES = {
  pending: { label: 'Pending', color: '#FFC107', icon: 'time-outline' },
  approved: { label: 'Approved', color: '#2196F3', icon: 'checkmark-circle-outline' },
  shipped: { label: 'Shipped', color: '#9C27B0', icon: 'paper-plane-outline' },
  delivered: { label: 'Delivered', color: '#4CAF50', icon: 'checkbox-outline' },
  cancelled: { label: 'Cancelled', color: '#F44336', icon: 'close-circle-outline' },
};

const AdminTransactions = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingOrderId, setProcessingOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    pending: 0,
    approved: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  });
  useEffect(() => {
    fetchOrders();
    
  }, []);

  useEffect(() => {
    // Update status counts
    const counts = {
      all: orders.length,
      pending: 0,
      approved: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };
    
    orders.forEach(order => {
      if (counts[order.status] !== undefined) {
        counts[order.status]++;
      }
    });
    
    setStatusCounts(counts);
    
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = orders.filter(order => 
        order.id.toLowerCase().includes(lowercasedQuery) ||
        order.shippingAddress?.name?.toLowerCase().includes(lowercasedQuery) ||
        order.status.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredOrders(filtered);
    } else {
      if (statusFilter === 'all') {
        setFilteredOrders(orders);
      } else {
        setFilteredOrders(orders.filter(order => order.status === statusFilter));
      }
    }
  }, [searchQuery, orders, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const ordersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Format timestamp for display
        createdAtFormatted: doc.data().createdAt ? 
          new Date(doc.data().createdAt.seconds * 1000).toLocaleString() : 
          'Unknown date'
      }));
      
      setOrders(ordersList);
      setFilteredOrders(ordersList);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setProcessingOrderId(orderId);
      
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      // Update the local state
      const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      
      // Also update the selected order if it's the one being modified
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({...selectedOrder, status: newStatus});
      }
      
      Alert.alert('Success', `Order status updated to ${ORDER_STATUSES[newStatus].label}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Failed to update order status. Please try again.');
    } finally {
      setProcessingOrderId(null);
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setDetailsModalVisible(true);
  };

  const handleStatusUpdate = (order, newStatus) => {
    Alert.alert(
      'Update Order Status',
      `Change status from "${ORDER_STATUSES[order.status].label}" to "${ORDER_STATUSES[newStatus].label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Update', 
          onPress: () => updateOrderStatus(order.id, newStatus)
        }
      ]
    );
  };

  const formatAppointmentDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return '';
  
    const [month, day, year] = dateStr.split('-').map(Number);
    const [hourStr, minuteStr] = timeStr.split(':');
  
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
  
    const dateObj = new Date(year, month - 1, day);
  
    // Ensure valid date
    if (isNaN(dateObj.getTime())) return `${dateStr} ${timeStr}`;
  
    let hour = parseInt(hourStr, 10);
    const minute = minuteStr.padStart(2, '0');
    let ampm = 'AM';
  
    if (hour >= 12) {
      ampm = 'PM';
      if (hour > 12) hour -= 12;
    } else if (hour === 0) {
      hour = 12;
    }
  
    const monthLabel = months[month - 1] || '???';
  
    return `${monthLabel}-${String(day).padStart(2, '0')}-${year} ${String(hour).padStart(2, '0')}:${minute} ${ampm}`;
  };
  

  const renderOrderActions = (order) => {
    if (processingOrderId === order.id) {
      return <ActivityIndicator size="small" color="#E50000" />;
    }

    switch (order.status) {
      case 'pending':
        return (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
              onPress={() => handleStatusUpdate(order, 'approved')}
            >
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#F44336' }]}
              onPress={() => handleStatusUpdate(order, 'cancelled')}
            >
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        );
      case 'approved':
        return (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}
            onPress={() => handleStatusUpdate(order, 'shipped')}
          >
            <Text style={styles.actionButtonText}>Mark Shipped</Text>
          </TouchableOpacity>
        );
      case 'shipped':
        return (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => handleStatusUpdate(order, 'delivered')}
          >
            <Text style={styles.actionButtonText}>Mark Delivered</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <TouchableOpacity 
        style={styles.orderHeader}
        onPress={() => viewOrderDetails(item)}
      >
        <View>
          <Text style={styles.orderId}>Order #{item.id.slice(-6)}</Text>
          <Text style={styles.orderDate}>{item.createdAtFormatted}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: ORDER_STATUSES[item.status]?.color || '#999' }]}>
          <Ionicons name={ORDER_STATUSES[item.status]?.icon || 'help-circle-outline'} size={14} color="white" />
          <Text style={styles.statusText}>{ORDER_STATUSES[item.status]?.label || 'Unknown'}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.orderInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Customer:</Text>
          <Text style={styles.infoValue}>{item.shippingAddress?.name || 'Unknown'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Items:</Text>
          <Text style={styles.infoValue}>{item.items?.length || 0}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total:</Text>
          <Text style={styles.infoValue}>₱{item.total}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Payment:</Text>
          <Text style={styles.infoValue}>
            {item.paymentMethod?.charAt(0).toUpperCase() + item.paymentMethod?.slice(1) || 'Unknown'}
          </Text>
        </View>
        {item.appointment && item.appointment.date && <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Appointment:</Text>
          <Text style={styles.infoValue}>
          {formatAppointmentDateTime(item.appointment.date, item.appointment.time)}
          </Text>
        </View>}
      </View>

      <View style={styles.orderActions}>
        {renderOrderActions(item)}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top}]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transactions</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchOrders}
          disabled={loading}
        >
          <Ionicons name="refresh" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search orders..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Status filter tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statusTabsContainer}
      >
        <TouchableOpacity 
          style={[
            styles.statusTab, 
            statusFilter === 'all' && styles.statusTabActive
          ]}
          onPress={() => setStatusFilter('all')}
        >
          <Text style={[
            styles.statusTabText,
            statusFilter === 'all' && styles.statusTabTextActive
          ]}>All ({statusCounts.all})</Text>
        </TouchableOpacity>
        
        {Object.entries(ORDER_STATUSES).map(([key, value]) => (
          <TouchableOpacity 
            key={key}
            style={[
              styles.statusTab, 
              statusFilter === key && styles.statusTabActive,
              { borderColor: value.color }
            ]}
            onPress={() => setStatusFilter(key)}
          >
            <Text style={[
              styles.statusTabText,
              statusFilter === key && styles.statusTabTextActive,
              statusFilter === key && { color: value.color }
            ]}>{value.label} ({statusCounts[key]})</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E50000" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No orders found</Text>
            </View>
          }
          refreshing={loading}
          onRefresh={fetchOrders}
        />
      )}

      {selectedOrder && (
        <OrderDetailsModal 
          visible={detailsModalVisible}
          order={selectedOrder}
          onClose={() => setDetailsModalVisible(false)}
          onUpdateStatus={(newStatus) => {
            setDetailsModalVisible(false);
            handleStatusUpdate(selectedOrder, newStatus);
          }}
        />
      )}
    </View>
  );
};

// Order Details Modal Component
const OrderDetailsModal = ({ visible, order, onClose, onUpdateStatus }) => {
  const [orderNotes, setOrderNotes] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const shareOrderDetails = () => {
    // This would typically use Share API in React Native
    // For now, we'll just show an alert
    Alert.alert(
      'Order Information',
      `Order #${order.id.slice(-6)} details would be shared or printed.`,
      [{ text: 'OK' }]
    );
  };

  const saveOrderNote = async () => {
    if (!orderNotes.trim()) return;
    
    try {
      setAddingNote(true);
      // Here you would typically update this note in Firestore
      // For now, just show a success message
      Alert.alert('Success', 'Note added to order');
      setOrderNotes('');
    } catch (error) {
      console.error('Error adding note:', error);
      Alert.alert('Error', 'Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  if (!visible || !order) return null;
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Order Details #{order.id.slice(-6)}</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.actionIcon} onPress={shareOrderDetails}>
                <Ionicons name="share-outline" size={22} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionIcon} onPress={onClose}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Order Information</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <View style={[styles.statusBadge, { backgroundColor: ORDER_STATUSES[order.status]?.color || '#999' }]}>
                  <Text style={styles.statusText}>{ORDER_STATUSES[order.status]?.label || 'Unknown'}</Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>{order.createdAtFormatted}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment Method:</Text>
                <Text style={styles.detailValue}>
                  {order.paymentMethod?.charAt(0).toUpperCase() + order.paymentMethod?.slice(1) || 'Unknown'}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Customer Information</Text>
              <Text style={styles.addressName}>{order.shippingAddress?.name}</Text>
              <Text style={styles.addressText}>{order.shippingAddress?.street}</Text>
              <Text style={styles.addressText}>
                {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
              </Text>
              <Text style={styles.addressText}>{order.shippingAddress?.country}</Text>
              <Text style={styles.addressPhone}>{order.shippingAddress?.phone}</Text>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Order Items</Text>
              {order.items?.map((item, index) => (
                <View key={index} style={styles.orderItemDetail}>
                  <View style={styles.orderItemInfo}>
                    <Text style={styles.orderItemName}>{item.productName}</Text>
                    <Text style={styles.orderItemMeta}>
                      Size: {item.size} · Quantity: {item.quantity}
                    </Text>
                  </View>
                  <Text style={styles.orderItemPrice}>₱{item.price * item.quantity}</Text>
                </View>
              ))}
              
              <View style={styles.divider} />
              
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>₱{order.total}</Text>
              </View>
            </View>
            
            {/* Add notes section */}
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Admin Notes</Text>
              <TextInput
                style={styles.notesInput}
                multiline
                placeholder="Add a note about this order..."
                value={orderNotes}
                onChangeText={setOrderNotes}
              />
              <TouchableOpacity 
                style={styles.addNoteButton}
                onPress={saveOrderNote}
                disabled={addingNote || !orderNotes.trim()}
              >
                {addingNote ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.addNoteButtonText}>Add Note</Text>
                )}
              </TouchableOpacity>
              
              {/* Display existing notes here (from Firestore) */}
              <View style={styles.notesList}>
                {/* Mock notes for UI demo */}
                <View style={styles.noteItem}>
                  <Text style={styles.noteText}>Customer requested gift wrapping.</Text>
                  <Text style={styles.noteDate}>Jun 10, 2023 10:30 AM</Text>
                </View>
              </View>
            </View>
            
            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Update Status</Text>
                <View style={styles.statusButtons}>
                  {order.status === 'pending' && (
                    <>
                      <TouchableOpacity 
                        style={[styles.statusButton, { backgroundColor: '#2196F3' }]}
                        onPress={() => onUpdateStatus('approved')}
                      >
                        <Text style={styles.statusButtonText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.statusButton, { backgroundColor: '#F44336' }]}
                        onPress={() => onUpdateStatus('cancelled')}
                      >
                        <Text style={styles.statusButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  
                  {order.status === 'approved' && (
                    <TouchableOpacity 
                      style={[styles.statusButton, { backgroundColor: '#9C27B0' }]}
                      onPress={() => onUpdateStatus('shipped')}
                    >
                      <Text style={styles.statusButtonText}>Mark Shipped</Text>
                    </TouchableOpacity>
                  )}
                  
                  {order.status === 'shipped' && (
                    <TouchableOpacity 
                      style={[styles.statusButton, { backgroundColor: '#4CAF50' }]}
                      onPress={() => onUpdateStatus('delivered')}
                    >
                      <Text style={styles.statusButtonText}>Mark Delivered</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
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
  refreshButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  statusTabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  statusTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 20,
    backgroundColor: 'white',
    height: 38,
    width: 145,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTabActive: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    
  },
  statusTabText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  },
  statusTabTextActive: {
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderDate: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  orderInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#777',
    width: 120,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  orderActions: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#777',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    padding: 8,
    marginLeft: 8,
  },
  closeButton: {
    padding: 8,
  },
  modalBody: {
    padding: 16,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#777',
    width: 120,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  addressName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  addressPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  orderItemDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  orderItemMeta: {
    fontSize: 13,
    color: '#777',
  },
  orderItemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E50000',
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statusButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    minWidth: 120,
    alignItems: 'center',
  },
  statusButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    height: 80,
    textAlignVertical: 'top',
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  addNoteButton: {
    backgroundColor: '#E50000',
    borderRadius: 4,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  addNoteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  notesList: {
    marginTop: 16,
  },
  noteItem: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#333',
  },
  noteDate: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
});

export default AdminTransactions; 