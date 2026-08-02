import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getStoredEmployee } from '../services/security';

interface Product {
  id: string;
  name: string;
  price: number;
  barcode: string | null;
  stock: number;
  vatRate: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

// Kompiuterio IP adresas, kur veikia backend (pvz., 192.168.1.100:3000)
const API_BASE_URL = 'http://192.168.1.100:3000/api/pos';

export default function PosScreen() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [employee, setEmployee] = useState<any>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'CASH' | null>(null);
  const [cashAmount, setCashAmount] = useState('');

  useEffect(() => {
    loadEmployeeAndProducts();
  }, []);

  const loadEmployeeAndProducts = async () => {
    setLoading(true);
    const empData = await getStoredEmployee();
    setEmployee(empData);

    if (empData?.companyId) {
      await fetchProducts(empData.companyId);
    } else {
      setLoading(false);
    }
  };

  const fetchProducts = async (companyId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products?companyId=${companyId}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.products);
      } else {
        Alert.alert('Klaida', data.error || 'Nepavyko užkrauti prekių');
      }
    } catch (error) {
      console.error('Klaida gaunant prekes:', error);
      Alert.alert('Klaida', 'Nepavyko susisiekti su backend serveriu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (employee?.companyId) {
      setRefreshing(true);
      fetchProducts(employee.companyId);
    }
  };

  // Prekių filtravimas pagal paiešką (pavadinimą arba brūkšninį kodą)
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.barcode && product.barcode.includes(searchQuery));
      return matchesSearch;
    });
  }, [products, searchQuery]);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const changeAmount = useMemo(() => {
    const cash = parseFloat(cashAmount) || 0;
    return cash >= totalAmount ? cash - totalAmount : 0;
  }, [cashAmount, totalAmount]);

  const handleCompleteSale = () => {
    if (paymentMethod === 'CASH') {
      const cash = parseFloat(cashAmount) || 0;
      if (cash < totalAmount) {
        Alert.alert('Klaida', 'Įvesta grynųjų suma mažesnė už mokėtiną sumą!');
        return;
      }
    }

    Alert.alert(
      'Mokėjimas sėkmingas! 🎉',
      `Sumokėta: €${totalAmount.toFixed(2)}\nBūdas: ${
        paymentMethod === 'CARD' ? 'Kortelė' : 'Grynieji'
      }${paymentMethod === 'CASH' ? `\nGrąža: €${changeAmount.toFixed(2)}` : ''}`,
      [
        {
          text: 'Naujas pardavimas',
          onPress: () => {
            setCart([]);
            setCheckoutModalVisible(false);
            setPaymentMethod(null);
            setCashAmount('');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* VIRŠUTINĖ JUOSTA */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{employee?.companyName || 'MODERNI KASA'}</Text>
          <Text style={styles.cashierText}>Kasininkas: {employee?.name || 'Darbuotojas'}</Text>
        </View>

        <TouchableOpacity style={styles.lockButton} onPress={() => router.replace('/')}>
          <Text style={styles.lockButtonText}>🔒 Užrakinti</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainLayout}>
        {/* KAIRĖ PUSĖ: PREKIŲ KATALOGAS */}
        <View style={styles.catalogSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Paieška pagal pavadinimą / barkodą..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={filteredProducts}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={styles.productList}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              ListEmptyComponent={
                <Text style={styles.emptyText}>Prekių nerasta. Įtraukite jas per Admin pultą.</Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.productCard} onPress={() => addToCart(item)}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productBarcode}>
                    {item.barcode ? `Barkodas: ${item.barcode}` : 'Be barkodo'}
                  </Text>
                  <Text style={styles.productPrice}>€{item.price.toFixed(2)}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {/* DEŠINĖ PUSĖ: KREPŠELIS */}
        <View style={styles.cartSection}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>Krepšelis ({cart.length})</Text>
            {cart.length > 0 && (
              <TouchableOpacity onPress={() => setCart([])}>
                <Text style={styles.clearCartText}>Išvalyti</Text>
              </TouchableOpacity>
            )}
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyCart}>
              <Text style={styles.emptyCartIcon}>🛒</Text>
              <Text style={styles.emptyCartText}>Krepšelis tuščias</Text>
            </View>
          ) : (
            <FlatList
              data={cart}
              keyExtractor={(item) => item.product.id}
              style={styles.cartList}
              renderItem={({ item }) => (
                <View style={styles.cartItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cartItemName}>{item.product.name}</Text>
                    <Text style={styles.cartItemPrice}>
                      €{item.product.price.toFixed(2)} x {item.quantity} = €
                      {(item.product.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() => updateQuantity(item.product.id, -1)}
                    >
                      <Text style={styles.qtyButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() => updateQuantity(item.product.id, 1)}
                    >
                      <Text style={styles.qtyButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}

          <View style={styles.cartFooter}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Mokėti iš viso:</Text>
              <Text style={styles.totalValue}>€{totalAmount.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.checkoutButton,
                cart.length === 0 && styles.checkoutButtonDisabled,
              ]}
              disabled={cart.length === 0}
              onPress={() => setCheckoutModalVisible(true)}
            >
              <Text style={styles.checkoutButtonText}>Apmokėti €{totalAmount.toFixed(2)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* MOKĖJIMO MODALAS */}
      <Modal visible={checkoutModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Pasirinkite mokėjimo būdą</Text>
            <Text style={styles.modalTotal}>Suma: €{totalAmount.toFixed(2)}</Text>

            <View style={styles.paymentMethodsRow}>
              <TouchableOpacity
                style={[
                  styles.paymentCard,
                  paymentMethod === 'CARD' && styles.paymentCardActive,
                ]}
                onPress={() => setPaymentMethod('CARD')}
              >
                <Text style={styles.paymentIcon}>💳</Text>
                <Text style={styles.paymentText}>Kortelė</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentCard,
                  paymentMethod === 'CASH' && styles.paymentCardActive,
                ]}
                onPress={() => setPaymentMethod('CASH')}
              >
                <Text style={styles.paymentIcon}>💵</Text>
                <Text style={styles.paymentText}>Grynieji</Text>
              </TouchableOpacity>
            </View>

            {paymentMethod === 'CASH' && (
              <View style={styles.cashInputSection}>
                <Text style={styles.label}>Gauta grynųjų (€):</Text>
                <TextInput
                  style={styles.cashInput}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  value={cashAmount}
                  onChangeText={setCashAmount}
                  autoFocus
                />
                <View style={styles.changeRow}>
                  <Text style={styles.changeLabel}>Grąža pirkėjui:</Text>
                  <Text style={styles.changeValue}>€{changeAmount.toFixed(2)}</Text>
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setCheckoutModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Atšaukti</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  !paymentMethod && styles.confirmButtonDisabled,
                ]}
                disabled={!paymentMethod}
                onPress={handleCompleteSale}
              >
                <Text style={styles.confirmButtonText}>Baigti pardavimą</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#2563EB' },
  cashierText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  lockButton: { backgroundColor: '#F1F5F9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  lockButtonText: { fontSize: 13, fontWeight: '700', color: '#334155' },
  mainLayout: { flex: 1, flexDirection: 'row' },
  catalogSection: { flex: 1.2, padding: 16 },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  productList: { paddingBottom: 20 },
  productCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    margin: 6,
    minHeight: 100,
    justifyContent: 'space-between',
    elevation: 2,
  },
  productName: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  productBarcode: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  productPrice: { fontSize: 16, fontWeight: '800', color: '#2563EB', marginTop: 8 },
  emptyText: { textAlign: 'center', color: '#94A3B8', marginTop: 40, fontSize: 14 },
  cartSection: { flex: 1, backgroundColor: '#FFFFFF', borderLeftWidth: 1, borderLeftColor: '#E2E8F0' },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cartTitle: { fontSize: 17, fontWeight: '800' },
  clearCartText: { fontSize: 13, color: '#EF4444', fontWeight: '600' },
  emptyCart: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyCartIcon: { fontSize: 48, marginBottom: 12 },
  emptyCartText: { fontSize: 16, fontWeight: '700', color: '#64748B' },
  cartList: { flex: 1, paddingHorizontal: 16 },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cartItemName: { fontSize: 14, fontWeight: '700' },
  cartItemPrice: { fontSize: 12, color: '#64748B', marginTop: 2 },
  quantityControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 8, padding: 4 },
  qtyButton: { width: 28, height: 28, backgroundColor: '#FFFFFF', borderRadius: 6, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  qtyButtonText: { fontSize: 16, fontWeight: '700' },
  qtyText: { fontSize: 14, fontWeight: '700', marginHorizontal: 10 },
  cartFooter: { padding: 16, borderTopWidth: 1, borderTopColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  totalLabel: { fontSize: 15, fontWeight: '600', color: '#64748B' },
  totalValue: { fontSize: 24, fontWeight: '900', color: '#0F172A' },
  checkoutButton: { backgroundColor: '#16A34A', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  checkoutButtonDisabled: { backgroundColor: '#CBD5E1' },
  checkoutButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, width: '100%', maxWidth: 450 },
  modalTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  modalTotal: { fontSize: 16, color: '#2563EB', fontWeight: '700', textAlign: 'center', marginTop: 4, marginBottom: 20 },
  paymentMethodsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  paymentCard: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 14, padding: 16, alignItems: 'center', marginHorizontal: 6, borderWidth: 2, borderColor: '#E2E8F0' },
  paymentCardActive: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  paymentIcon: { fontSize: 32, marginBottom: 8 },
  paymentText: { fontSize: 13, fontWeight: '700' },
  cashInputSection: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
  cashInput: { backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 12, paddingVertical: 10, fontSize: 20, fontWeight: '800' },
  changeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  changeLabel: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  changeValue: { fontSize: 18, fontWeight: '800', color: '#16A34A' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelButton: { flex: 1, backgroundColor: '#F1F5F9', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginRight: 8 },
  cancelButtonText: { color: '#475569', fontWeight: '700' },
  confirmButton: { flex: 1.5, backgroundColor: '#16A34A', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginLeft: 8 },
  confirmButtonDisabled: { backgroundColor: '#CBD5E1' },
  confirmButtonText: { color: '#FFFFFF', fontWeight: '800' },
});