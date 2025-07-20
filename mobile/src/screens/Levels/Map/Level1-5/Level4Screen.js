import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, PanResponder, Image, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../../../../services/api.service';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function Level4Screen() {
  const navigation = useNavigation();
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(30);
  const [gameComplete, setGameComplete] = useState(false);
  const [flowers, setFlowers] = useState([]);
  const [butterflySize, setButterflySize] = useState(120);
  const [controlMode, setControlMode] = useState('touch'); // 'touch' or 'joystick'
  const [joystickPosition, setJoystickPosition] = useState({ x: 100, y: screenHeight - 200 });
  const [joystickValue, setJoystickValue] = useState({ x: 0, y: 0 });
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState(''); // 'success' or 'failure'
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardAnim] = useState(new Animated.Value(0));
  const timerRef = useRef(null);
  const gameInterval = useRef(null);
  const animationRef = useRef(null);
  const butterflyPos = useRef(new Animated.ValueXY({ x: screenWidth/2, y: screenHeight/2 })).current;
  const popupAnimation = useRef(new Animated.Value(0)).current;

  // Initialize game
  useEffect(() => {
    startGame();
    return () => {
      clearInterval(timerRef.current);
      clearInterval(gameInterval.current);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (timer === 0) handleGameOver();
  }, [timer]);

  // Joystick movement effect
  useEffect(() => {
    if (controlMode === 'joystick') {
      const moveButterfly = () => {
        // Get current position
        const currentX = butterflyPos.x._value;
        const currentY = butterflyPos.y._value;
        
        // Calculate new position based on joystick values
        const newX = Math.max(0, Math.min(screenWidth - butterflySize, currentX + joystickValue.x * 5));
        const newY = Math.max(0, Math.min(screenHeight - butterflySize, currentY + joystickValue.y * 5));
        
        // Update position
        butterflyPos.setValue({ x: newX, y: newY });
        
        // Check for collisions
        checkCollisions();
        
        // Continue animation
        animationRef.current = requestAnimationFrame(moveButterfly);
      };
      
      animationRef.current = requestAnimationFrame(moveButterfly);
      
      return () => {
        cancelAnimationFrame(animationRef.current);
      };
    }
  }, [joystickValue, controlMode]);

  // Popup animation effect
  useEffect(() => {
    if (showPopup) {
      Animated.spring(popupAnimation, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true
      }).start();
    } else {
      popupAnimation.setValue(0);
    }
  }, [showPopup]);

  // Pan responder for direct butterfly touch control
  const butterflyPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => controlMode === 'touch',
    onPanResponderMove: (_, gesture) => {
      butterflyPos.setValue({
        x: gesture.moveX - butterflySize/2, // Subtract half of butterfly width
        y: gesture.moveY - butterflySize/2 - 50  // Adjust higher to be under finger
      });
      checkCollisions();
    }
  });

  // Pan responder for joystick control
  const joystickPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => controlMode === 'joystick',
    onPanResponderMove: (_, gesture) => {
      // Calculate joystick displacement (limited to a radius of 50)
      const dx = Math.min(50, Math.max(-50, gesture.moveX - joystickPosition.x));
      const dy = Math.min(50, Math.max(-50, gesture.moveY - joystickPosition.y));
      
      // Normalize values to -1 to 1 range
      setJoystickValue({
        x: dx / 50,
        y: dy / 50
      });
    },
    onPanResponderRelease: () => {
      // Reset joystick to center when released
      setJoystickValue({ x: 0, y: 0 });
    }
  });

  const startGame = () => {
    setScore(0);
    setTimer(30);
    setGameComplete(false);
    setButterflySize(80);
    setShowPopup(false);
    spawnFlowers();

    // Start timer
    timerRef.current = setInterval(() => {
      setTimer(prev => Math.max(0, prev - 1));
    }, 1000);

    // Spawn new flowers periodically
    gameInterval.current = setInterval(() => {
      spawnFlowers();
    }, 2000);
  };

  const spawnFlowers = () => {
    const newFlowers = [];
    for (let i = 0; i < 3; i++) {
      newFlowers.push({
        x: Math.random() * (screenWidth - 40),
        y: Math.random() * (screenHeight - 150),
        collected: false,
        id: Date.now() + i
      });
    }
    setFlowers(prev => [...prev.filter(f => !f.collected), ...newFlowers].slice(0, 5));
  };

  const checkCollisions = () => {
    const butterflyX = butterflyPos.x._value + butterflySize/2;
    const butterflyY = butterflyPos.y._value + butterflySize/2;

    flowers.forEach(flower => {
      if (!flower.collected) {
        const distance = Math.sqrt(
          Math.pow(butterflyX - flower.x, 2) + 
          Math.pow(butterflyY - flower.y, 2)
        );

        if (distance < butterflySize/2 + 10) {
          collectFlower(flower);
        }
      }
    });
  };

  const collectFlower = (flower) => {
    setFlowers(prev => prev.map(f => 
      f.id === flower.id ? { ...f, collected: true } : f
    ));
    setScore(prev => {
      const newScore = prev + 10;
      const newSize = 80;
      setButterflySize(newSize);
      return newScore;
    });
  };

  const toggleControlMode = () => {
    setControlMode(prev => prev === 'touch' ? 'joystick' : 'touch');
  };

  const handleGameOver = () => {
    clearInterval(timerRef.current);
    clearInterval(gameInterval.current);
    cancelAnimationFrame(animationRef.current);
    setGameComplete(true);
    // Always award the card and show the modal
    ApiService.addPoints(score).catch((err) => {
      console.error('Failed to add points:', err);
    });
    setPopupType('success');
    setShowPopup(true);
    setTimeout(async () => {
      try {
        await ApiService.markLevelComplete(4);
        await ApiService.awardCollectibleCard({ level: 4 });
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
        navigation.goBack();
      }
    }, 1000);
  };

  const handlePopupAction = (action) => {
    setShowPopup(false);
    
    if (action === 'continue' || action === 'exit') {
      navigation.goBack();
    } else if (action === 'retry') {
      startGame();
    }
  };

  // 8-bit style popup component
  const GamePopup = () => {
    const popupScale = popupAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1]
    });

    return (
      <Animated.View 
        style={[
          styles.popupOverlay,
          { 
            opacity: popupAnimation,
            transform: [{ scale: popupScale }]
          }
        ]}
      >
        <View style={styles.popupContainer}>
          <View style={styles.popupHeader}>
            <Text style={styles.popupTitle}>
              {popupType === 'success' ? 'LEVEL COMPLETE!' : 'TIME\'S UP!'}
            </Text>
          </View>
          
          <View style={styles.popupBody}>
            <Text style={styles.popupText}>
              {popupType === 'success' 
                ? `GREAT JOB! YOU COLLECTED ${score} POINTS WORTH OF NECTAR!`
                : `YOU COLLECTED ${score} POINTS. TRY AGAIN TO REACH 100!`}
            </Text>
          </View>
          
          <View style={styles.popupButtons}>
            {popupType === 'success' ? (
              <TouchableOpacity 
                style={styles.popupButton} 
                onPress={() => handlePopupAction('continue')}
              >
                <Text style={styles.popupButtonText}>CONTINUE</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity 
                  style={styles.popupButton} 
                  onPress={() => handlePopupAction('retry')}
                >
                  <Text style={styles.popupButtonText}>RETRY</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.popupButton} 
                  onPress={() => handlePopupAction('exit')}
                >
                  <Text style={styles.popupButtonText}>EXIT</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

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
                source={require('../../../../../assets/images/pets/Red Fox.png')}
                style={{ width: 120, height: 120, marginBottom: 16 }}
                resizeMode="contain"
              />
              <Text style={styles.modalMessage}>Fox Card\nCongratulations! You collected a new card for Level 4.</Text>
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
      <LinearGradient colors={['#1A3C40', '#0D1B1E']} style={styles.background}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← EXIT</Text>
          </TouchableOpacity>
          
          <View style={styles.gameInfo}>
            <Text style={styles.gameTitle}>BUTTERFLY GARDEN</Text>
            <Text style={styles.levelText}>LEVEL 4</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>TIME</Text>
              <Text style={styles.statValue}>{timer}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>NECTAR</Text>
              <Text style={styles.statValue}>{score}</Text>
            </View>
          </View>
        </View>

        <View style={styles.gameBoard}>
          {flowers.map((flower, index) => !flower.collected && (
            <View
              key={flower.id}
              style={[styles.flower, { left: flower.x, top: flower.y }]}
            >
              <Image 
                source={require('../../../../../assets/images/levels/Level4/nectar.png')}
                style={styles.flowerImage}
                resizeMode="contain"
              />
            </View>
          ))}
          
          <Animated.View
            {...butterflyPanResponder.panHandlers}
            style={[
              styles.butterfly,
              {
                width: butterflySize,
                height: butterflySize,
                transform: [
                  { translateX: butterflyPos.x },
                  { translateY: butterflyPos.y },
                  { rotate: joystickValue ? 
                    `${Math.atan2(joystickValue.y, joystickValue.x)}rad` : '0deg'
                  }
                ]
              }
            ]}
          >
            <Image 
              source={require('../../../../../assets/images/levels/Level4/butterfly.png')}
              style={styles.butterflyImage}
              resizeMode="contain"
            />
          </Animated.View>
          
          {controlMode === 'joystick' && (
            <View style={[styles.joystickContainer, { left: joystickPosition.x - 50, top: joystickPosition.y - 50 }]}>
              <View style={styles.joystickBase} />
              <View 
                {...joystickPanResponder.panHandlers}
                style={[
                  styles.joystickHandle,
                  { 
                    left: 50 + joystickValue.x * 50, 
                    top: 50 + joystickValue.y * 50 
                  }
                ]} 
              />
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.controlToggle} 
          onPress={toggleControlMode}
        >
          <Text style={styles.controlToggleText}>
            {controlMode === 'touch' ? '👆 Touch' : '🕹️ Joystick'}
          </Text>
        </TouchableOpacity>
        
        {showPopup && <GamePopup />}
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
  gameBoard: {
    flex: 1,
    position: 'relative',
  },
  flower: {
    position: 'absolute',
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flowerImage: {
    width: '100%',
    height: '100%',
  },
  butterfly: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  butterflyImage: {
    width: '100%',
    height: '100%',
  },
  controlToggle: {
    position: 'absolute',
    top: 80,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  controlToggleText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 12,
  },
  joystickContainer: {
    position: 'absolute',
    width: 100,
    height: 100,
    zIndex: 10,
  },
  joystickBase: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  joystickHandle: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.8)',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  // 8-bit style popup styles
  popupOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  popupContainer: {
    width: '80%',
    backgroundColor: '#0D1B1E',
    borderWidth: 4,
    borderColor: '#FFD700',
    borderRadius: 8,
    padding: 4,
    // 8-bit style shadow
    elevation: 8,
  },
  popupHeader: {
    backgroundColor: '#1A3C40',
    padding: 10,
    borderBottomWidth: 4,
    borderBottomColor: '#FFD700',
    alignItems: 'center',
  },
  popupTitle: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 16,
    textAlign: 'center',
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
    justifyContent: 'space-around',
    paddingVertical: 15,
  },
  popupButton: {
    backgroundColor: '#1A3C40',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 4,
    minWidth: 100,
    alignItems: 'center',
  },
  popupButtonText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 12,
  },
  // Add modal styles if not present
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
  },
});
