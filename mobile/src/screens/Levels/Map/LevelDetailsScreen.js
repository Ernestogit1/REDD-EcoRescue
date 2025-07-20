import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Animated, ImageBackground, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../../services/api.service';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isLandscape = screenWidth > screenHeight;

// Helper function to get star count based on conservation status
const getConservationStars = (status) => {
  if (status.includes('Critically Endangered')) return 1;
  if (status.includes('Endangered')) return 2;
  if (status.includes('Vulnerable')) return 3;
  if (status.includes('Threatened') || status.includes('Near Threatened')) return 4;
  if (status.includes('Concern')) return 9; // Least Concern
  return 6; // Default for "Varies by species" or other statuses
};

// Static animal data for all levels
const animalData = {
  // Easy Levels
  1: {
    animalName: "Rabbit",
    habitat: "Woodlands, Meadows, and Forests",
    diet: "Herbivore",
    conservationStatus: "Least Concern",
    funFacts: [
      "Rabbits can jump up to 3 feet high and 9 feet long",
      "A rabbit's teeth never stop growing",
      "Rabbits can see almost 360 degrees around them"
    ],
    howToHelp: [
      "Plant native plants in your garden",
      "Don't use pesticides that can harm rabbits",
      "Support wildlife corridors in your community"
    ],
    image: require('../../../../assets/images/levels/easy.png'),
    difficulty: "Easy"
  },
  2: {
    animalName: "Squirrel",
    habitat: "Forests and Urban Parks",
    diet: "Omnivore",
    conservationStatus: "Least Concern",
    funFacts: [
      "Squirrels can find food buried beneath a foot of snow",
      "They plant thousands of trees by forgetting where they buried nuts",
      "Squirrels can rotate their ankles 180 degrees"
    ],
    howToHelp: [
      "Plant native trees that provide nuts and seeds",
      "Create wildlife-friendly spaces in your yard",
      "Avoid trimming trees during nesting season"
    ],
    image: require('../../../../assets/images/levels/easy.png'),
    difficulty: "Easy"
  },
  3: {
    animalName: "Duck",
    habitat: "Wetlands, Lakes, and Ponds",
    diet: "Omnivore",
    conservationStatus: "Least Concern",
    funFacts: [
      "Ducks have waterproof feathers",
      "They can sleep with one eye open",
      "Baby ducks can swim as soon as they hatch"
    ],
    howToHelp: [
      "Never feed bread to ducks - it's bad for them",
      "Keep local water sources clean",
      "Support wetland conservation efforts"
    ],
    image: require('../../../../assets/images/levels/easy.png'),
    difficulty: "Easy"
  },
  4: {
    animalName: "Butterfly",
    habitat: "Gardens, Meadows, and Forests",
    diet: "Nectar from flowers",
    conservationStatus: "Varies by species",
    funFacts: [
      "Butterflies taste with their feet",
      "They go through complete metamorphosis",
      "Some butterflies migrate thousands of miles"
    ],
    howToHelp: [
      "Plant native flowers in your garden",
      "Avoid using pesticides",
      "Create butterfly watering stations"
    ],
    image: require('../../../../assets/images/levels/easy.png'),
    difficulty: "Easy"
  },
  5: {
    animalName: "Frog",
    habitat: "Ponds, Wetlands, and Damp Areas",
    diet: "Carnivore (Insects)",
    conservationStatus: "Many species are Threatened",
    funFacts: [
      "Frogs absorb water through their skin",
      "They can jump up to 20 times their body length",
      "Some frogs can change color"
    ],
    howToHelp: [
      "Create a small pond in your garden",
      "Reduce chemical use in your yard",
      "Support wetland conservation"
    ],
    image: require('../../../../assets/images/levels/easy.png'),
    difficulty: "Easy"
  },
  
  // Medium Levels
  6: {
    animalName: "Red Fox",
    habitat: "Forests, Grasslands, and Urban Areas",
    diet: "Omnivore",
    conservationStatus: "Least Concern",
    funFacts: [
      "Foxes have whiskers on their legs to help navigate",
      "They can hear rodents digging underground",
      "Red foxes are found on every continent except Antarctica"
    ],
    howToHelp: [
      "Drive carefully in areas where foxes live",
      "Keep pets indoors at night in fox areas",
      "Support wildlife-friendly urban planning"
    ],
    image: require('../../../../assets/images/levels/easy.png'),
    difficulty: "Medium"
  },
  7: {
    animalName: "Raccoon",
    habitat: "Forests and Urban Areas",
    diet: "Omnivore",
    conservationStatus: "Least Concern",
    funFacts: [
      "Raccoons can remember solutions to tasks for up to three years",
      "They wash their food before eating it",
      "Their hands have sensitive touch receptors"
    ],
    howToHelp: [
      "Secure trash cans to prevent conflicts",
      "Never feed wild raccoons",
      "Support urban wildlife management programs"
    ],
    image: require('../../../../assets/images/levels/easy.png'),
    difficulty: "Medium"
  },
  8: {
    animalName: "Owl",
    habitat: "Forests, Deserts, and Grasslands",
    diet: "Carnivore",
    conservationStatus: "Varies by species",
    funFacts: [
      "Owls can rotate their heads up to 270 degrees",
      "They have special feathers for silent flight",
      "Some owl species can hear prey under snow"
    ],
    howToHelp: [
      "Preserve old trees that provide nesting sites",
      "Avoid using rodenticides that harm owls",
      "Install owl nesting boxes"
    ],
    image: require('../../../../assets/images/levels/easy.png'),
    difficulty: "Medium"
  },
  9: {
    animalName: "Beaver",
    habitat: "Rivers, Lakes, and Wetlands",
    diet: "Herbivore",
    conservationStatus: "Least Concern",
    funFacts: [
      "Beavers can hold their breath underwater for 15 minutes",
      "Their teeth never stop growing",
      "Beaver dams create habitats for many other species"
    ],
    howToHelp: [
      "Support stream and river conservation",
      "Learn about beaver management solutions",
      "Educate others about beavers' ecological importance"
    ],
    image: require('../../../../assets/images/levels/easy.png'),
    difficulty: "Medium"
  },
  10: {
    animalName: "Turtle",
    habitat: "Lakes, Rivers, and Wetlands",
    diet: "Omnivore",
    conservationStatus: "Many species are Threatened",
    funFacts: [
      "Some turtles can live over 100 years",
      "Turtles have existed for over 200 million years",
      "They can feel through their shell"
    ],
    howToHelp: [
      "Never release pet turtles into the wild",
      "Help turtles cross roads safely",
      "Reduce plastic pollution that harms aquatic turtles"
    ],
    image: require('../../../../assets/images/levels/easy.png'),
    difficulty: "Medium"
  },
  
  // Hard Levels
  11: {
    animalName: "Snow Leopard",
    habitat: "Mountain Ranges of Central Asia",
    diet: "Carnivore",
    conservationStatus: "Vulnerable",
    funFacts: [
      "Snow leopards can jump six times their body length",
      "Their thick tails help with balance and warmth",
      "They're sometimes called 'ghosts of the mountains'"
    ],
    howToHelp: [
      "Support conservation organizations",
      "Learn about climate change impacts on mountain habitats",
      "Spread awareness about endangered species"
    ],
    image: require('../../../../assets/images/levels/easy.png'),
    difficulty: "Hard"
  },
  12: {
    animalName: "Orangutan",
    habitat: "Rainforests of Borneo and Sumatra",
    diet: "Herbivore (Primarily Fruit)",
    conservationStatus: "Critically Endangered",
    funFacts: [
      "Orangutans share 97% of their DNA with humans",
      "They make new sleeping nests every night",
      "Baby orangutans stay with their mothers for up to 8 years"
    ],
    howToHelp: [
      "Avoid products with unsustainable palm oil",
      "Support rainforest conservation efforts",
      "Recycle paper products to reduce deforestation"
    ],
    image: require('../../../../assets/images/levels/easy.png'),
    difficulty: "Hard"
  },
  13: {
    animalName: "Sea Turtle",
    habitat: "Oceans Worldwide",
    diet: "Varies by species",
    conservationStatus: "Endangered",
    funFacts: [
      "Sea turtles return to the same beach where they were born to lay eggs",
      "They can hold their breath for hours underwater",
      "Some species can live up to 100 years"
    ],
    howToHelp: [
      "Reduce plastic use to keep oceans clean",
      "Turn off lights near nesting beaches",
      "Support beach clean-up efforts"
    ],
    image: require('../../../../assets/images/levels/easy.png'),
    difficulty: "Hard"
  },
  14: {
    animalName: "Bald Eagle",
    habitat: "Near large bodies of water with old-growth trees",
    diet: "Carnivore",
    conservationStatus: "Least Concern (Recovered)",
    funFacts: [
      "Bald eagles can spot prey from 2 miles away",
      "Their nests can weigh up to 2,000 pounds",
      "They were once endangered but have recovered"
    ],
    howToHelp: [
      "Keep waterways clean from pollution",
      "Support habitat protection for nesting sites",
      "Learn about conservation success stories"
    ],
    image: require('../../../../assets/images/levels/easy.png'),
    difficulty: "Hard"
  },
  15: {
    animalName: "Poison Dart Frog",
    habitat: "Rainforests of Central and South America",
    diet: "Carnivore (Small insects)",
    conservationStatus: "Varies by species",
    funFacts: [
      "Their bright colors warn predators they're toxic",
      "They get their toxins from their diet in the wild",
      "Some species care for their tadpoles individually"
    ],
    howToHelp: [
      "Support rainforest conservation",
      "Learn about amphibian decline worldwide",
      "Reduce use of chemicals that harm amphibians"
    ],
    image: require('../../../../assets/images/levels/easy.png'),
    difficulty: "Hard"
  }
};

