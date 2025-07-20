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
        setTrees((prev) =>
          prev.map((tree) =>
            !tree.planted
              ? {
                  ...tree,
                  y: tree.y > height ? 0 : tree.y + normalize(tree.speed),
                  x: tree.y > height ? Math.random() * (width - normalize(48)) : tree.x,
                }
              : tree
          )
        );
        setPollution((prev) =>
          prev.map((item) =>
            !item.cleaned
              ? {
                  ...item,
                  y: item.y > height ? 0 : item.y + normalize(item.speed),
                  x: item.y > height ? Math.random() * (width - normalize(48)) : item.x,
                }
              : item
          )
        );
        setHazards((prev) =>
          prev.map((hazard) =>
            !hazard.hit
              ? {
                  ...hazard,
                  y: hazard.y > height ? 0 : hazard.y + normalize(hazard.speed),
                  x: hazard.y > height ? Math.random() * (width - normalize(48)) : hazard.x,
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
      }, 50);
    }
    return () => clearInterval(fallInterval);
  }, [gameStarted, gameOver, trees, pollution]);

  const initializeGame = () => {
    const initialTrees = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: Math.random() * (width - normalize(48)),
      y: Math.random() * height,
      planted: false,
      size: normalize(48),
      speed: 2 + Math.random() * 2,
    }));

    const initialPollution = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * (width - normalize(48)),
      y: Math.random() * height,
      cleaned: false,
      type: Math.random() > 0.5 ? 'trash' : 'smoke',
      speed: 2 + Math.random() * 2, // Add speed for falling
    }));

    const initialHazards = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: Math.random() * (width - normalize(48)),
      y: Math.random() * height,
      hit: false,
      size: normalize(48),
      speed: 3 + Math.random() * 2,
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

    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
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
  };

  const cleanPollution = (pollutionId) => {
    if (!gameStarted || gameOver) return;
    setPollution((prev) =>
      prev.map((item) =>
        item.id === pollutionId
          ? { ...item, cleaned: true, y: 0, x: Math.random() * (width - normalize(48)) }
          : item
      )
    );
    setScore((prev) => prev + 15);
  };

  const hitHazard = (hazardId) => {
    if (!gameStarted || gameOver) return;
    setHazards((prev) =>
      prev.map((hazard) =>
        hazard.id === hazardId
          ? { ...hazard, hit: true, y: 0, x: Math.random() * (width - normalize(48)) }
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
  };

  // Safe navigation function
  const handleGoBack = () => {
    try {
      if (navigation && typeof navigation.goBack === 'function') {
        navigation.goBack();
      } else {
        console.warn('Navigation not available');
        // You could add alternative navigation logic here
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  // Update endGame function to use safe navigation
  const endGame = () => {
    setGameOver(true);
    setGameStarted(false);

    // Add points to backend
    ApiService.addPoints(score).catch((err) => {
      console.error('Failed to add points:', err);
    });

    const treesPlanted = trees.filter((tree) => tree.planted).length;
    const pollutionCleaned = pollution.filter((item) => item.cleaned).length;

    let message = `Game Over!\nScore: ${score}\nTrees Planted: ${treesPlanted}/10\nPollution Cleaned: ${pollutionCleaned}/6\nHearts Left: ${hearts}`;
    if (treesPlanted === 10 && pollutionCleaned === 6) {
      message += '\n🌟 Victory! All trees planted and pollution cleaned!';
    } else if (hearts <= 0) {
      message += '\n💔 No hearts left! Try again!';
    } else if (timeLeft <= 0) {
      message += '\n⏰ Time\'s up! Try again!';
    } else {
      message += '\n💪 Keep trying! Plant all trees and clean all pollution!';
    }

    Alert.alert('Level 11 Complete', message, [
      { text: 'Play Again', onPress: startGame },
      { text: 'Main Menu', onPress: handleGoBack },
    ]);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setHearts(3);
    setTimeLeft(60);
    initializeGame();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.levelTitle}>LEVEL 11</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Game Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statText}>Score: {score}</Text>
        <Text style={styles.statText}>Time: {timeLeft}s</Text>
        <Text style={styles.statText}>Hearts: {'❤️'.repeat(hearts)}</Text>
        <Text style={styles.statText}>
          Trees: {trees.filter((t) => t.planted).length}/10
        </Text>
        <Text style={styles.statText}>
          Clean: {pollution.filter((p) => p.cleaned).length}/6
        </Text>
      </View>

      {/* Game Area */}
      <View style={styles.gameArea}>
        {/* Background */}
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
                backgroundColor: tree.planted ? '#0F0' : '#0A0',
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
              style={styles.sprite}
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
                opacity: item.cleaned ? 0 : 1, // Hide cleaned items
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
              style={styles.sprite}
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
                  },
                ]}
                onPress={() => hitHazard(hazard.id)}
              >
                <Image
                  source={require('../../../../../assets/images/levels/Level11/bomb.png')}
                  style={styles.sprite}
                />
              </TouchableOpacity>
            )
        )}

        {/* Instructions */}
        {!gameStarted && !gameOver && (
          <View style={styles.instructions}>
            <Text style={styles.instructionTitle}>Mission:</Text>
            <Text style={styles.instructionText}>
              Tap falling seedlings to plant trees (10 pts)
            </Text>
            <Text style={styles.instructionText}>
              Tap falling trash/smoke to clean it (15 pts)
            </Text>
            <Text style={styles.instructionText}>
              Avoid toxic waste (loses 1 heart)!
            </Text>
            <Text style={styles.instructionText}>
              Goal: Plant 10/10 trees and clean 6/6 pollution!
            </Text>
          </View>
        )}
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        {!gameStarted ? (
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.buttonText}>START</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
            <Text style={styles.buttonText}>RESET</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(15),
    paddingTop: normalize(40), // Account for status bar
    paddingBottom: normalize(15),
    backgroundColor: '#00F',
  },
  backButton: {
    padding: normalize(10),
    borderWidth: normalize(2),
    borderColor: '#FFF',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: normalize(80),
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFF',
    fontSize: normalize(12),
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  levelTitle: {
    color: '#FFF',
    fontSize: normalize(16),
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: normalize(80), // Balance the header layout
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(8),
    backgroundColor: '#333',
  },
  statText: {
    color: '#FFF',
    fontSize: normalize(12),
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  gameArea: {
    flex: 1,
    position: 'relative',
    margin: normalize(10),
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: normalize(2),
    borderColor: '#FFF',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0A0',
  },
  tree: {
    position: 'absolute',
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pollution: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF0',
    borderRadius: 0,
    borderWidth: normalize(2),
    borderColor: '#FFF',
  },
  hazard: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F00',
    borderRadius: 0,
    borderWidth: normalize(2),
    borderColor: '#000',
  },
  sprite: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  instructions: {
    position: 'absolute',
    top: '20%',
    left: normalize(20),
    right: normalize(20),
    backgroundColor: '#000',
    padding: normalize(10),
    borderWidth: normalize(2),
    borderColor: '#FFF',
  },
  instructionTitle: {
    fontSize: normalize(30),
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: normalize(6),
    textAlign: 'center',
  },
  instructionText: {
    fontSize: normalize(25),
    fontFamily: 'monospace',
    color: '#FFF',
    marginBottom: normalize(4),
    textAlign: 'center',
  },
  controlsContainer: {
    padding: normalize(10),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  startButton: {
    backgroundColor: '#0F0',
    paddingHorizontal: normalize(25),
    paddingVertical: normalize(10),
    borderRadius: 0,
    borderWidth: normalize(2),
    borderColor: '#FFF',
    marginHorizontal: normalize(10),
  },
  resetButton: {
    backgroundColor: '#F00',
    paddingHorizontal: normalize(25),
    paddingVertical: normalize(10),
    borderRadius: 0,
    borderWidth: normalize(2),
    borderColor: '#FFF',
    marginHorizontal: normalize(10),
  },
  buttonText: {
    color: '#FFF',
    fontSize: normalize(14),
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Level11Screen;