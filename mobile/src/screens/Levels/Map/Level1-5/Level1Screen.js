import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Animated, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import audioService from '../../../../services/audio.service';
import ApiService from '../../../../services/api.service';

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

export default function Level1Screen({ route }) {
  const navigation = useNavigation();
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(60); // 60 seconds game time
  const [isPreviewPhase, setIsPreviewPhase] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState(''); // 'win' or 'lose'
  const [popupMessage, setPopupMessage] = useState({title: '', message: ''});
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardAnim] = useState(new Animated.Value(0));
  const timerRef = useRef(null);
  const previewTimerRef = useRef(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const popupAnim = useRef(new Animated.Value(0)).current;
  
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
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, []);
  
  // Start game timer
  useEffect(() => {
    if (timer > 0 && !gameComplete && !isPreviewPhase) {
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
  }, [gameComplete, isPreviewPhase]);
  
  // Check for matches when two cards are flipped
  useEffect(() => {
    if (flipped.length === 2 && !isPreviewPhase) {
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
  }, [flipped, isPreviewPhase]);
  
  // Check if game is complete
  useEffect(() => {
    if (matched.length > 0 && matched.length === cards.length) {
      handleGameOver(true);
    }
  }, [matched]);

  // Animate popup when it appears
  useEffect(() => {
    if (showPopup) {
      Animated.sequence([
        Animated.timing(popupAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(popupAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      popupAnim.setValue(0);
    }
  }, [showPopup]);
  
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
    setShowPopup(false);
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Start preview phase - show all cards
    setIsPreviewPhase(true);
    // Show all cards by setting all indices as flipped
    const allCardIndices = Array.from({ length: duplicatedCards.length }, (_, i) => i);
    setFlipped(allCardIndices);
    
    // After 3 seconds, hide all cards and start the game
    previewTimerRef.current = setTimeout(() => {
      setFlipped([]);
      setIsPreviewPhase(false);
    }, 3000);
  };
  
  const handleCardPress = (index) => {
    // Ignore card presses during preview phase
    if (isPreviewPhase) return;
    
    // Ignore if card is already flipped or matched
    if (flipped.includes(index) || matched.includes(index) || flipped.length >= 2) {
      return;
    }
    
    playSoundEffect('flip');
    setFlipped(prev => [...prev, index]);
  };
  
  const handleGameOver = (isWin) => {
    clearInterval(timerRef.current);
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    setGameComplete(true);
    
    if (isWin) {
      playSoundEffect('win');
      // Calculate final score based on moves and time left
      const timeBonus = timer * 5;
      const movesPenalty = Math.max(0, moves - cards.length/2) * 10;
      const finalScore = score + timeBonus - movesPenalty;
      setScore(finalScore);
      
      // Send points to backend
      ApiService.addPoints(finalScore).catch((err) => {
        console.error('Failed to add points:', err);
      });
      
      setTimeout(async () => {
        try {
          await ApiService.markLevelComplete(1);
          // Award collectible card
          await ApiService.awardCollectibleCard({ level: 1 });
          setShowCardModal(true);
          Animated.sequence([
            Animated.timing(cardAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true
            }),
            Animated.timing(cardAnim, {
              toValue: 0.8,
              duration: 200,
              useNativeDriver: true
            }),
            Animated.timing(cardAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true
            })
          ]).start();
        } catch (err) {
          console.error('Failed to mark level as complete or award card:', err);
          Alert.alert('Level Complete!', `You matched all the cards!\nScore: ${finalScore}\nTime left: ${timer}s\nMoves: ${moves}`);
          navigation.goBack();
        }
      }, 1000);
    } else {
      playSoundEffect('lose');
      // Show 8-bit style lose popup
      setPopupType('lose');
      setPopupMessage({
        title: "TIME'S UP!",
        message: "YOU RAN OUT OF TIME.\nTRY AGAIN?"
      });
      setShowPopup(true);
    }
  };
  
  const handleGoBack = () => {
    navigation.goBack();
  };

  const handlePopupAction = (action) => {
    setShowPopup(false);
    
    if (action === 'retry' || action === 'playAgain') {
      startGame();
    } else if (action === 'continue' || action === 'exit') {
      navigation.goBack();
    }
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

  // 8-bit style popup component
  const renderPopup = () => {
    if (!showPopup) return null;

    return (
      <View style={styles.popupOverlay}>
        <Animated.View 
          style={[
            styles.popupContainer,
            {
              transform: [
                { scale: popupAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1]
                })},
                { translateY: popupAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                })}
              ]
            }
          ]}
        >
          <LinearGradient
            colors={popupType === 'win' ? ['#52B69A', '#1A759F'] : ['#D62828', '#9E2A2B']}
            style={styles.popupGradient}
          >
            <View style={styles.popupHeader}>
              <Text style={styles.popupTitle}>{popupMessage.title}</Text>
            </View>
            
            <View style={styles.popupBody}>
              <Text style={styles.popupText}>{popupMessage.message}</Text>
            </View>
            
            <View style={styles.popupButtons}>
              {popupType === 'lose' && (
                <TouchableOpacity 
                  style={styles.popupButton}
                  onPress={() => handlePopupAction('retry')}
                >
                  <LinearGradient
                    colors={['#52B69A', '#1A759F']}
                    style={styles.popupButtonGradient}
                  >
                    <Text style={styles.popupButtonText}>RETRY</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              
              {popupType === 'win' && (
                <TouchableOpacity 
                  style={styles.popupButton}
                  onPress={() => handlePopupAction('playAgain')}
                >
                  <LinearGradient
                    colors={['#52B69A', '#1A759F']}
                    style={styles.popupButtonGradient}
                  >
                    <Text style={styles.popupButtonText}>PLAY AGAIN</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.popupButton}
                onPress={() => handlePopupAction(popupType === 'win' ? 'continue' : 'exit')}
              >
                <LinearGradient
                  colors={['#1A3C40', '#0D1B1E']}
                  style={styles.popupButtonGradient}
                >
                  <Text style={styles.popupButtonText}>
                    {popupType === 'win' ? 'EXIT' : 'EXIT'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    );
  };
  
  // 8-bit style collectible card modal
  const renderCardModal = () => {
    if (!showCardModal) return null;
    return (
      <Modal
        transparent={true}
        visible={showCardModal}
        animationType="none"
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              {
                transform: [
                  { scale: cardAnim }
                ]
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>🎴 COLLECTIBLE CARD UNLOCKED!</Text>
            </View>
            <View style={styles.modalBody}>
              <Image
                source={require('../../../../../assets/images/levels/Level1/rabbit-jump.png')}
                style={{ width: 120, height: 120, marginBottom: 16 }}
                resizeMode="contain"
              />
              <Text style={styles.modalMessage}>Rabbit Jump Card
Congratulations! You collected a new card for Level 1.</Text>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => {
                  setShowCardModal(false);
                  navigation.goBack();
                }}
              >
                <LinearGradient
                  colors={['#FFB703', '#FB8500']}
                  style={styles.modalButtonGradient}
                >
                  <Text style={styles.modalButtonText}>CONTINUE</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
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
              <Text style={[styles.statValue, timer < 10 ? styles.lowTime : {}]}>
                {isPreviewPhase ? "LOOK!" : timer}
              </Text>
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
        
        {/* Preview Phase Overlay */}
        {isPreviewPhase && (
          <View style={styles.previewOverlay}>
            <Text style={styles.previewText}>MEMORIZE!</Text>
          </View>
        )}

        {/* 8-bit Popup Message */}
        {renderPopup()}
        {renderCardModal()}
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
  previewOverlay: {
    position: 'absolute',
    bottom: 160,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  previewText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 18,
  },
  // 8-bit popup styles
  popupOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  popupContainer: {
    width: '80%',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#FFD700',
    // 8-bit style shadow
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10,
  },
  popupGradient: {
    width: '100%',
    padding: 4,
  },
  popupHeader: {
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#FFD700',
  },
  popupTitle: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  popupBody: {
    padding: 20,
    alignItems: 'center',
  },
  popupText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
  popupButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 15,
    borderTopWidth: 4,
    borderTopColor: '#FFD700',
  },
  popupButton: {
    marginHorizontal: 10,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  popupButtonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupButtonText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 12,
  },
  // 8-bit modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#1A3C40',
    borderRadius: 10,
    borderWidth: 4,
    borderColor: '#FFD700',
    // 8-bit style shadow
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10,
  },
  modalHeader: {
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#FFD700',
  },
  modalHeaderText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  modalBody: {
    padding: 20,
    alignItems: 'center',
  },
  modalMessage: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalButton: {
    marginTop: 10,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  modalButtonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 12,
  }
});
