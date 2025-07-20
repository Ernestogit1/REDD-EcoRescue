import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  PanResponder,
  BackHandler,
  ImageBackground,
  Image,
  Modal,
  Animated,
} from 'react-native';
import { PixelRatio } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../../../../services/api.service';
import { LinearGradient } from 'expo-linear-gradient';

// Get window dimensions
const { width, height } = Dimensions.get('window');
const pixelRatio = PixelRatio.get();
const scale = Math.min(width, height) / 720; // Adjusted reference size for better scaling

// Normalize sizes for different screen resolutions
const normalize = (size) => Math.round(size * scale * pixelRatio) / pixelRatio;

// Grid setup for 8-bit Sudoku
const GRID_SIZE = 9;
const GAME_AREA_MARGIN = normalize(10);
const HEADER_HEIGHT = normalize(60);
const STATS_HEIGHT = normalize(30);
const CONTROLS_HEIGHT = normalize(140); // Reduced to fit number pad and D-pad
const MAX_CELL_SIZE = normalize(50);
const CELL_SIZE = Math.min(
  Math.floor((Math.min(width, height - HEADER_HEIGHT - STATS_HEIGHT - CONTROLS_HEIGHT - 2 * GAME_AREA_MARGIN) / GRID_SIZE)),
  MAX_CELL_SIZE
);
const GRID_WIDTH = CELL_SIZE * GRID_SIZE;

// Sample Sudoku puzzle (30 clues, medium difficulty, unique solution)
const initialPuzzle = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

// Solution for validation
const solution = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

// Directions for swipe navigation
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

