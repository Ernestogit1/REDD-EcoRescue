import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Animated, Dimensions, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import ApiService from '../../services/api.service';
// Remove: import CustomPopup from '../../components/ui/CustomPopup';

const { width: screenWidth } = Dimensions.get('window');

function CustomPopup({ visible, title, message, buttons = [], onClose }) {
  const popupAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      requestAnimationFrame(() => {
        Animated.spring(popupAnim, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }).start();
      });
    } else {
      popupAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={popupStyles.popupOverlay}>
        <Animated.View
          style={[
            popupStyles.popupContainer,
            {
              transform: [
                { scale: popupAnim },
                {
                  translateY: popupAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient colors={["#52B69A", "#1A759F"]} style={popupStyles.popupHeader}>
            <Text style={popupStyles.popupTitle}>{title}</Text>
          </LinearGradient>
          <View style={popupStyles.popupBody}>
            <Text style={popupStyles.popupMessage}>{message}</Text>
            <View style={popupStyles.popupButtonContainer}>
              {buttons.map((button, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    popupStyles.popupButton,
                    button.primary ? popupStyles.primaryButton : popupStyles.secondaryButton,
                  ]}
                  onPress={() => {
                    if (button.onPress) button.onPress();
                    if (onClose) onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={button.primary ? ["#52B69A", "#1A759F"] : ["#4A5859", "#2C3333"]}
                    style={popupStyles.buttonGradient}
                  >
                    <Text style={popupStyles.popupButtonText}>{button.text}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const popupStyles = StyleSheet.create({
  popupOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  popupContainer: {
    width: screenWidth * 0.8,
    backgroundColor: '#2A2B2A',
    borderWidth: 4,
    borderColor: '#52B69A',
    borderRadius: 8,
    overflow: 'hidden',
  },
  popupHeader: {
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#52B69A',
  },
  popupTitle: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
  },
  popupBody: {
    padding: 20,
    alignItems: 'center',
  },
  popupMessage: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  popupButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  popupButton: {
    minWidth: 100,
    marginHorizontal: 5,
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  primaryButton: {
    borderColor: '#FFD700',
  },
  secondaryButton: {
    borderColor: '#FFF',
  },
  buttonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  popupButtonText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 10,
  },
});

export default function ShopScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [buying, setBuying] = useState(false);
  const [tab, setTab] = useState('shop'); // 'shop' or 'inventory'
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupButtons, setPopupButtons] = useState([]);
  
  // Get parameters from navigation if available
  const focusAnimal = route.params?.focusAnimal;
  const recommendedItems = route.params?.recommendedItems || [];
  
  // Reference to FlatList for scrolling to recommended items
  const flatListRef = useRef(null);

  useEffect(() => {
    loadShopItems();
    loadUserData();
    loadInventory();
  }, []);

  // Filter foods when data is loaded or focusAnimal changes
  useEffect(() => {
    if (foods.length > 0) {
      if (focusAnimal) {
        // Filter foods for the specific animal
        const animalFoods = foods.filter(item => 
          item.animal && item.animal.includes(focusAnimal)
        );
        setFilteredFoods(animalFoods);
        
        // Find first recommended item index to scroll to
        if (recommendedItems.length > 0 && flatListRef.current) {
          const firstRecommendedIndex = foods.findIndex(item => 
            recommendedItems.includes(item._id)
          );
          
          if (firstRecommendedIndex !== -1) {
            setTimeout(() => {
              flatListRef.current.scrollToIndex({
                index: firstRecommendedIndex,
                animated: true,
                viewPosition: 0.5
              });
            }, 500);
          }
        }
      } else {
        // No filter, show all foods
        setFilteredFoods(foods);
      }
    }
  }, [foods, focusAnimal, recommendedItems]);

  const loadUserData = async () => {
    try {
      const userData = await ApiService.getUserData();
      setUser(userData);
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
  };

  const loadShopItems = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getShopItems();
      setFoods(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load shop items:', err);
      setError('Failed to load shop items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadInventory = async () => {
    try {
      setLoadingInventory(true);
      const data = await ApiService.getInventory();
      setInventory(data);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoadingInventory(false);
    }
  };

  const showPopup = (title, message, buttons = [{ text: 'OK', primary: true }]) => {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupButtons(buttons);
    setPopupVisible(true);
  };

  const handleBuy = async (item) => {
    try {
      if (!user) {
        showPopup('Error', 'You need to be logged in to buy items');
        return;
      }

      if (user.points < item.price) {
        showPopup('Not enough points', `You need ${item.price} points to buy this item. You have ${user.points} points.`);
        return;
      }

      setBuying(true);
      const result = await ApiService.buyShopItem(item._id);
      // Update local user data with new points
      const updatedUser = { ...user, points: result.remainingPoints };
      await ApiService.setUserData(updatedUser);
      setUser(updatedUser);
      // Refresh inventory
      await loadInventory();
      showPopup('Success', `You bought ${item.name} for your ${item.animal.join(', ')}!`);
    } catch (err) {
      showPopup('Error', err.message || 'Failed to buy item');
    } finally {
      setBuying(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const isRecommended = (itemId) => {
    return recommendedItems.includes(itemId);
  };

  // Handle scroll error for flatlist
  const handleScrollToIndexFailed = (info) => {
    const wait = new Promise(resolve => setTimeout(resolve, 500));
    wait.then(() => {
      flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
    });
  };

  if (loading) {
    return (
      <LinearGradient colors={["#1a4d2e", "#2d5a3d", "#1a4d2e"]} style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      </LinearGradient>
    );
  }
  
  if (error) {
    return (
      <LinearGradient colors={["#1a4d2e", "#2d5a3d", "#1a4d2e"]} style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadShopItems}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#1a4d2e", "#2d5a3d", "#1a4d2e"]} style={styles.container}>
      {/* Header with Back Button and Title */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {focusAnimal ? `${focusAnimal} FOOD` : 'ANIMAL FOOD SHOP'}
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'shop' && styles.activeTab]}
          onPress={() => setTab('shop')}
        >
          <Text style={[styles.tabText, tab === 'shop' && styles.activeTabText]}>Shop</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'inventory' && styles.activeTab]}
          onPress={() => setTab('inventory')}
        >
          <Text style={[styles.tabText, tab === 'inventory' && styles.activeTabText]}>Inventory</Text>
        </TouchableOpacity>
      </View>

      {/* Points Display */}
      {user && (
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsText}>⭐ {user.points} POINTS</Text>
        </View>
      )}

      {/* Tab Content */}
      {tab === 'shop' ? (
        <FlatList
          ref={flatListRef}
          data={filteredFoods}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <View style={[
                styles.card, 
                isRecommended(item._id) && styles.recommendedCard
              ]}>
                {isRecommended(item._id) && (
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>Recommended</Text>
                  </View>
                )}
                <Image source={{ uri: item.image }} style={styles.image} />
                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.price}>⭐ {item.price} POINTS</Text>
                  <Text style={styles.animals}>For: {item.animal.join(', ')}</Text>
                  <Text style={styles.desc}>{item.description}</Text>
                  <TouchableOpacity 
                    style={[
                      styles.buyBtn,
                      { borderColor: '#FFD700', borderTopColor: '#FFD700' + '80', borderLeftColor: '#FFD700' + '80' },
                      buying ? styles.buyingBtn : null,
                      (!user || user.points < item.price) ? styles.disabledBtn : null
                    ]}
                    onPress={() => handleBuy(item)}
                    disabled={buying || !user || user.points < item.price}
                  >
                    <Text style={styles.buyText}>
                      {buying ? 'BUYING...' : 'BUY'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContainer}
          onScrollToIndexFailed={handleScrollToIndexFailed}
        />
      ) : (
        loadingInventory ? (
          <View style={styles.center}><ActivityIndicator size="large" color="#FFD700" /></View>
        ) : (
          <FlatList
            data={inventory}
            keyExtractor={item => item._id}
            renderItem={({ item }) => (
              <View style={styles.cardWrapper}>
                <View style={styles.card}>
                  <Image source={{ uri: item.food.image }} style={styles.image} />
                  <View style={styles.info}>
                    <Text style={styles.name}>{item.food.name}</Text>
                    <Text style={styles.price}>Qty: {item.quantity}</Text>
                    <Text style={styles.animals}>For: {item.food.animal.join(', ')}</Text>
                    <Text style={styles.desc}>{item.food.description}</Text>
                  </View>
                </View>
              </View>
            )}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={<Text style={styles.emptyText}>No items in your inventory yet.</Text>}
          />
        )
      )}
      <CustomPopup
        visible={popupVisible}
        title={popupTitle}
        message={popupMessage}
        buttons={popupButtons.map(btn => ({
          ...btn,
          onPress: btn.onPress || (() => setPopupVisible(false)),
        }))}
        onClose={() => setPopupVisible(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    padding: 10,
  },
  backButtonText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 14,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  headerTitle: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 18,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 2,
    backgroundColor: 'rgba(139,69,19,0.7)',
    borderRadius: 8,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#FFD70022',
    borderBottomColor: '#FFD700',
  },
  tabText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#fff',
    fontSize: 13,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  activeTabText: {
    color: '#FFD700',
  },
  pointsContainer: {
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 10,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  pointsText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 16,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  listContainer: {
    padding: 16,
  },
  cardWrapper: {
    width: '100%',
    marginBottom: 15,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#8B4513',
    borderWidth: 3,
    borderColor: '#3d2914',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 6,
  },
  recommendedCard: {
    borderColor: '#FFD700',
    borderWidth: 3,
  },
  recommendedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    zIndex: 1,
  },
  recommendedText: {
    color: '#8B4513',
    fontSize: 10,
    fontWeight: 'bold',
  },
  image: { 
    width: 100, 
    height: 100, 
    resizeMode: 'contain',
    borderRightWidth: 3,
    borderRightColor: '#3d2914',
  },
  info: { 
    flex: 1, 
    padding: 12 
  },
  name: { 
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 14, 
    color: '#FFD700',
    marginBottom: 6,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  price: { 
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 12, 
    color: '#4ade80', 
    marginBottom: 6,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  animals: { 
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 10, 
    color: '#60a5fa', 
    marginBottom: 6,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  desc: { 
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 8, 
    color: '#fff', 
    marginBottom: 10,
    lineHeight: 14,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  buyBtn: {
    backgroundColor: '#8B4513',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 3,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 3,
  },
  buyingBtn: {
    borderColor: '#888',
    borderTopColor: '#888' + '80', 
    borderLeftColor: '#888' + '80',
  },
  disabledBtn: {
    borderColor: '#666',
    borderTopColor: '#666' + '80', 
    borderLeftColor: '#666' + '80',
    opacity: 0.7,
  },
  buyText: { 
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700', 
    fontSize: 10,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  errorText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#f87171',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  retryButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  retryText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 12,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  emptyText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  }
});
