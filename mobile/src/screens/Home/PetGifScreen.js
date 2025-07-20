import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Image as RNImage, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import ApiService from '../../services/api.service';

const PET_VIDEOS = {
  1: require('../../../assets/images/pets/rabbitt.mp4'),
  2: require('../../../assets/images/pets/squirell.mp4'),
  3: require('../../../assets/images/pets/duckk.mp4'),
  4: require('../../../assets/images/pets/butterflyy.mp4'),
  5: require('../../../assets/images/pets/frogg.mp4'),
  6: require('../../../assets/images/pets/redfoxx.mp4'),
  7: require('../../../assets/images/pets/racconn.mp4'),
  8: require('../../../assets/images/pets/owll.mp4'),
  9: require('../../../assets/images/pets/beaverr.mp4'),
  10: require('../../../assets/images/pets/turtlee.mp4'),
  11: require('../../../assets/images/pets/leopardd.mp4'),
  12: require('../../../assets/images/pets/orangutann.mp4'),
  13: require('../../../assets/images/pets/seaturtlee.mp4'),
  14: require('../../../assets/images/pets/baldeaglee.mp4'),
  15: require('../../../assets/images/pets/bluedartt.mp4')
};

const ANIMAL_NAMES = {
  1: 'Rabbit', 2: 'Squirrel', 3: 'Duck', 4: 'Butterfly', 5: 'Frog',
  6: 'Red Fox', 7: 'Raccoon', 8: 'Owl', 9: 'Beaver', 10: 'Turtle',
  11: 'Snow Leopard', 12: 'Orangutan', 13: 'Sea Turtle', 14: 'Bald Eagle', 15: 'Poison Dart',
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function PetGifScreen({ route, navigation }) {
  const { levelId } = route.params;
  const video = PET_VIDEOS[levelId];
  const animalName = ANIMAL_NAMES[levelId] || 'Animal';
  const [fed, setFed] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [animalFoods, setAnimalFoods] = useState([]);
  const [selectedFoodIndex, setSelectedFoodIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shopItems, setShopItems] = useState([]);
  const [loadingShop, setLoadingShop] = useState(false);
  const [feeding, setFeeding] = useState(false);

  // Animation references
  const shineAnim = useRef(new Animated.Value(0)).current;
  const healthAnim = useRef(new Animated.Value(0)).current;
  const healthScaleAnim = useRef(new Animated.Value(0.5)).current;
  const healthOpacityAnim = useRef(new Animated.Value(0)).current;
  const videoGlowAnim = useRef(new Animated.Value(0)).current;

  // Load shop items for this animal
  const loadShopItems = async () => {
    if (loadingShop) return;
    
    setLoadingShop(true);
    try {
      const items = await ApiService.getShopItems();
      // Filter items for this animal
      const animalItems = items.filter(item => 
        item.animal && item.animal.includes(animalName)
      );
      setShopItems(animalItems);
    } catch (err) {
      console.error('Failed to load shop items:', err);
    } finally {
      setLoadingShop(false);
    }
  };

  // Load inventory and filter foods for this animal
  React.useEffect(() => {
    const loadInventory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ApiService.getInventory();
        setInventory(data);
        // Filter foods for this animal
        const foodsForAnimal = data.filter(item =>
          item.food && item.food.animal && item.food.animal.some(a => a.toLowerCase() === animalName.toLowerCase())
        );
        setAnimalFoods(foodsForAnimal);
        setSelectedFoodIndex(0);
        
        // If no foods for this animal, load shop items
        if (foodsForAnimal.length === 0) {
          loadShopItems();
        }
      } catch (err) {
        setError('Failed to load inventory.');
      } finally {
        setLoading(false);
      }
    };
    loadInventory();
  }, [animalName]);

  // Navigate to shop
  const goToShop = () => {
    navigation.navigate('Shop', { 
      focusAnimal: animalName,
      recommendedItems: shopItems.map(item => item._id)
    });
  };

  // Feeding logic
  const handleFeed = async () => {
    if (!animalFoods[selectedFoodIndex] || feeding) return;
    
    const foodItem = animalFoods[selectedFoodIndex];
    setFeeding(true);
    
    try {
      // Animate shine and health effects
      shineAnim.setValue(0);
      healthAnim.setValue(0);
      healthScaleAnim.setValue(0.5);
      healthOpacityAnim.setValue(0);
      videoGlowAnim.setValue(0);
      
      // Shine effect animation
      Animated.timing(shineAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start(() => shineAnim.setValue(0));
      
      // Video glow animation
      Animated.sequence([
        Animated.timing(videoGlowAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }),
        Animated.timing(videoGlowAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: false,
        })
      ]).start();
      
      // Health increase animation
      Animated.sequence([
        // Show the health symbol
        Animated.timing(healthOpacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        // Scale it up
        Animated.parallel([
          Animated.timing(healthScaleAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          // Rotate the health symbol
          Animated.timing(healthAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          })
        ]),
        // Fade out
        Animated.timing(healthOpacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
      
      // Update inventory
      await ApiService.consumeFood(foodItem.food._id);
      setFed(true);
      
      setTimeout(() => {
        setFed(false);
        // Update inventory and foods
        const updatedFoods = animalFoods.map((item, idx) =>
          idx === selectedFoodIndex ? { ...item, quantity: item.quantity - 1 } : item
        ).filter(item => item.quantity > 0);
        setAnimalFoods(updatedFoods);
        setSelectedFoodIndex(0);
        
        // If no more food, load shop items
        if (updatedFoods.length === 0) {
          loadShopItems();
        }
        setFeeding(false);
      }, 1000);
    } catch (err) {
      setError('Failed to feed animal.');
      setFeeding(false);
    }
  };

  // Render shop items section
  const renderShopItems = () => {
    if (loadingShop) {
      return <Text style={styles.statusText}>Loading available food...</Text>;
    }
    
    if (shopItems.length === 0) {
      return <Text style={styles.statusText}>No food available for this animal.</Text>;
    }
    
    return (
      <View style={styles.shopContainer}>
        <Text style={styles.shopTitle}>Available Food</Text>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.shopItemsContainer}
        >
          {shopItems.map(item => (
            <View key={item._id} style={styles.shopItem}>
              <RNImage 
                source={{ uri: item.image }} 
                style={styles.shopItemImage} 
                resizeMode="contain"
              />
              <View style={styles.shopItemDetails}>
                <Text style={styles.shopItemName}>{item.name}</Text>
                <Text style={styles.shopItemPrice}>⭐ {item.price}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.buyButton} onPress={goToShop}>
          <Text style={styles.buyButtonText}>Buy Food</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#FFD700" />
      </TouchableOpacity>
      
      <View style={styles.content}>
        <View style={styles.mainContent}>
          <Animated.View
            style={[
              styles.videoWrapper, 
              styles.dropArea,
              { 
                shadowColor: '#FFD700',
                shadowOpacity: videoGlowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.8]
                }),
                shadowRadius: videoGlowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 15]
                }),
                shadowOffset: { width: 0, height: 0 },
                elevation: videoGlowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 10]
                }),
              }
            ]}
          >
            {video && (
              <Video
                source={video}
                style={styles.video}
                resizeMode="contain"
                isLooping
                shouldPlay
              />
            )}
            {/* Shine effect overlay (Animated) */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.shineEffect,
                { opacity: shineAnim }
              ]}
            />
            {/* Health increase effect */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.healthContainer,
                {
                  opacity: healthOpacityAnim,
                  transform: [
                    { scale: healthScaleAnim },
                    { rotate: healthAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg']
                      })
                    }
                  ]
                }
              ]}
            >
              <View style={styles.healthSymbol}>
                <View style={styles.healthVertical} />
                <View style={styles.healthHorizontal} />
              </View>
              {/* Health particles */}
              {[...Array(5)].map((_, i) => (
                <Animated.View 
                  key={i}
                  style={[
                    styles.healthParticle,
                    {
                      top: `${20 + i * 15}%`,
                      left: `${15 + i * 15}%`,
                      opacity: healthAnim.interpolate({
                        inputRange: [0, 0.3, 1],
                        outputRange: [0, 0.8, 0]
                      }),
                      transform: [
                        { translateY: healthAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -30]
                          })
                        }
                      ]
                    }
                  ]}
                />
              ))}
            </Animated.View>
            {fed && (
              <Text style={styles.fedText}>Yum! 😋</Text>
            )}
          </Animated.View>
          
          <Text style={styles.animalName}>{animalName}</Text>
          
          {/* Food selection UI */}
          {loading ? (
            <Text style={styles.statusText}>Loading food...</Text>
          ) : error ? (
            <Text style={[styles.statusText, { color: '#FF6B6B' }]}>{error}</Text>
          ) : animalFoods.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.foodRowContainer}>
              {animalFoods.map((item, idx) => (
                <View key={item._id || idx} style={styles.foodRowHorizontal}>
                  <TouchableOpacity 
                    onPress={() => setSelectedFoodIndex(idx)}
                    style={[
                      styles.foodItem,
                      idx === selectedFoodIndex && styles.selectedFoodItem
                    ]}
                  >
                    <RNImage
                      source={{ uri: item.food.image }}
                      style={styles.foodImage}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  <Text style={styles.foodQuantity}>x{item.quantity}</Text>
                  <TouchableOpacity
                    style={[
                      styles.feedButton,
                      feeding && idx === selectedFoodIndex && styles.feedingButton
                    ]}
                    onPress={() => {
                      setSelectedFoodIndex(idx);
                      handleFeed();
                    }}
                    disabled={feeding && idx === selectedFoodIndex}
                  >
                    <Text style={styles.feedButtonText}>
                      {feeding && idx === selectedFoodIndex ? 'Feeding...' : 'Feed'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.noFoodText}>No bought food for this animal</Text>
          )}
        </View>
        
        {/* Shop items on the right */}
        {animalFoods.length === 0 && (
          <View style={styles.sideContent}>
            {renderShopItems()}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 15,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 18,
    padding: 5,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
  },
  mainContent: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sideContent: {
    flex: 2,
    height: '100%',
    justifyContent: 'center',
    paddingLeft: 5,
    maxWidth: 130,
  },
  videoWrapper: {
    width: screenWidth * 0.6,
    height: screenWidth * 0.6,
    maxWidth: 250,
    maxHeight: 250,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FFD700',
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
    overflow: 'hidden',
  },
  dropArea: {
    borderStyle: 'dashed',
    borderColor: '#FFD700',
    backgroundColor: 'rgba(20, 20, 20, 0.9)',
  },
  video: {
    width: '95%',
    height: '95%',
    borderRadius: 18,
  },
  animalName: {
    color: '#FFD700',
    fontSize: 18,
    fontFamily: 'PressStart2P_400Regular',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  statusText: {
    color: '#FFD700',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  noFoodText: {
    color: '#FFD700',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  foodListContainer: {
    width: '100%',
    marginTop: 8,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  foodItem: {
    marginRight: 8,
    padding: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  selectedFoodItem: {
    borderWidth: 2,
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255,215,0,0.2)',
  },
  foodImage: {
    width: 40,
    height: 40,
  },
  foodQuantity: {
    color: '#FFD700',
    fontSize: 14,
    marginRight: 12,
    minWidth: 32,
    textAlign: 'center',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  feedButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
    borderTopColor: 'rgba(255,215,0,0.5)',
    borderLeftColor: 'rgba(255,215,0,0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 3,
  },
  feedingButton: {
    opacity: 0.7,
    borderColor: '#888',
  },
  feedButtonText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  shineEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 10,
    backgroundColor: 'rgba(255,255,200,0.35)',
    borderRadius: 20,
  },
  healthContainer: {
    position: 'absolute',
    top: '30%',
    left: '30%',
    width: '40%',
    height: '40%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 11,
  },
  healthSymbol: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthVertical: {
    position: 'absolute',
    width: '20%',
    height: '100%',
    backgroundColor: '#4ade80', // Green color
    borderRadius: 4,
  },
  healthHorizontal: {
    position: 'absolute',
    width: '100%',
    height: '20%',
    backgroundColor: '#4ade80', // Green color
    borderRadius: 4,
  },
  healthParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ade80',
  },
  fedText: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#FFD700',
    fontSize: 22,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  // Shop items styles
  shopContainer: {
    width: '100%',
    height: '85%',
    alignItems: 'center',
  },
  shopTitle: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  shopItemsContainer: {
    paddingVertical: 5,
  },
  shopItem: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 5,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  shopItemImage: {
    width: 40,
    height: 40,
  },
  shopItemDetails: {
    flex: 1,
    paddingLeft: 5,
  },
  shopItemName: {
    color: '#FFD700',
    fontSize: 10,
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  shopItemPrice: {
    color: '#4ade80',
    fontSize: 10,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  buyButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 5,
    borderWidth: 2,
    borderColor: '#FFD700',
    borderTopColor: 'rgba(255,215,0,0.5)',
    borderLeftColor: 'rgba(255,215,0,0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  buyButtonText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  foodRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 2,
  },
  foodRowHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
}); 