export default function LevelDetailsScreen({ route }) {
  const navigation = useNavigation();
  const { level, difficulty } = route.params;
  const animal = animalData[level];
  const conservationStars = getConservationStars(animal.conservationStatus);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const detailsAnim = useRef(new Animated.Value(0)).current;

  const [isCollecting, setIsCollecting] = useState(false);
  const [collected, setCollected] = useState(false);
  const [collectError, setCollectError] = useState(null);

  useEffect(() => {
    // Card entrance animation
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(cardAnim, {
          toValue: 1,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(detailsAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        })
      ])
    ]).start();

    // Continuous shimmer animation
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const handleStartLevel = () => {
    // Navigate to the actual gameplay screen
    navigation.navigate('Play', { 
      difficulty: difficulty.toLowerCase(), 
      level: level 
    });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const getDifficultyColor = () => {
    switch(animal.difficulty) {
      case 'Easy': return ['#76C893', '#52B69A'];
      case 'Medium': return ['#FFB703', '#FB8500'];
      case 'Hard': return ['#E63946', '#D00000'];
      default: return ['#52B69A', '#1A759F'];
    }
  };

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200]
  });

  // Collect card handler
  const handleCollectCard = async () => {
    setIsCollecting(true);
    setCollectError(null);
    try {
      // Get auth token using ApiService
      const token = await ApiService.getAuthToken();
      if (!token) {
        setCollectError('User not authenticated');
        setIsCollecting(false);
        return;
      }
      // Prepare card data
      const cardData = {
        levelId: String(level),
        name: animal.animalName,
        image: animal.animalName, // Use animal name as a placeholder for image
        description: `${animal.animalName} - ${animal.habitat}`,
      };
      // Call backend
      const url = `${ApiService.baseURL.replace('/api/mobile', '')}/api/collected-cards/collect`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(cardData),
      });
      if (response.status === 201) {
        setCollected(true);
      } else if (response.status === 409) {
        setCollected(true);
        setCollectError('Card already collected!');
      } else {
        const data = await response.json();
        setCollectError(data.message || 'Failed to collect card');
      }
    } catch (err) {
      setCollectError('Network error');
    }
    setIsCollecting(false);
  };

  // Render stars for conservation status
  const renderStars = () => {
    const totalStars = 9;
    const stars = [];
    
    for (let i = 0; i < totalStars; i++) {
      stars.push(
        <View 
          key={`star-${i}`} 
          style={[
            styles.star, 
            i < conservationStars ? styles.filledStar : styles.emptyStar
          ]}
        />
      );
    }
    
    return (
      <View style={styles.starsContainer}>
        {stars}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A3C40', '#0D1B1E']}
        style={styles.background}
      >
        {/* Header with Back Button, Title and Play Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← BACK</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>LEVEL {level}</Text>
          <TouchableOpacity style={styles.playButton} onPress={handleStartLevel}>
            <LinearGradient
              colors={['#FFB703', '#FB8500']}
              style={styles.playButtonGradient}
            >
              <Ionicons name="play" size={24} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        <View style={styles.contentContainer}>
          {/* Compact Animal Card */}
          <Animated.View 
            style={[
              styles.cardContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: cardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1]
                  })},
                  { rotateY: cardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['45deg', '0deg']
                  })}
                ]
              }
            ]}
          >
            {/* Card Header */}
            <LinearGradient
              colors={getDifficultyColor()}
              style={styles.cardHeader}
            >
              <Text style={styles.animalName}>{animal.animalName}</Text>
            </LinearGradient>
            
            {/* Card Image with Shimmer Effect */}
            <View style={styles.imageContainer}>
              <Image source={animal.image} style={styles.animalImage} />
              <Animated.View 
                style={[
                  styles.shimmerEffect,
                  {
                    transform: [{ translateX: shimmerTranslate }]
                  }
                ]}
              />
            </View>
            
            {/* Conservation Status Stars */}
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>STATUS</Text>
              {renderStars()}
            </View>
            
            {/* Diet */}
            <View style={styles.dietContainer}>
              <Text style={styles.dietLabel}>DIET</Text>
              <Text style={styles.dietValue}>{animal.diet}</Text>
            </View>
            
            {/* Card Footer with Collect Button */}
            <View style={styles.cardFooter}>
              {collected ? (
                <Text style={styles.cardFooterText}>Collected!</Text>
              ) : (
                <TouchableOpacity onPress={handleCollectCard} disabled={isCollecting} style={{ opacity: isCollecting ? 0.6 : 1 }}>
                  <Text style={styles.cardFooterText}>{isCollecting ? 'Collecting...' : 'Collect Card'}</Text>
                </TouchableOpacity>
              )}
              {collectError && (
                <Text style={[styles.cardFooterText, { color: '#FF6B6B', marginTop: 4 }]}>{collectError}</Text>
              )}
            </View>
          </Animated.View>
          
          {/* Detailed Information Section */}
          <Animated.View 
            style={[
              styles.detailsSection,
              {
                opacity: detailsAnim,
                transform: [{ translateX: detailsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                })}]
              }
            ]}
          >
            <ScrollView style={styles.detailsScroll}>
              <View style={styles.detailBlock}>
                <Text style={styles.detailTitle}>HABITAT</Text>
                <Text style={styles.detailText}>{animal.habitat}</Text>
              </View>
              
              <View style={styles.detailBlock}>
                <Text style={styles.detailTitle}>CONSERVATION</Text>
                <Text style={[
                  styles.detailText,
                  conservationStars <= 3 ? styles.endangered : {}
                ]}>
                  {animal.conservationStatus}
                </Text>
              </View>
              
              <View style={styles.detailBlock}>
                <Text style={styles.detailTitle}>FUN FACTS</Text>
                {animal.funFacts.map((fact, index) => (
                  <Text key={`fact-${index}`} style={styles.bulletText}>• {fact}</Text>
                ))}
              </View>
              
              <View style={styles.detailBlock}>
                <Text style={styles.detailTitle}>HOW YOU CAN HELP</Text>
                {animal.howToHelp.map((tip, index) => (
                  <Text key={`help-${index}`} style={styles.bulletText}>• {tip}</Text>
                ))}
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    paddingTop: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
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
  },
  headerTitle: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 18,
    textAlign: 'center',
  },
  playButton: {
    position: 'absolute',
    right: 30,
    width: 45,
    height: 40,
    borderRadius: 22.5,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  playButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'flex-start', // Changed from 'center' to 'flex-start' for better alignment
    justifyContent: 'space-between', // Changed from 'space-around' to 'space-between'
  },
  cardContainer: {
    width: isLandscape ? screenWidth * 0.25 : screenWidth * 0.4,
    backgroundColor: '#2A2B2A',
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFD700',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    height: isLandscape ? screenHeight * 0.8 : screenHeight * 0.6, // Fixed height instead of maxHeight
    alignSelf: 'flex-start', // Align to top
  },
  cardHeader: {
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
  },
  animalName: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
  },
  imageContainer: {
    height: isLandscape ? 140 : 120,
    backgroundColor: '#3E4E50',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  animalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  shimmerEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(251, 255, 0, 0.2)',
    transform: [{ skewX: '-20deg' }],
  },
  statusContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    alignItems: 'center',
  },
  statusLabel: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  star: {
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 2,
  },
  filledStar: {
    backgroundColor: '#FFD700',
  },
  emptyStar: {
    backgroundColor: '#555',
  },
  dietContainer: {
    padding: 10,
    alignItems: 'center',
  },
  dietLabel: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 10,
  },
  dietValue: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 10,
    textAlign: 'center',
  },
  cardFooter: {
    backgroundColor: '#1A3C40',
    padding: 8,
    alignItems: 'center',
    marginTop: 'auto', // Push to bottom of container
  },
  cardFooterText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 8,
    textAlign: 'center',
  },
  detailsSection: {
    flex: 1,
    backgroundColor: 'rgba(42, 43, 42, 0.8)',
    borderRadius: 15,
    padding: 15,
    marginLeft: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
    height: isLandscape ? screenHeight * 0.8 : screenHeight * 0.6, // Same fixed height as card
    alignSelf: 'flex-start', // Align to top
  },
  detailsScroll: {
    flex: 1,
  },
  detailBlock: {
    marginBottom: 15,
  },
  detailTitle: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 12,
    marginBottom: 8,
  },
  detailText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 10,
    lineHeight: 16,
  },
  bulletText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 9,
    marginBottom: 6,
    lineHeight: 14,
  },
  endangered: {
    color: '#FF6B6B',
  },
});

