import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
  Image,
  BackHandler,
  Modal, // ADD Modal
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { PixelRatio } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../../../../services/api.service';

// Get window dimensions and adjust for landscape
const { width, height } = Dimensions.get('window');
const pixelRatio = PixelRatio.get();
const scale = Math.min(width, height) / 620; // Use smaller dimension for scaling

// Helper function to normalize sizes for different screen density
const normalize = (size) => Math.round(size * scale * pixelRatio) / pixelRatio;

// 8-bit color palette
const COLORS = {
  BLACK: '#0f0f0f',
  DARK_BLUE: '#0000aa',
  DARK_GREEN: '#00aa00',
  DARK_CYAN: '#00aaaa',
  DARK_RED: '#aa0000',
  DARK_MAGENTA: '#aa00aa',
  DARK_YELLOW: '#aa5500',
  GRAY: '#aaaaaa',
  DARK_GRAY: '#555555',
  BLUE: '#5555ff',
  GREEN: '#55ff55',
  CYAN: '#55ffff',
  RED: '#ff5555',
  MAGENTA: '#ff55ff',
  YELLOW: '#ffff55',
  WHITE: '#ffffff',
};

const Level11Screen = ({ navigation: navigationProp }) => { // Rename prop to avoid conflicts
  // Use navigation hook as fallback
  const navigationHook = useNavigation();
  const navigation = navigationProp || navigationHook;

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [hearts, setHearts] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [trees, setTrees] = useState([]);
  const [pollution, setPollution] = useState([]);
  const [hazards, setHazards] = useState([]);
  const [animatedValue] = useState(new Animated.Value(0));
  const [pixelEffect] = useState(new Animated.Value(0));
  const [showModal, setShowModal] = useState(false); // ADD
  const [modalType, setModalType] = useState(null); // 'victory' | 'timeout'
  const [modalAnimation] = useState(new Animated.Value(0)); // ADD

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isLandscape = windowWidth > windowHeight;

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      if (navigation && navigation.goBack) {
        navigation.goBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    initializeGame();
    const subscription = Dimensions.addEventListener('change', handleOrientationChange);
    return () => subscription?.remove();
  }, []);

  // Create 8-bit pixel animation effect
  useEffect(() => {
    if (gameStarted) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pixelEffect, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pixelEffect, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pixelEffect.setValue(0);
    }
  }, [gameStarted]);

  // Animate modal when shown
  useEffect(() => {
    if (showModal) {
      Animated.sequence([
        Animated.timing(modalAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(modalAnimation, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(modalAnimation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      modalAnimation.setValue(0);
    }
  }, [showModal]);

  const handleOrientationChange = () => {
    initializeGame();
  };

  useEffect(() => {
    let timer;
    if (gameStarted && timeLeft > 0 && !gameOver) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      endGame();
    }
    return () => clearTimeout(timer);
  }, [gameStarted, timeLeft, gameOver]);

  useEffect(() => {
    let fallInterval;
    if (gameStarted && !gameOver) {
      fallInterval = setInterval(() => {
        // Make movement more "chunky" for 8-bit feel
        setTrees((prev) =>
          prev.map((tree) =>
            !tree.planted
              ? {
                  ...tree,
                  y: tree.y > height ? 0 : tree.y + normalize(Math.floor(tree.speed) * 2),
                  x: tree.y > height ? Math.floor(Math.random() * (width - normalize(48)) / 8) * 8 : tree.x,
                }
              : tree
          )
        );
        setPollution((prev) =>
          prev.map((item) =>
            !item.cleaned
              ? {
                  ...item,
                  y: item.y > height ? 0 : item.y + normalize(Math.floor(item.speed) * 2),
                  x: item.y > height ? Math.floor(Math.random() * (width - normalize(48)) / 8) * 8 : item.x,
                }
              : item
          )
        );
        setHazards((prev) =>
          prev.map((hazard) =>
            !hazard.hit
              ? {
                  ...hazard,
                  y: hazard.y > height ? 0 : hazard.y + normalize(Math.floor(hazard.speed) * 2),
                  x: hazard.y > height ? Math.floor(Math.random() * (width - normalize(48)) / 8) * 8 : hazard.x,
                }
              : hazard
          )
        );
        // Check win condition
        if (
          trees.filter((t) => t.planted).length === 10 &&
          pollution.filter((p) => p.cleaned).length === 6
        ) {
          endGame();
        }
      }, 100); // Slower update rate for more "chunky" movement
    }
    return () => clearInterval(fallInterval);
  }, [gameStarted, gameOver, trees, pollution]);

  const initializeGame = () => {
    // Position items on a grid for 8-bit feel
    const gridSize = 8;
    
    const initialTrees = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: Math.floor(Math.random() * (width - normalize(48)) / gridSize) * gridSize,
      y: Math.floor(Math.random() * height / gridSize) * gridSize,
      planted: false,
      size: normalize(48),
      speed: 1 + Math.floor(Math.random() * 2),
      frame: Math.floor(Math.random() * 4), // For animation frames
    }));

    const initialPollution = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.floor(Math.random() * (width - normalize(48)) / gridSize) * gridSize,
      y: Math.floor(Math.random() * height / gridSize) * gridSize,
      cleaned: false,
      type: Math.random() > 0.5 ? 'trash' : 'smoke',
      speed: 1 + Math.floor(Math.random() * 2),
      frame: Math.floor(Math.random() * 4), // For animation frames
    }));

    const initialHazards = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: Math.floor(Math.random() * (width - normalize(48)) / gridSize) * gridSize,
      y: Math.floor(Math.random() * height / gridSize) * gridSize,
      hit: false,
      size: normalize(48),
      speed: 2 + Math.floor(Math.random() * 2),
      frame: Math.floor(Math.random() * 4), // For animation frames
    }));

    setTrees(initialTrees);
    setPollution(initialPollution);
    setHazards(initialHazards);
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setHearts(3);
    setTimeLeft(60);
    setGameOver(false);
    initializeGame();

    // 8-bit style pulsing background
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const plantTree = (treeId) => {
    if (!gameStarted || gameOver) return;
    setTrees((prev) =>
      prev.map((tree) =>
        tree.id === treeId ? { ...tree, planted: true, size: normalize(56) } : tree
      )
    );
    setScore((prev) => prev + 10);
    // Play 8-bit sound effect here if you have audio service
  };

  const cleanPollution = (pollutionId) => {
    if (!gameStarted || gameOver) return;
    setPollution((prev) =>
      prev.map((item) =>
        item.id === pollutionId
          ? { 
              ...item, 
              cleaned: true, 
              y: 0, 
              x: Math.floor(Math.random() * (width - normalize(48)) / 8) * 8 
            }
          : item
      )
    );
    setScore((prev) => prev + 15);
    // Play 8-bit sound effect here if you have audio service
  };

  const hitHazard = (hazardId) => {
    if (!gameStarted || gameOver) return;
    setHazards((prev) =>
      prev.map((hazard) =>
        hazard.id === hazardId
          ? { 
              ...hazard, 
              hit: true, 
              y: 0, 
              x: Math.floor(Math.random() * (width - normalize(48)) / 8) * 8 
            }
          : hazard
      )
    );
    setHearts((prev) => {
      const newHearts = prev - 1;
      if (newHearts <= 0) {
        endGame();
      }
      return newHearts;
    });
    // Play 8-bit sound effect here if you have audio service
  };

  // Safe navigation function
  const handleGoBack = () => {
    try {
      if (navigation && typeof navigation.goBack === 'function') {
        navigation.goBack();
      } else {
        console.warn('Navigation not available');
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  // Update endGame function to use safe navigation
  const endGame = async () => {
    setGameOver(true);
    setGameStarted(false);

    // Add points to backend
    ApiService.addPoints(score).catch((err) => {
      console.error('Failed to add points:', err);
    });

    // Mark level as completed on backend
    try {
      await ApiService.markLevelComplete(11);
    } catch (err) {
      console.error('Failed to mark level 11 as completed:', err);
    }

    const treesPlanted = trees.filter((tree) => tree.planted).length;
    const pollutionCleaned = pollution.filter((item) => item.cleaned).length;

    // Determine modal type
    if (treesPlanted === 10 && pollutionCleaned === 6) {
      setModalType('victory');
      setShowModal(true);
    } else if (timeLeft <= 0) {
      setModalType('timeout');
      setShowModal(true);
    } else if (hearts <= 0) {
      setModalType('timeout');
      setShowModal(true);
    } else {
      setModalType('timeout');
      setShowModal(true);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setHearts(3);
    setTimeLeft(60);
    initializeGame();
  };

  const handlePlayAgain = () => {
    setShowModal(false);
    setTimeout(() => {
      startGame();
    }, 300);
  };
  const handleMainMenu = () => {
    setShowModal(false);
    setTimeout(() => {
      handleGoBack();
    }, 300);
  };

  return (
    <View style={styles.container}>
      {/* Header styled like Level 10 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.exitButton}>
          <Text style={styles.exitButtonText}>EXIT</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🌲 EcoRescue: Level 11</Text>
        <Text style={styles.scoreText}>Score: {score}</Text>
      </View>

      {/* Game Stats with improved style */}
      <View style={styles.statsContainer}>
        <Text style={styles.statText}>Time: {timeLeft}</Text>
        <Text style={styles.statText}>{'♥'.repeat(hearts)}</Text>
        <Text style={styles.statText}>Trees: {trees.filter((t) => t.planted).length}/10</Text>
        <Text style={styles.statText}>Clean: {pollution.filter((p) => p.cleaned).length}/6</Text>
      </View>

      {/* Game Area with subtle shadow and rounded corners */}
      <View style={styles.gameArea}>
        <Animated.View
          style={[
            styles.background,
            {
              opacity: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.6],
              }),
            },
          ]}
        />
        <View style={styles.gridOverlay} />
        {/* Trees */}
        {trees.map((tree) => (
          <TouchableOpacity
            key={tree.id}
            style={[
              styles.tree,
              {
                left: tree.x,
                top: tree.y,
                width: tree.size,
                height: tree.size,
                backgroundColor: 'transparent',
                borderWidth: tree.planted ? 0 : normalize(2),
                borderColor: 'transparent',
              },
            ]}
            onPress={() => plantTree(tree.id)}
            disabled={tree.planted}
          >
            <Image
              source={
                tree.planted
                  ? require('../../../../../assets/images/levels/Level11/tree_planted.png')
                  : require('../../../../../assets/images/levels/Level11/seedling.png')
              }
              style={styles.pixelSprite}
            />
          </TouchableOpacity>
        ))}
        {/* Pollution */}
        {pollution.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.pollution,
              {
                left: item.x,
                top: item.y,
                width: normalize(48),
                height: normalize(48),
                opacity: item.cleaned ? 0 : 1,
                backgroundColor: 'transparent',
                borderWidth: normalize(2),
                borderColor: 'transparent',
              },
            ]}
            onPress={() => cleanPollution(item.id)}
            disabled={item.cleaned}
          >
            <Image
              source={
                item.type === 'trash'
                  ? require('../../../../../assets/images/levels/Level11/trash.png')
                  : require('../../../../../assets/images/levels/Level11/smoke.png')
              }
              style={styles.pixelSprite}
            />
          </TouchableOpacity>
        ))}
        {/* Hazards */}
        {hazards.map(
          (hazard) =>
            !hazard.hit && (
              <TouchableOpacity
                key={hazard.id}
                style={[
                  styles.hazard,
                  {
                    left: hazard.x,
                    top: hazard.y,
                    width: hazard.size,
                    height: hazard.size,
                    backgroundColor: 'transparent',
                    borderWidth: normalize(2),
                    borderColor: 'transparent',
                  },
                ]}
                onPress={() => hitHazard(hazard.id)}
              >
                <Image
                  source={require('../../../../../assets/images/levels/Level11/bomb.png')}
                  style={styles.pixelSprite}
                />
              </TouchableOpacity>
            )
        )}
        {/* Instructions */}
        {!gameStarted && !gameOver && (
          <View style={styles.instructions}>
            <Text style={styles.instructionTitle}>MISSION:</Text>
            <Text style={styles.instructionText}>
              TAP SEEDLINGS TO PLANT TREES (10 PTS)
            </Text>
            <Text style={styles.instructionText}>
              TAP TRASH/SMOKE TO CLEAN (15 PTS)
            </Text>
            <Text style={styles.instructionText}>
              AVOID TOXIC WASTE (LOSES 1 HEART)!
            </Text>
            <Text style={styles.instructionText}>
              GOAL: PLANT 10 TREES & CLEAN 6 POLLUTION!
            </Text>
          </View>
        )}
      </View>
      {/* Control Buttons with improved style */}
      <View style={styles.controlsContainer}>
        {!gameStarted ? (
          <TouchableOpacity 
            style={styles.startButton} 
            onPress={startGame}
          >
            <Text style={styles.buttonText}>START</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.resetButton} 
            onPress={resetGame}
          >
            <Text style={styles.buttonText}>RESET</Text>
          </TouchableOpacity>
        )}
      </View>
      {/* 8-bit Modal Popup */}
      <Modal
        visible={showModal && isLandscape}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.landscapeModalOverlay}>
          <Animated.View style={[
            styles.landscapeModalContent,
            modalType === 'timeout' ? { borderColor: '#E63946', backgroundColor: '#2a1a1a' } : {},
            { transform: [{ scale: modalAnimation }] },
          ]}>
            {/* Left: Mascot */}
            <View style={styles.landscapeModalLeft}>
              <View style={[
                styles.landscapeMascotBox,
                modalType === 'victory' ? { backgroundColor: '#55ff55', borderColor: '#FFD700' } : { backgroundColor: '#ff5555', borderColor: '#FFD700' },
              ]}>
                <Image
                  source={modalType === 'victory'
                    ? require('../../../../../assets/images/levels/Level11/tree_planted.png')
                    : require('../../../../../assets/images/levels/Level11/bomb.png')}
                  style={styles.landscapeMascotImg}
                />
              </View>
            </View>
            {/* Right: Message, stats, buttons */}
            <View style={styles.landscapeModalRight}>
              <View style={[
                styles.landscapeModalHeader,
                modalType === 'timeout' ? { backgroundColor: '#E63946' } : {},
              ]}>
                <Text style={styles.landscapeModalHeaderText}>
                  {modalType === 'victory' ? 'LEVEL COMPLETE!' : "TIME'S UP!"}
                </Text>
              </View>
              <View style={styles.landscapeModalMsgBox}>
                <Text style={styles.landscapeModalMsgText}>
                  {modalType === 'victory'
                    ? 'You rescued the Snow Leopard! 🌳'
                    : 'Better luck next time! 💣'}
                </Text>
              </View>
              <View style={styles.landscapeStatsRow}>
                <View style={[styles.landscapeStatBox, { backgroundColor: '#222', borderColor: '#FFD700' }]}> 
                  <Text style={styles.landscapeStatIcon}>⭐</Text>
                  <Text style={styles.landscapeStatLabel}>SCORE</Text>
                  <Text style={styles.landscapeStatValue}>{score}</Text>
                </View>
                <View style={[styles.landscapeStatBox, { backgroundColor: '#1a3', borderColor: '#55ff55' }]}> 
                  <Text style={styles.landscapeStatIcon}>🌳</Text>
                  <Text style={styles.landscapeStatLabel}>TREES</Text>
                  <Text style={styles.landscapeStatValue}>{trees.filter((t) => t.planted).length}/10</Text>
                </View>
                <View style={[styles.landscapeStatBox, { backgroundColor: '#135', borderColor: '#55ffff' }]}> 
                  <Text style={styles.landscapeStatIcon}>🧹</Text>
                  <Text style={styles.landscapeStatLabel}>CLEANED</Text>
                  <Text style={styles.landscapeStatValue}>{pollution.filter((p) => p.cleaned).length}/6</Text>
                </View>
                <View style={[styles.landscapeStatBox, { backgroundColor: '#511', borderColor: '#ff5555' }]}> 
                  <Text style={styles.landscapeStatIcon}>❤️</Text>
                  <Text style={styles.landscapeStatLabel}>HEARTS</Text>
                  <Text style={styles.landscapeStatValue}>{hearts}</Text>
                </View>
              </View>
              <View style={styles.landscapeModalBtnRow}>
                <TouchableOpacity style={styles.landscapePixelBtn} onPress={handlePlayAgain}>
                  <Text style={styles.landscapePixelBtnText}>🔄 PLAY AGAIN</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.landscapePixelBtn} onPress={handleMainMenu}>
                  <Text style={styles.landscapePixelBtnText}>🏠 MAIN MENU</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
    backgroundColor: 'rgba(0,0,0,0.10)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    position: 'relative',
    zIndex: 20,
  },
  headerTitle: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
    textShadowColor: '#333',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    flex: 1,
    textAlign: 'center',
  },
  scoreText: {
    fontSize: 16,
    color: '#FFB703',
    backgroundColor: '#222',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  exitButton: {
    position: 'absolute',
    left: 15,
    paddingVertical: 6,
    paddingHorizontal: 18,
    backgroundColor: '#E63946',
    borderRadius: 8,
    shadowColor: '#333',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
  },
  exitButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#333',
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
  },
  statText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginHorizontal: 6,
  },
  gameArea: {
    flex: 1,
    position: 'relative',
    margin: 14,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFD700',
    backgroundColor: '#181818',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.DARK_GREEN,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'rgba(0,0,0,0.1)',
    borderStyle: 'dashed',
    borderRadius: 0,
  },
  tree: {
    position: 'absolute',
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  pollution: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0,
    overflow: 'hidden',
  },
  hazard: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0,
    overflow: 'hidden',
  },
  pixelSprite: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  instructions: {
    position: 'absolute',
    top: '20%',
    left: normalize(20),
    right: normalize(20),
    backgroundColor: '#222',
    padding: normalize(10),
    borderWidth: normalize(4),
    borderColor: '#FFD700',
    borderRadius: 12,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  instructionTitle: {
    fontSize: normalize(28),
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: normalize(6),
    textAlign: 'center',
    textShadowColor: '#333',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  instructionText: {
    fontSize: normalize(16),
    fontFamily: 'monospace',
    color: '#FFF',
    marginBottom: normalize(4),
    textAlign: 'center',
  },
  controlsContainer: {
    padding: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#222',
    borderTopWidth: 2,
    borderTopColor: '#FFD700',
  },
  startButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#333',
    marginHorizontal: 10,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  resetButton: {
    backgroundColor: '#E63946',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#333',
    marginHorizontal: 10,
    shadowColor: '#E63946',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: '#333',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  // Add modal styles from Level 10
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#333',
    borderWidth: 4,
    borderColor: '#FFD700',
    borderRadius: 0, // Square corners for 8-bit look
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: '#FFD700',
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'monospace',
  },
  modalBody: {
    padding: 20,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  modalScoreText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginVertical: 10,
    fontFamily: 'monospace',
  },
  modalImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginVertical: 10,
  },
  pixelBtn: {
    backgroundColor: '#FFD700',
    padding: 12,
    marginHorizontal: 8,
    borderRadius: 0, // Square for pixel look
    borderWidth: 4,
    borderColor: '#333',
    borderBottomWidth: 8, // Thicker bottom border for 3D effect
    borderRightWidth: 8, // Thicker right border for 3D effect
    minWidth: 50,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pixelBtnText: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
    fontFamily: 'monospace',
  },
  // NEW MODAL DESIGN
  newModalContent: {
    width: 320,
    backgroundColor: '#181818',
    borderWidth: 6,
    borderColor: '#FFD700',
    borderRadius: 0,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    alignItems: 'center',
    marginTop: -40,
  },
  newModalHeader: {
    width: '100%',
    backgroundColor: '#FFD700',
    borderBottomWidth: 6,
    borderBottomColor: '#111',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  newModalIcon: {
    width: 48,
    height: 48,
    marginRight: 12,
    resizeMode: 'contain',
    shadowColor: '#111',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  newModalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'monospace',
    textShadowColor: '#fff',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  newModalBody: {
    width: '100%',
    backgroundColor: '#222',
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#FFD700',
  },
  newModalText: {
    fontSize: 16,
    color: '#FFD700',
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: '#111',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
    width: '100%',
  },
  statBox: {
    flex: 1,
    marginHorizontal: 6,
    borderWidth: 3,
    borderRadius: 0,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'monospace',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textShadowColor: '#111',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  statValue: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textShadowColor: '#111',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  newModalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#FFD700',
    borderTopWidth: 4,
    borderTopColor: '#111',
    paddingVertical: 10,
  },
  newPixelBtn: {
    backgroundColor: '#222',
    borderWidth: 4,
    borderColor: '#FFD700',
    borderRadius: 0,
    marginHorizontal: 10,
    paddingVertical: 10,
    paddingHorizontal: 22,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  newPixelBtnText: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textShadowColor: '#111',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  // LANDSCAPE MODAL DESIGN
  landscapeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20,20,20,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  landscapeModalContent: {
    flexDirection: 'row',
    width: '90%',
    maxWidth: 900,
    minWidth: 420,
    height: '70%',
    minHeight: 320,
    maxHeight: 520,
    backgroundColor: '#181818',
    borderWidth: 8,
    borderColor: '#FFD700',
    borderRadius: 0,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  landscapeModalLeft: {
    width: 180,
    minWidth: 140,
    maxWidth: 220,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    padding: 0,
  },
  landscapeMascotBox: {
    width: 130,
    height: 130,
    borderWidth: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
    shadowColor: '#111',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  landscapeMascotImg: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  landscapeModalRight: {
    flex: 1,
    height: '100%',
    paddingVertical: 18,
    paddingHorizontal: 18,
    backgroundColor: 'transparent',
    minWidth: 180,
    maxWidth: 500,
    justifyContent: 'center',
    alignItems: 'center',
  },
  landscapeModalHeader: {
    width: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    marginBottom: 6,
    borderBottomWidth: 4,
    borderBottomColor: '#111',
  },
  landscapeModalHeaderText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'monospace',
    textShadowColor: '#fff',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  landscapeModalMsgBox: {
    width: '100%',
    backgroundColor: '#222',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#FFD700',
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  landscapeModalMsgText: {
    fontSize: 18,
    color: '#FFD700',
    fontFamily: 'monospace',
    textAlign: 'center',
    textShadowColor: '#111',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
    letterSpacing: 1,
  },
  landscapeStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 6,
    marginTop: 2,
  },
  landscapeStatBox: {
    flex: 1,
    marginHorizontal: 6,
    borderWidth: 4,
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    minWidth: 70,
    maxWidth: 110,
  },
  landscapeStatIcon: {
    fontSize: 22,
    marginBottom: 2,
    textAlign: 'center',
  },
  landscapeStatLabel: {
    fontSize: 15,
    color: '#fff',
    fontFamily: 'monospace',
    marginBottom: 1,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textShadowColor: '#111',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
    textAlign: 'center',
  },
  landscapeStatValue: {
    fontSize: 22,
    color: '#FFD700',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textShadowColor: '#111',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
    textAlign: 'center',
  },
  landscapeModalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#FFD700',
    borderTopWidth: 4,
    borderTopColor: '#111',
    paddingVertical: 6,
    marginTop: 6,
    borderRadius: 0,
  },
  landscapePixelBtn: {
    backgroundColor: '#222',
    borderWidth: 4,
    borderColor: '#FFD700',
    borderRadius: 0,
    marginHorizontal: 8,
    paddingVertical: 12,
    paddingHorizontal: 28,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  landscapePixelBtnText: {
    fontSize: 22,
    color: '#FFD700',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textShadowColor: '#111',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});

export default Level11Screen;