const Level14Screen = () => {
  const navigation = useNavigation();
  const [gameState, setGameState] = useState({
    grid: initialPuzzle.map(row => [...row]), // Player's grid
    selectedCell: { x: -1, y: -1 }, // Selected cell for input
    score: 0,
    gameStarted: false,
    gameOver: false,
  });

  // Refs for timers and game state
  const endGameRef = useRef(false);
  const lastSwipeTimeRef = useRef(0);
  const showDebug = process.env.NODE_ENV === 'development';

  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('success'); // 'success' or 'failure'
  const [modalMessage, setModalMessage] = useState('');
  const [modalAnim] = useState(new Animated.Value(0));

  // Initialize game
  const initializeGame = useCallback(() => {
    endGameRef.current = false;
    setGameState({
      grid: initialPuzzle.map(row => [...row]),
      selectedCell: { x: -1, y: -1 },
      score: 0,
      gameStarted: false,
      gameOver: false,
    });
    if (showDebug) console.log('Game initialized, score reset to 0');
  }, []);

  // Check if a number can be placed in the grid
  const isValidPlacement = (grid, row, col, num) => {
    // Check row
    for (let x = 0; x < GRID_SIZE; x++) {
      if (grid[row][x] === num) return false;
    }
    // Check column
    for (let x = 0; x < GRID_SIZE; x++) {
      if (grid[x][col] === num) return false;
    }
    // Check 3x3 subgrid
    const startRow = row - (row % 3);
    const startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[i + startRow][j + startCol] === num) return false;
      }
    }
    return true;
  };

  // Check if the puzzle is complete
  const isPuzzleComplete = (grid) => {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (grid[i][j] === 0 || grid[i][j] !== solution[i][j]) return false;
      }
    }
    return true;
  };

  // Place a number in the grid
  const placeNumber = useCallback((num) => {
    if (!gameState.gameStarted || gameState.gameOver || gameState.selectedCell.x === -1) return;
    const { x, y } = gameState.selectedCell;
    if (initialPuzzle[y][x] !== 0) return; // Can't change initial clues

    setGameState((prev) => {
      const newGrid = prev.grid.map(row => [...row]);
      newGrid[y][x] = num;
      let newScore = prev.score;
      const isCorrect = num === solution[y][x];
      if (isCorrect) {
        newScore += 10; // 10 points for correct placement
        if (showDebug) console.log(`Correct placement at (${x}, ${y}): ${num}, new score: ${newScore}`);
      } else {
        newScore = Math.max(0, newScore - 5); // Deduct 5 points for incorrect, min 0
        if (showDebug) console.log(`Incorrect placement at (${x}, ${y}): ${num}, new score: ${newScore}`);
      }

      const isComplete = isPuzzleComplete(newGrid);
      if (isComplete) {
        newScore += 100; // 100-point bonus for completion
        if (showDebug) console.log(`Puzzle completed, added 100-point bonus, final score: ${newScore}`);
        endGame(newScore);
        return { ...prev, grid: newGrid, score: newScore, gameOver: true };
      }

      return { ...prev, grid: newGrid, score: newScore };
    });
  }, [gameState.gameStarted, gameState.gameOver, gameState.selectedCell]);

  // Select a cell
  const selectCell = useCallback((x, y) => {
    if (!gameState.gameStarted || gameState.gameOver) return;
    setGameState((prev) => ({ ...prev, selectedCell: { x, y } }));
    if (showDebug) console.log(`Selected cell: (${x}, ${y})`);
  }, [gameState.gameStarted, gameState.gameOver]);

  // Move selection with D-pad or swipe
  const moveSelection = useCallback((direction) => {
    if (!gameState.gameStarted || gameState.gameOver || gameState.selectedCell.x === -1) return;
    setGameState((prev) => {
      const newX = Math.max(0, Math.min(GRID_SIZE - 1, prev.selectedCell.x + direction.x));
      const newY = Math.max(0, Math.min(GRID_SIZE - 1, prev.selectedCell.y + direction.y));
      return { ...prev, selectedCell: { x: newX, y: newY } };
    });
  }, [gameState.gameStarted, gameState.gameOver, gameState.selectedCell]);

  // Swipe controls
  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => gameState.gameStarted && !gameState.gameOver,
        onMoveShouldSetPanResponder: () => gameState.gameStarted && !gameState.gameOver,
        onPanResponderMove: (evt, gestureState) => {
          const now = Date.now();
          if (now - lastSwipeTimeRef.current < 100) return;
          lastSwipeTimeRef.current = now;

          const { dx, dy } = gestureState;
          if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 50) moveSelection(DIRECTIONS.RIGHT);
            else if (dx < -50) moveSelection(DIRECTIONS.LEFT);
          } else {
            if (dy > 50) moveSelection(DIRECTIONS.DOWN);
            else if (dy < -50) moveSelection(DIRECTIONS.UP);
          }
        },
      }),
    [gameState.gameStarted, gameState.gameOver, moveSelection]
  );

  // End game function (refactored for modal)
  const endGame = useCallback((finalScore) => {
    if (gameState.gameOver || endGameRef.current) return;
    endGameRef.current = true;

    setGameState((prev) => {
      if (showDebug) console.log(`Game ended, final score: ${finalScore}`);
      return { ...prev, gameOver: true, gameStarted: false };
    });

    // Add points to backend
    ApiService.addPoints(finalScore).catch((err) => {
      console.error('Failed to add points:', err);
    });

    // Mark level as completed on backend
    try {
      ApiService.markLevelComplete(14);
    } catch (err) {
      console.error('Failed to mark level 14 as completed:', err);
    }

    let message = `Score: ${finalScore}`;
    if (finalScore >= 100) {
      setModalType('success');
      setModalMessage('★ VICTORY! ★\nYou solved the Ocean Sudoku!');
    } else {
      setModalType('failure');
      setModalMessage('× TRY AGAIN ×\nTry again to reach 100 points!');
    }
    setShowModal(true);
    Animated.sequence([
      Animated.timing(modalAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(modalAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(modalAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();
  }, [showDebug, initializeGame]);

  // Start game
  const startGame = useCallback(() => {
    initializeGame();
    setGameState((prev) => ({ ...prev, gameStarted: true, gameOver: false, selectedCell: { x: 0, y: 0 } }));
  }, [initializeGame]);

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);

  // Initialize game on mount
  useEffect(() => {
    initializeGame();
    const subscription = Dimensions.addEventListener('change', initializeGame);
    return () => subscription?.remove();
  }, [initializeGame]);

  const PIXEL_BG = require('../../../../../assets/images/levels/Level12/tree.jpg'); // Use your pixel-art background asset

  return (
    <ImageBackground source={PIXEL_BG} style={styles.pixelBackground} resizeMode="cover">
      <View style={styles.outerContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.exitButton}>
            <Text style={styles.exitButtonText}>EXIT</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>LEVEL 14: OCEAN SUDOKU</Text>
          <Text style={styles.scoreText}>Score: {gameState.score}</Text>
        </View>
        {/* Main Content: Board + Number Pad */}
        <View style={styles.mainRow}>
          {/* Game Area */}
          <View style={styles.gameArea} {...panResponder.panHandlers}>
            <View style={styles.gridContainer}>
              {gameState.grid.map((row, y) => (
                row.map((num, x) => (
                  <TouchableOpacity
                    key={`${x}-${y}`}
                    style={[
                      styles.cell,
                      {
                        left: x * CELL_SIZE,
                        top: y * CELL_SIZE,
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        borderRightWidth: (x + 1) % 3 === 0 ? normalize(4) : normalize(2),
                        borderBottomWidth: (y + 1) % 3 === 0 ? normalize(4) : normalize(2),
                        backgroundColor:
                          gameState.selectedCell.x === x && gameState.selectedCell.y === y
                            ? '#FFD700'
                            : initialPuzzle[y][x] !== 0
                            ? '#1E90FF'
                            : num === solution[y][x]
                            ? '#39FF14'
                            : num !== 0
                            ? '#FF3131'
                            : '#222',
                        borderColor: '#FFF',
                        shadowColor: '#000',
                        shadowOffset: { width: 2, height: 2 },
                        shadowOpacity: 0.7,
                        shadowRadius: 0,
                      },
                    ]}
                    onPress={() => selectCell(x, y)}
                  >
                    <Text style={styles.cellText}>{num !== 0 ? num : ''}</Text>
                  </TouchableOpacity>
                ))
              ))}
            </View>
            {showDebug && gameState.gameStarted && (
              <Text style={styles.debugText}>
                Selected: ({gameState.selectedCell.x}, {gameState.selectedCell.y}) | Score: {gameState.score}
              </Text>
            )}
            {/* Instructions */}
            {!gameState.gameStarted && !gameState.gameOver && (
              <View style={styles.instructionsBox}>
                <Text style={styles.instructionTitle}>Mission: Solve the Ocean Puzzle!</Text>
                <Text style={styles.instructionText}>👆 Tap a cell, then a number to place it</Text>
                <Text style={styles.instructionText}>🔢 Correct: +10 pts, Incorrect: -5 pts</Text>
                <Text style={styles.instructionText}>🎯 Complete puzzle: +100 pts</Text>
                <Text style={styles.instructionText}>🐠 No repeats in row, column, or 3x3</Text>
                <Text style={styles.instructionText}>🌍 Protect oceans: Reduce plastic!</Text>
              </View>
            )}
          </View>
          {/* Number Pad on the right */}
          <View style={styles.numberPadContainer}>
            {gameState.gameStarted ? (
              <View style={styles.numberPadBox}>
                {[1,2,3,4,5,6,7,8,9].map((num, idx) => (
                  <TouchableOpacity
                    key={num}
                    style={styles.numberButton}
                    onPress={() => placeNumber(num)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.numberText}>{num}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <TouchableOpacity style={styles.startButton} onPress={startGame}>
                <Text style={styles.buttonText}>START PUZZLE</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {/* 8-Bit Style Endgame Modal */}
        <Modal
          transparent={true}
          visible={showModal}
          animationType="none"
        >
          <View style={styles.modalOverlay}>
            <Animated.View 
              style={[
                styles.modalContent,
                {
                  transform: [
                    { scale: modalAnim }
                  ]
                }
              ]}
            >
              <LinearGradient
                colors={modalType === 'success' ? ['#FFD700', '#FB8500'] : ['#E63946', '#D00000']}
                style={styles.modalHeader}
              >
                <Text style={styles.modalHeaderText}>
                  {modalType === 'success' ? '★ VICTORY! ★' : '× TRY AGAIN ×'}
                </Text>
              </LinearGradient>
              <View style={styles.modalBody}>
                <Text style={styles.modalMessage}>{modalMessage}</Text>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => {
                    setShowModal(false);
                    if (modalType === 'success') initializeGame();
                    else initializeGame();
                  }}
                >
                  <LinearGradient
                    colors={['#FFB703', '#FB8500']}
                    style={styles.modalButtonGradient}
                  >
                    <Text style={styles.modalButtonText}>
                      {modalType === 'success' ? 'PLAY AGAIN' : 'TRY AGAIN'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  pixelBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  outerContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
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
  exitButton: {
    position: 'absolute',
    left: 10,
    top: '50%',
    transform: [{ translateY: -16 }],
    backgroundColor: '#FFD700',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#FFF',
    zIndex: 10,
  },
  exitButtonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: 'PressStart2P_400Regular',
  },
  headerTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
    textShadowColor: '#333',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    flex: 1,
    textAlign: 'center',
    fontFamily: 'PressStart2P_400Regular',
  },
  scoreText: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -16 }],
    fontSize: 14,
    color: '#FFB703',
    backgroundColor: '#222',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: 'bold',
    fontFamily: 'PressStart2P_400Regular',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  mainRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    marginTop: 10,
  },
  gameArea: {
    margin: GAME_AREA_MARGIN,
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: normalize(4),
    borderColor: '#FFF',
    backgroundColor: 'rgba(30, 144, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  gridContainer: {
    width: GRID_WIDTH,
    height: GRID_WIDTH,
    position: 'relative',
    backgroundColor: '#111',
    borderWidth: normalize(2),
    borderColor: '#FFD700',
  },
  cell: {
    position: 'absolute',
    borderWidth: normalize(2),
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0,
  },
  cellText: {
    fontSize: normalize(18),
    fontFamily: 'PressStart2P_400Regular',
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  instructionsBox: {
    position: 'absolute',
    top: '20%',
    left: normalize(10),
    right: normalize(10),
    backgroundColor: '#222',
    padding: normalize(10),
    borderWidth: normalize(4),
    borderColor: '#FFD700',
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 0,
  },
  instructionTitle: {
    fontSize: normalize(18),
    fontFamily: 'PressStart2P_400Regular',
    fontWeight: 'bold',
    color: '#39FF14',
    marginBottom: normalize(5),
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  instructionText: {
    fontSize: normalize(12),
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    marginBottom: normalize(2),
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  controlsContainer: {
    padding: normalize(10),
    backgroundColor: '#111',
    height: CONTROLS_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: normalize(4),
    borderColor: '#FFF',
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: normalize(220),
  },
  numberPadContainer: {
    marginLeft: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 0,
    minWidth: 60,
    height: '100%',
  },
  numberPadBox: {
    width: 144,
    height: 250,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
    borderWidth: 3,
    borderColor: '#FFD700',
    borderRadius: 0,
    padding: 4,
  },
  numberButton: {
    backgroundColor: '#222',
    margin: 4,
    borderWidth: 3,
    borderColor: '#FFD700',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 0,
  },
  numberText: {
    color: '#39FF14',
    fontSize: 20,
    fontFamily: 'PressStart2P_400Regular',
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  startButton: {
    backgroundColor: '#39FF14',
    paddingHorizontal: normalize(25),
    paddingVertical: normalize(12),
    borderRadius: 0,
    borderWidth: normalize(4),
    borderColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 0,
  },
  buttonText: {
    color: '#222',
    fontSize: normalize(13),
    fontFamily: 'PressStart2P_400Regular',
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: '#FFF',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  pixelIcon: {
    width: normalize(20),
    height: normalize(20),
    marginRight: normalize(8),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modalContent: {
    width: 320,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#222',
    borderWidth: 4,
    borderColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
  },
  modalHeader: {
    width: '100%',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderColor: '#FFF',
  },
  modalHeaderText: {
    color: '#FFF',
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: '#333',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  modalBody: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalMessage: {
    color: '#FFD700',
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 18,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  modalButton: {
    width: 200,
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  modalButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: '#222',
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default Level14Screen;