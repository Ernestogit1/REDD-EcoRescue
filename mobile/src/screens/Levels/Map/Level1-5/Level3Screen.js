import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../../../../services/api.service';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Bug types with their respective images
const BUG_TYPES = {
  LADYBUG: require('../../../../../assets/images/levels/Level3/bug.png'),
  GREEN_BUG: require('../../../../../assets/images/levels/Level3/bug2.png'),
};

export default function Level3Screen() {
  const navigation = useNavigation();
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(30);
  const [gameComplete, setGameComplete] = useState(false);
  const [activeHoles, setActiveHoles] = useState(new Array(8).fill(false));
  const [bugTypes, setBugTypes] = useState(new Array(8).fill(null));
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupTitle, setPopupTitle] = useState('');
  const [popupButtons, setPopupButtons] = useState([]);
  const timerRef = useRef(null);
  const gameInterval = useRef(null);
  const fadeAnims = useRef(activeHoles.map(() => new Animated.Value(0))).current;
  const rotateAnims = useRef(activeHoles.map(() => new Animated.Value(0))).current;
  const popupAnim = useRef(new Animated.Value(0)).current;

  const spawnInsect = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * 8);
    const randomBug = Math.random() < 0.5 ? 'LADYBUG' : 'GREEN_BUG';
    
    // Update state first
    setActiveHoles(prev => {
      const newHoles = [...prev];
      newHoles[randomIndex] = true;
      return newHoles;
    });

    setBugTypes(prev => {
      const newTypes = [...prev];
      newTypes[randomIndex] = randomBug;
      return newTypes;
    });

    // Handle animations
    const fadeAnimation = Animated.sequence([
      Animated.timing(fadeAnims[randomIndex], {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(800),
      Animated.timing(fadeAnims[randomIndex], {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]);

    const rotateAnimation = Animated.sequence([
      Animated.timing(rotateAnims[randomIndex], {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnims[randomIndex], {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]);

    Animated.parallel([fadeAnimation, rotateAnimation]).start(() => {
      setTimeout(() => {
        setActiveHoles(prev => {
          const updatedHoles = [...prev];
          updatedHoles[randomIndex] = false;
          return updatedHoles;
        });
        setBugTypes(prev => {
          const updatedTypes = [...prev];
          updatedTypes[randomIndex] = null;
          return updatedTypes;
        });
      }, 0);
    });

    return () => {
      fadeAnimation.stop();
      rotateAnimation.stop();
    };
  }, [fadeAnims, rotateAnims]);

  const handleTap = useCallback((index) => {
    if (activeHoles[index] && !gameComplete) {
      setScore(prev => prev + 10);
      fadeAnims[index].setValue(0);
      rotateAnims[index].setValue(0); // Reset rotation on tap
      
      setActiveHoles(prev => {
        const newHoles = [...prev];
        newHoles[index] = false;
        return newHoles;
      });
      setBugTypes(prev => {
        const newTypes = [...prev];
        newTypes[index] = null;
        return newTypes;
      });
    }
  }, [activeHoles, gameComplete, fadeAnims, rotateAnims]);

  const startGame = useCallback(() => {
    setScore(0);
    setTimer(30);
    setGameComplete(false);
    setActiveHoles(new Array(8).fill(false));
    setBugTypes(new Array(8).fill(null));
    setShowPopup(false);
    
    // Reset animations
    fadeAnims.forEach(anim => anim.setValue(0));
    rotateAnims.forEach(anim => anim.setValue(0));

    // Clear existing intervals
    if (timerRef.current) clearInterval(timerRef.current);
    if (gameInterval.current) clearInterval(gameInterval.current);

    // Start new intervals
    timerRef.current = setInterval(() => {
      setTimer(prev => Math.max(0, prev - 1));
    }, 1000);

    gameInterval.current = setInterval(spawnInsect, 1000);
  }, [spawnInsect]);

  useEffect(() => {
    startGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (gameInterval.current) clearInterval(gameInterval.current);
    };
  }, []);

  useEffect(() => {
    if (timer === 0) {
      handleGameOver();
    }
  }, [timer]);

  // Popup animation when it appears
  useEffect(() => {
    if (showPopup) {
      // Use requestAnimationFrame to avoid useInsertionEffect warning
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
  }, [showPopup]);

  // Track what to do after popup closes
  const [pendingAction, setPendingAction] = useState(null); // 'restart' | 'exit' | null

  // Effect to run pending action after popup is hidden
  useEffect(() => {
    if (!showPopup && pendingAction) {
      if (pendingAction === 'restart') {
        startGame();
      } else if (pendingAction === 'exit') {
        navigation.goBack();
      }
      setPendingAction(null);
    }
  }, [showPopup, pendingAction, startGame, navigation]);

  // Memoized handlers for popup buttons
  const handlePlayAgain = useCallback(() => {
    setShowPopup(false);
    setPendingAction('restart');
  }, []);
  const handleExit = useCallback(() => {
    setShowPopup(false);
    setPendingAction('exit');
  }, []);

  const handleGameOver = () => {
    clearInterval(timerRef.current);
    clearInterval(gameInterval.current);
    setGameComplete(true);

    if (score >= 100) {
      // Send points to backend
      ApiService.addPoints(score).catch((err) => {
        console.error('Failed to add points:', err);
      });
      // Show success popup
      setPopupTitle('LEVEL COMPLETE!');
      setPopupMessage(`GREAT JOB! YOU SCORED ${score} POINTS!`);
      setPopupButtons([
        { text: 'PLAY AGAIN', onPress: handlePlayAgain },
        { text: 'EXIT', onPress: handleExit }
      ]);
      setShowPopup(true);
    } else {
      // Show failure popup
      setPopupTitle('TIME\'S UP!');
      setPopupMessage(`YOU SCORED ${score} POINTS. TRY AGAIN TO REACH 100!`);
      setPopupButtons([
        { text: 'PLAY AGAIN', onPress: handlePlayAgain },
        { text: 'EXIT', onPress: handleExit }
      ]);
      setShowPopup(true);
    }
  };

  // Memoize button handlers to prevent recreation on each render
  const handlePopupButtonPress = useCallback((onPress) => {
    return onPress;
  }, []);

  const renderPopup = () => {
    if (!showPopup) return null;

    return (
      <View style={styles.popupOverlay}>
        <Animated.View 
          style={[
            styles.popupContainer,
            {
              transform: [
                { scale: popupAnim },
                { 
                  translateY: popupAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0]
                  })
                }
              ]
            }
          ]}
        >
          <LinearGradient 
            colors={['#52B69A', '#1A759F']} 
            style={styles.popupHeader}
          >
            <Text style={styles.popupTitle}>{popupTitle}</Text>
          </LinearGradient>
          
          <View style={styles.popupBody}>
            <Text style={styles.popupMessage}>{popupMessage}</Text>
            
            <View style={styles.popupButtonContainer}>
              {popupButtons.map((button, index) => {
                // Create a stable handler for each button
                const stableHandler = handlePopupButtonPress(button.onPress);
                
                return (
                  <TouchableOpacity 
                    key={index} 
                    style={[
                      styles.popupButton,
                      index === 0 ? styles.primaryButton : styles.secondaryButton
                    ]} 
                    onPress={stableHandler}
                    activeOpacity={0.7}
                  >
                    <LinearGradient 
                      colors={index === 0 ? ['#52B69A', '#1A759F'] : ['#4A5859', '#2C3333']} 
                      style={styles.buttonGradient}
                    >
                      <Text style={styles.popupButtonText}>{button.text}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Animated.View>
      </View>
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
            <Text style={styles.gameTitle}>BUG ZAPPER</Text>
            <Text style={styles.levelText}>LEVEL 3</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>TIME</Text>
              <Text style={styles.statValue}>{timer}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>SCORE</Text>
              <Text style={styles.statValue}>{score}</Text>
            </View>
          </View>
        </View>

        <View style={styles.gameBoard}>
          {activeHoles.map((isActive, index) => (
            <TouchableOpacity
              key={index}
              style={styles.hole}
              onPress={() => handleTap(index)}
              activeOpacity={0.8}
            >
              {isActive && bugTypes[index] && (
                <Animated.View
                  style={[
                    styles.insectContainer,
                    {
                      opacity: fadeAnims[index],
                      transform: [{
                        rotate: rotateAnims[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg']
                        })
                      }]
                    }
                  ]}
                >
                  <Image
                    source={BUG_TYPES[bugTypes[index]]}
                    style={styles.insectImage}
                    resizeMode="contain"
                  />
                </Animated.View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.controlButton} onPress={startGame}>
          <LinearGradient colors={['#52B69A', '#1A759F']} style={styles.controlButtonGradient}>
            <Text style={styles.controlButtonText}>RESTART</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
      
      {renderPopup()}
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  hole: {
    width: screenWidth * 0.18,
    height: screenWidth * 0.10, // Made holes square and larger
    margin: 10,
    backgroundColor: '#2A2B2A',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#52B69A',
    overflow: 'hidden',
  },
  insectContainer: {
    width: '60%',
    height: '60%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  insectImage: {
    width: '100%',
    height: '100%',
  },
  controlButton: {
    alignSelf: 'center',
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  controlButtonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  controlButtonText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 12,
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
