import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Animated, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import audioService from '../../../../services/audio.service';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Card images for the memory game - these would be replaced with actual rabbit-themed images
const cardImages = [
  { id: '1', image: require('../../../../../assets/images/levels/Level1/forest.png') },
  { id: '2', image: require('../../../../../assets/images/levels/Level1/360.png') },
  { id: '3', image: require('../../../../../assets/images/levels/Level1/rabbit-teeth.png') },
  { id: '4', image: require('../../../../../assets/images/levels/Level1/rabbit-jump.png') },
  { id: '5', image: require('../../../../../assets/images/levels/Level1/carrots.png') },
  { id: '6', image: require('../../../../../assets/images/levels/Level1/no-pesticides.png') },
];

export default function Level1Screen() {
  const navigation = useNavigation();
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(60); // 60 seconds game time
  const timerRef = useRef(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  
  // Sound effects
  const playSoundEffect = (type) => {
    // You would implement different sound effects here
    // For example: audioService.playSound(type);
  };
  
  // Initialize the game
  useEffect(() => {
    startGame();
    
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      })
    ]).start();
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
  
  // Start game timer
  useEffect(() => {
    if (timer > 0 && !gameComplete) {
      timerRef.current = setInterval(() => {
        setTimer(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            if (!gameComplete) handleGameOver(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameComplete]);
  
  // Check for matches when two cards are flipped
  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      
      if (cards[first].id === cards[second].id) {
        setMatched(prev => [...prev, first, second]);
        setScore(prev => prev + 100);
        playSoundEffect('match');
        setFlipped([]);
      } else {
        // If no match, flip back after a delay
        setTimeout(() => {
          setFlipped([]);
          playSoundEffect('nomatch');
        }, 1000);
      }
      
      setMoves(prev => prev + 1);
    }
  }, [flipped]);
  
  // Check if game is complete
  useEffect(() => {
    if (matched.length > 0 && matched.length === cards.length) {
      handleGameOver(true);
    }
  }, [matched]);
  
  const startGame = () => {
    // Create card deck with pairs
    const duplicatedCards = [...cardImages, ...cardImages]
      .map((card, index) => ({...card, uniqueId: index}))
      .sort(() => Math.random() - 0.5);
    
    setCards(duplicatedCards);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameComplete(false);
    setTimer(60);
    setScore(0);
    
    if (timerRef.current) clearInterval(timerRef.current);
  };
  
  const handleCardPress = (index) => {
    // Ignore if card is already flipped or matched
    if (flipped.includes(index) || matched.includes(index) || flipped.length >= 2) {
      return;
    }
    
    playSoundEffect('flip');
    setFlipped(prev => [...prev, index]);
  };
  
  const handleGameOver = (isWin) => {
    clearInterval(timerRef.current);
    setGameComplete(true);
    
    if (isWin) {
      playSoundEffect('win');
      // Calculate final score based on moves and time left
      const timeBonus = timer * 5;
      const movesPenalty = Math.max(0, moves - cards.length/2) * 10;
      const finalScore = score + timeBonus - movesPenalty;
      setScore(finalScore);
      
      setTimeout(() => {
        Alert.alert(
          "Level Complete!",
          `You matched all the cards!\nScore: ${finalScore}\nTime left: ${timer}s\nMoves: ${moves}`,
          [
            { text: "Continue", onPress: () => navigation.goBack() }
          ]
        );
      }, 1000);
    } else {
      playSoundEffect('lose');
      setTimeout(() => {
        Alert.alert(
          "Time's Up!",
          "You ran out of time. Try again?",
          [
            { text: "Retry", onPress: () => startGame() },
            { text: "Exit", onPress: () => navigation.goBack() }
          ]
        );
      }, 1000);
    }
  };
  
  const handleGoBack = () => {
    navigation.goBack();
  };
  
  const renderCard = (index) => {
    const isFlipped = flipped.includes(index) || matched.includes(index);
    
    return (
      <TouchableOpacity 
        key={index}
        style={[styles.card, isFlipped ? styles.cardFlipped : {}]}
        onPress={() => handleCardPress(index)}
        activeOpacity={0.9}
      >
        {isFlipped ? (
          <Image 
            source={cards[index].image} 
            style={styles.cardImage} 
            resizeMode="contain"
          />
        ) : (
          <View style={styles.cardBack}>
            <Text style={styles.cardBackText}>?</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A3C40', '#0D1B1E']}
        style={styles.background}
      >
        {/* Game Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← EXIT</Text>
          </TouchableOpacity>
          
          <View style={styles.gameInfo}>
            <Text style={styles.gameTitle}>MEMORY GAME</Text>
            <Text style={styles.levelText}>LEVEL 1</Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>TIME</Text>
              <Text style={[styles.statValue, timer < 10 ? styles.lowTime : {}]}>{timer}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>SCORE</Text>
              <Text style={styles.statValue}>{score}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>MOVES</Text>
              <Text style={styles.statValue}>{moves}</Text>
            </View>
          </View>
        </View>
        
        {/* Game Board */}
        <Animated.View 
          style={[
            styles.gameBoard,
            {
              opacity: fadeAnim,
              transform: [
                { scale: bounceAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1]
                })}
              ]
            }
          ]}
        >
          {cards.map((_, index) => renderCard(index))}
        </Animated.View>
        
        {/* Game Controls */}
        <View style={styles.controls}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={startGame}
          >
            <LinearGradient
              colors={['#52B69A', '#1A759F']}
              style={styles.controlButtonGradient}
            >
              <Text style={styles.controlButtonText}>RESTART</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => {
              // Toggle sound
              audioService.toggleMusic();
            }}
          >
            <LinearGradient
              colors={['#52B69A', '#1A759F']}
              style={styles.controlButtonGradient}
            >
              <Ionicons name="volume-medium" size={14} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
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
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 12,
  },
  gameInfo: {
    alignItems: 'center',
    marginLeft: 80,
  },
  gameTitle: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 16,
    marginBottom: 5,
  },
  levelText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  statLabel: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 8,
  },
  statValue: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 14,
  },
  lowTime: {
    color: '#FF6B6B',
  },
  gameBoard: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  card: {
    width: screenWidth * 0.13,
    height: screenHeight * 0.25,
    margin: 10,
    borderRadius: 8,
    backgroundColor: '#2A2B2A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
    overflow: 'hidden',
  },
  cardFlipped: {
    backgroundColor: '#3E4E50',
  },
  cardImage: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
  },
  cardBack: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1A3C40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBackText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 24,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  controlButton: {
    marginHorizontal: 10,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  controlButtonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    // Add these properties to ensure the gradient fills the button properly
    borderRadius: 8,
    overflow: 'hidden',
  },
  controlButtonText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 10,
  },
});
