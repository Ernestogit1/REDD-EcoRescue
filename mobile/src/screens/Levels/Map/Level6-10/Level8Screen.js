
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal, Animated, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// 8-bit pattern puzzle game for rescuing a baby Owl
const PATTERN_SIZE = 4; // 4x4 grid for Grade 3-4
const EMPTY = 0;
const FILLED = 1;
// Utility to generate a random pattern for the puzzle
function generateRandomPattern(size) {
  // For Grade 3-4, keep it simple: only 6-8 filled cells
  const filledCount = Math.floor(Math.random() * 3) + 6; // 6, 7, or 8
  let pattern = Array(size).fill().map(() => Array(size).fill(EMPTY));
  let placed = 0;
  while (placed < filledCount) {
    const i = Math.floor(Math.random() * size);
    const j = Math.floor(Math.random() * size);
    if (pattern[i][j] === EMPTY) {
      pattern[i][j] = FILLED;
      placed++;
    }
  }
  return pattern;
}

// Initial pattern
const initialPattern = generateRandomPattern(PATTERN_SIZE);

export default function Level8Screen() {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  // Responsive cell size based on screen width and height
  const gridArea = Math.min(width * 0.5, height * 0.4);
  const cellSize = Math.floor(gridArea / PATTERN_SIZE);
  const [grid, setGrid] = useState(Array(PATTERN_SIZE).fill().map(() => Array(PATTERN_SIZE).fill(EMPTY)));
  const [targetPattern, setTargetPattern] = useState(initialPattern);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState(''); // 'success' or 'failure'
  const [modalAnim] = useState(new Animated.Value(0));

  // Toggle cell state
  const toggleCell = (row, col) => {
    if (!gameStarted) return;
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = newGrid[row][col] === EMPTY ? FILLED : EMPTY;
    setGrid(newGrid);
    setScore(prev => Math.max(0, prev + 5));
  };

  // Check if pattern matches
  const checkPattern = () => {
    for (let i = 0; i < PATTERN_SIZE; i++) {
      for (let j = 0; j < PATTERN_SIZE; j++) {
        if (grid[i][j] !== targetPattern[i][j]) {
          show8BitAlert('failure', 'Incorrect pattern! Try again.');
          setScore(prev => Math.max(0, prev - 10));
          return;
        }
      }
    }
    show8BitAlert('success', 'You solved the puzzle and rescued the baby Owl!');
    setScore(prev => prev + 50);
  };

  // Reset game
  const resetGame = () => {
    setGrid(Array(PATTERN_SIZE).fill().map(() => Array(PATTERN_SIZE).fill(EMPTY)));
    setTargetPattern(generateRandomPattern(PATTERN_SIZE));
    setScore(0);
    setGameStarted(true);
  };

  // Custom alert function
  const show8BitAlert = (type, message) => {
    setModalType(type);
    setModalMessage(message);
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
  };

  return (
    <View style={[styles.container, { minHeight: height }]}> 
      <LinearGradient colors={['#1A3C40', '#0D1B1E']} style={[styles.background, { minHeight: height }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.exitButton}>
            <Text style={styles.exitButtonText}>EXIT</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>RESCUE THE BABY OWL</Text>
          <Text style={styles.scoreText}>Score: {score}</Text>
        </View>

        {/* Game Layout */}
        <View style={[styles.gameLayout, { flexDirection: width > height ? 'row' : 'column', paddingHorizontal: Math.max(10, width * 0.03), paddingTop: Math.max(20, height * 0.03) }]}> 
          <View style={[styles.instructionsBox, { width: width > height ? Math.max(180, width * 0.35) : '100%', marginRight: width > height ? 10 : 0, marginBottom: width > height ? 0 : 10 }]}> 
            <Text style={styles.instructionsText}>
              Tap the cells to match the pattern and rescue the baby Owl!
            </Text>
            <View style={styles.targetPatternBox}>
              <Text style={styles.targetPatternLabel}>Target Pattern:</Text>
              <View style={[styles.patternGrid, { width: cellSize * PATTERN_SIZE + 8, height: cellSize * PATTERN_SIZE + 8 }]}> 
                {targetPattern.map((row, i) => (
                  <View key={i} style={styles.patternRow}>
                    {row.map((cell, j) => (
                      <View
                        key={j}
                        style={[styles.patternCell, { width: cellSize, height: cellSize }, cell === FILLED && styles.patternCellFilled]}
                      />
                    ))}
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Puzzle Grid and Check Button below */}
          <View style={[styles.puzzleBox, { flex: 1, minWidth: cellSize * PATTERN_SIZE + 20 }]}> 
            <Text style={styles.puzzleLabel}>Your Pattern:</Text>
            <View style={[styles.patternGrid, { width: cellSize * PATTERN_SIZE + 8, height: cellSize * PATTERN_SIZE + 8 }]}> 
              {grid.map((row, i) => (
                <View key={i} style={styles.patternRow}>
                  {row.map((cell, j) => (
                    <TouchableOpacity
                      key={j}
                      style={[styles.patternCell, { width: cellSize, height: cellSize }, cell === FILLED && styles.patternCellFilled]}
                      onPress={() => toggleCell(i, j)}
                      disabled={!gameStarted}
                    />
                  ))}
                </View>
              ))}
            </View>
            {/* Check Button below puzzle grid */}
            {gameStarted && (
              <TouchableOpacity style={styles.checkButtonInline} onPress={checkPattern}>
                <Text style={styles.checkButtonText}>CHECK PATTERN</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Start Button */}
        {!gameStarted && (
          <TouchableOpacity style={[styles.startButton, { bottom: Math.max(40, height * 0.05) }]} onPress={resetGame}>
            <Text style={styles.startButtonText}>START GAME</Text>
          </TouchableOpacity>
        )}

        {/* 8-Bit Style Alert Modal */}
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
                colors={modalType === 'success' ? ['#76C893', '#52B69A'] : ['#E63946', '#D00000']}
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
                    if (modalType === 'success') setGameStarted(false);
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
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  background: {
    flex: 1,
    paddingTop: 0,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
    minHeight: 60,
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
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 14,
    letterSpacing: 1,
  },
  headerTitle: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 16,
    textAlign: 'center',
    flex: 1,
  },
  scoreText: {
    position: 'absolute',
    right: 15,
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFB703',
    fontSize: 12,
    zIndex: 2,
  },
  gameLayout: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 10,
  },
  instructionsBox: {
    backgroundColor: '#1A759F',
    borderRadius: 8,
    padding: 10,
    borderWidth: 2,
    borderColor: '#FFD700',
    alignSelf: 'center',
    minHeight: 120,
    minWidth: 120,
    maxWidth: '100%',
  },
  instructionsText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  targetPatternBox: {
    alignItems: 'center',
    width: '100%',
  },
  targetPatternLabel: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 10,
    marginBottom: 4,
    textAlign: 'center',
  },
  patternGrid: {
    flexDirection: 'column',
    backgroundColor: '#000',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFD700',
    padding: 4,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  patternRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  patternCell: {
    margin: 2,
    borderRadius: 6,
    backgroundColor: '#1A3C40',
    borderWidth: 2,
    borderColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternCellFilled: {
    backgroundColor: '#FFD700',
  },
  puzzleBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#76C893',
    borderRadius: 8,
    padding: 10,
    borderWidth: 2,
    borderColor: '#FFD700',
    minHeight: 120,
    minWidth: 120,
    maxWidth: '100%',
    alignSelf: 'center',
  },
  puzzleLabel: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#1A3C40',
    fontSize: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  startButton: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#76C893',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    elevation: 5,
    minWidth: 120,
  },
  startButtonText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
  },
  checkButton: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    elevation: 5,
    minWidth: 120,
  },
  checkButtonInline: {
    marginTop: 18,
    alignSelf: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    elevation: 5,
    minWidth: 120,
  },
  checkButtonText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#1A3C40',
    fontSize: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxWidth: 300,
    backgroundColor: '#2A2B2A',
    borderWidth: 4,
    borderColor: '#FFD700',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
  },
  modalHeaderText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
  },
  modalBody: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#1A3C40',
  },
  modalMessage: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButton: {
    width: '80%',
    height: 44,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  modalButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 12,
    textAlign: 'center',
  },
});
