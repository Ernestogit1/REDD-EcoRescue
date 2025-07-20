import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';

// Beaver Trail Puzzle - Level 9
const GRID_SIZE = 4; // 4x4 grid for easier gameplay
const LOG_COLOR = '#8B5C2A';
const BOMB_COLOR = '#222';
const DEFAULT_COLOR = '#BFEFFF';
const BEAVER_COLOR = '#A0522D';

// Generate a random safe path from left to right
function generateTrail(gridSize) {
  let trail = [];
  let col = 0;
  let row = Math.floor(Math.random() * gridSize);
  while (col < gridSize) {
    trail.push([row, col]);
    // Move to next column, randomly up/down/straight
    if (col < gridSize - 1) {
      const move = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
      row = Math.max(0, Math.min(gridSize - 1, row + move));
    }
    col++;
  }
  return trail;
}

const Level9Screen = () => {
  const navigation = useNavigation();
  React.useEffect(() => {
    // Lock orientation to landscape when this screen mounts
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      // Optionally unlock when leaving
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
    };
  }, []);
  const [trail] = useState(generateTrail(GRID_SIZE));
  const [clicked, setClicked] = useState({});
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [beaverPos, setBeaverPos] = useState([-1, -1]); // beaver starts outside
  const [header] = useState('🦫 Beaver Trail Puzzle');
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showVisualHint, setShowVisualHint] = useState(false);

  // Find the start block coordinates
  const startRow = trail[0][0];
  const startCol = trail[0][1];

  const isTrail = (row, col) => trail.some(([r, c]) => r === row && c === col);
  const getNextTrailPos = (current) => {
    const idx = trail.findIndex(([r, c]) => r === current[0] && c === current[1]);
    return trail[idx + 1];
  };

  const handleBlockClick = (row, col) => {
    if (gameOver || clicked[`${row},${col}`]) return;
    const key = `${row},${col}`;
    let newClicked = { ...clicked };
    // If beaver is outside, only allow first move to the start block
    if (beaverPos[0] === -1 && beaverPos[1] === -1) {
      if (row === startRow && col === startCol) {
        newClicked[key] = isTrail(row, col) ? 'log' : 'bomb';
        setBeaverPos([startRow, startCol]);
        setScore(isTrail(row, col) ? score + 1 : score);
        if (!isTrail(row, col)) {
          setGameOver(true);
          setShowGameOverModal(true);
        }
      }
      setClicked(newClicked);
      return;
    }
    if (isTrail(row, col)) {
      newClicked[key] = 'log';
      setScore(score + 1);
      const next = getNextTrailPos(beaverPos);
      if (next && next[0] === row && next[1] === col) {
        setBeaverPos(next);
        if (next[0] === trail[trail.length - 1][0] && next[1] === trail[trail.length - 1][1]) {
          setGameOver(true);
          setShowWinModal(true);
        }
      }
    } else {
      newClicked[key] = 'bomb';
      setGameOver(true);
      setShowGameOverModal(true);
    }
    setClicked(newClicked);
  };

  const renderGrid = () => {
    let rows = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      let blocks = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        const key = `${r},${c}`;
        let bgColor = DEFAULT_COLOR;
       let blockStyle = {};
        if (clicked[key] === 'log') bgColor = LOG_COLOR;
        if (clicked[key] === 'bomb') bgColor = BOMB_COLOR;
        const isStart = r === startRow && c === startCol;
        const isEnd = r === trail[trail.length - 1][0] && c === trail[trail.length - 1][1];
        const isBeaver = beaverPos[0] === r && beaverPos[1] === c;
       // Visual hint: highlight trail blocks
       if (showVisualHint && isTrail(r, c)) {
         blockStyle = { ...blockStyle, borderWidth: 4, borderColor: '#FFD700', shadowColor: '#FFD700', shadowOpacity: 0.7, shadowRadius: 8 };
       }
        blocks.push(
          <View key={key} style={{ position: 'relative' }}>
            {/* Render beaver outside grid, left of start block */}
            {r === startRow && c === startCol && beaverPos[0] === -1 && beaverPos[1] === -1 && (
              <View style={{ position: 'absolute', left: -60, top: 0, zIndex: 2 }}>
                <Text style={styles.beaver}>🦫</Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.block,
                {
                  backgroundColor: bgColor,
                  borderWidth: isBeaver ? 3 : (isStart || isEnd ? 2 : 1),
                  borderColor: isBeaver ? BEAVER_COLOR : (isStart ? '#2E8B57' : isEnd ? '#FF6347' : '#888'),
                  ...blockStyle,
                }
              ]}
              onPress={() => handleBlockClick(r, c)}
              disabled={gameOver}
            >
              {isBeaver ? <Text style={styles.beaver}>🦫</Text> : null}
              {isStart && !isBeaver ? <Text style={styles.startEnd}>Start</Text> : null}
              {isEnd && !isBeaver ? <Text style={styles.startEnd}>End🏁</Text> : null}
              {isEnd && isBeaver ? <Text style={styles.endFlag}>🏁</Text> : null}
            </TouchableOpacity>
          </View>
        );
      }
      rows.push(
        <View key={r} style={styles.row}>
          {blocks}
        </View>
      );
    }
    return rows;
  };

  const hintText = trail.map(([r, c], idx) => idx === 0 ? `Start (${r + 1},${c + 1})` : idx === trail.length - 1 ? `End (${r + 1},${c + 1})` : `(${r + 1},${c + 1})`).join(' → ');

  return (
    <LinearGradient colors={["#2b5876", "#4e4376"]} style={styles.background}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.exitButton}>
          <Text style={styles.exitButtonText}>EXIT</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🦫 Beaver Trail Puzzle</Text>
        <Text style={styles.scoreText}>Score: {score}</Text>
      </View>
      <View style={styles.gameLayout}>
      <View style={styles.leftPanel}>
        <Text style={styles.instructions}>Create a safe trail across the broken river path to rescue the beaver!</Text>
        <TouchableOpacity
          style={styles.showHintBtn}
          onPress={() => {
            setShowVisualHint(true);
            setTimeout(() => setShowVisualHint(false), 2000);
          }}
          disabled={showVisualHint}
        >
          <Text style={styles.showHintText}>{showVisualHint ? 'Hint Showing...' : 'Show Hint'}</Text>
        </TouchableOpacity>
      </View>
        <View style={styles.gridPanel}>
          <View style={styles.grid}>{renderGrid()}</View>
        </View>
      </View>
      {/* Game Over Modal */}
      <Modal
        visible={showGameOverModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGameOverModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>💣 Oops! Try again.</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => {
              setClicked({});
              setScore(0);
              setGameOver(false);
              setBeaverPos([-1, -1]); // Reset beaver to outside the grid
              setShowGameOverModal(false);
              // Restart the game with a new trail
              const newTrail = generateTrail(GRID_SIZE);
              trail.splice(0, trail.length, ...newTrail);
            }}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Win Modal */}
      <Modal
        visible={showWinModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTextWin}>🎉 Congratulations!</Text>
            <Text style={styles.modalTextWinSub}>You rescued the beaver!</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => {
              setClicked({});
              setScore(0);
              setGameOver(false);
              setBeaverPos([-1, -1]); // Reset beaver to outside the grid
              setShowWinModal(false);
              // Restart the game with a new trail
              const newTrail = generateTrail(GRID_SIZE);
              trail.splice(0, trail.length, ...newTrail);
            }}>
              <Text style={styles.retryText}>Play Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
    backgroundColor: 'rgba(0,0,0,0.15)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  showHintBtn: {
    backgroundColor: '#FFD700',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  showHintText: {
    color: '#333',
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 14,
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
    fontSize: 18,
    letterSpacing: 1,
    textShadowColor: '#333',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  scoreText: {
    position: 'absolute',
    right: 15,
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFB703',
    fontSize: 14,
    backgroundColor: '#222',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gameLayout: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  leftPanel: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: 18,
    marginRight: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    minWidth: 220,
    maxWidth: 260,
  },
  gridPanel: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 14,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  instructions: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'left',
    color: '#FFD700',
    fontFamily: 'PressStart2P_400Regular',
    lineHeight: 22,
  },
  hint: {
    fontSize: 14,
    marginBottom: 8,
    color: '#FFB703',
    textAlign: 'left',
    fontFamily: 'PressStart2P_400Regular',
    lineHeight: 20,
  },
  score: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#2E8B57' },
  grid: { marginVertical: 10 },
  row: { flexDirection: 'row' },
  block: {
    width: 54,
    height: 54,
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#BFEFFF',
    shadowColor: '#222',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
  },
  beaver: { fontSize: 32, textShadowColor: '#222', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  startEnd: { fontSize: 13, color: '#333', fontWeight: 'bold', backgroundColor: '#FFD700', borderRadius: 6, paddingHorizontal: 4, paddingVertical: 2, marginTop: 2 },
  endFlag: { position: 'absolute', bottom: 2, right: 2, fontSize: 18 },
  result: { marginTop: 18, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 12 },
  resultText: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#FFD700', fontFamily: 'PressStart2P_400Regular', textAlign: 'center' },
  retryBtn: { backgroundColor: '#FFD700', padding: 10, borderRadius: 8, marginTop: 6 },
  retryText: { fontSize: 16, color: '#333', fontFamily: 'PressStart2P_400Regular' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  modalText: {
    fontSize: 22,
    color: '#FF6347',
    fontFamily: 'PressStart2P_400Regular',
    marginBottom: 18,
    textAlign: 'center',
  },
  modalTextWin: {
    fontSize: 26,
    color: '#2E8B57',
    fontFamily: 'PressStart2P_400Regular',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalTextWinSub: {
    fontSize: 20,
    color: '#FFD700',
    fontFamily: 'PressStart2P_400Regular',
    marginBottom: 18,
    textAlign: 'center',
  },
});

export default Level9Screen;

