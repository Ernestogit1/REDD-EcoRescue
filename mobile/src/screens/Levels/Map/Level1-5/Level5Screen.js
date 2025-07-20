import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../../../../services/api.service';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Game constants
const FROG_SIZE = 60;
const FLY_SIZE = 40;
const LILY_PAD_SIZE = 80;
const JOYSTICK_SIZE = 100;

export default function Level5Screen() {
  const navigation = useNavigation();
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(30);
  const [gameComplete, setGameComplete] = useState(false);
  const [flies, setFlies] = useState([]);
  const [lilyPads, setLilyPads] = useState([]);
  const [currentPad, setCurrentPad] = useState(0);
  const [frogPosition, setFrogPosition] = useState({ x: 0, y: 0 });
  const [frogRotation, setFrogRotation] = useState(0);
  const [jumpHeight, setJumpHeight] = useState(0);
  const [tongue, setTongue] = useState({ active: false, x: 0, y: 0, targetX: 0, targetY: 0, length: 0, angle: 0 });
  const [aimTarget, setAimTarget] = useState({ x: 0, y: -20 });
  const timerRef = useRef(null);
  const gameInterval = useRef(null);
  const jumpTimerRef = useRef(null);
  const tongueTimerRef = useRef(null);
  
  // Joystick state
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPosition, setJoystickPosition] = useState({ x: 70, y: screenHeight - 140 });
  const [joystickValue, setJoystickValue] = useState({ x: 0, y: -1 });
  const [knobPosition, setKnobPosition] = useState({ x: 0, y: 0 });
  const joystickBaseRadius = JOYSTICK_SIZE / 2;
  const joystickKnobRadius = JOYSTICK_SIZE / 4;

  // Initialize game
  useEffect(() => {
    startGame();
    return () => {
      clearInterval(timerRef.current);
      clearInterval(gameInterval.current);
      clearTimeout(jumpTimerRef.current);
      clearTimeout(tongueTimerRef.current);
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (timer === 0) handleGameOver();
  }, [timer]);

  // Setup lily pads
  const setupLilyPads = () => {
    const pads = [];
    const padCount = 5;
    const padSpacing = screenWidth / (padCount + 1);
    
    for (let i = 0; i < padCount; i++) {
      pads.push({
        id: i,
        x: padSpacing * (i + 1) - LILY_PAD_SIZE / 2,
        y: screenHeight - 180
      });
    }
    
    setLilyPads(pads);
    
    // Set initial frog position
    const middlePad = Math.floor(padCount / 2);
    setCurrentPad(middlePad);
    const frogX = pads[middlePad].x + LILY_PAD_SIZE / 2 - FROG_SIZE / 2;
    const frogY = pads[middlePad].y - FROG_SIZE;
    setFrogPosition({
      x: frogX,
      y: frogY
    });
    
    // Set initial aim target (up from frog)
    setAimTarget({
      x: frogX + FROG_SIZE / 2,
      y: frogY - 20
    });
    
    // Reset joystick knob to center
    setKnobPosition({ x: 0, y: 0 });
  };

  const startGame = () => {
    setScore(0);
    setTimer(30);
    setGameComplete(false);
    setFlies([]);
    setJumpHeight(0);
    setFrogRotation(0);
    setTongue({ active: false, x: 0, y: 0, targetX: 0, targetY: 0, length: 0, angle: 0 });
    setJoystickActive(false);
    setJoystickValue({ x: 0, y: -1 });
    setKnobPosition({ x: 0, y: 0 });
    
    // Setup lily pads
    setupLilyPads();
    
    // Start timer
    timerRef.current = setInterval(() => {
      setTimer(prev => Math.max(0, prev - 1));
    }, 1000);

    // Spawn flies periodically
    gameInterval.current = setInterval(() => {
      spawnFly();
    }, 1500);
  };

  const spawnFly = () => {
    const newFly = {
      id: Date.now(),
      x: Math.random() * (screenWidth - FLY_SIZE),
      y: Math.random() * (screenHeight / 2 - FLY_SIZE),
      speedX: (Math.random() - 0.5) * 4,
      speedY: (Math.random() - 0.5) * 2
    };
    
    setFlies(prev => [...prev, newFly]);
    
    // Remove fly after 8 seconds if not caught
    setTimeout(() => {
      setFlies(prev => prev.filter(fly => fly.id !== newFly.id));
    }, 8000);
  };

  const moveFlies = () => {
    setFlies(prev => prev.map(fly => {
      let newX = fly.x + fly.speedX;
      let newY = fly.y + fly.speedY;
      
      // Bounce off edges
      if (newX <= 0 || newX >= screenWidth - FLY_SIZE) {
        fly.speedX *= -1;
        newX = fly.x + fly.speedX;
      }
      
      if (newY <= 0 || newY >= screenHeight / 2) {
        fly.speedY *= -1;
        newY = fly.y + fly.speedY;
      }
      
      return { ...fly, x: newX, y: newY };
    }));
  };

  // Move flies every frame
  useEffect(() => {
    if (gameComplete || flies.length === 0) return;
    
    const flyInterval = setInterval(() => {
      moveFlies();
    }, 50);
    
    return () => clearInterval(flyInterval);
  }, [flies, gameComplete]);

  const handleLilyPadPress = (padIndex) => {
    if (tongue.active || gameComplete || jumpHeight !== 0 || joystickActive) return;
    
    // Jump to new lily pad
    const jumpDistance = Math.abs(padIndex - currentPad);
    const direction = padIndex > currentPad ? 1 : -1;
    
    // Set rotation based on direction
    setFrogRotation(direction > 0 ? 0 : 180);
    
    // Animate jump manually with setTimeout
    const jumpDuration = 300 * jumpDistance;
    const jumpSteps = 10;
    const stepTime = jumpDuration / jumpSteps;
    let step = 0;
    
    const animateJump = () => {
      step++;
      // Calculate jump height using a sine curve for smooth animation
      const progress = step / jumpSteps;
      const jumpHeightValue = Math.sin(progress * Math.PI) * 40;
      
      setJumpHeight(jumpHeightValue);
      
      if (step < jumpSteps) {
        jumpTimerRef.current = setTimeout(animateJump, stepTime);
      } else {
        // Jump complete
        setJumpHeight(0);
        const newPad = lilyPads[padIndex];
        setCurrentPad(padIndex);
        const newFrogX = newPad.x + LILY_PAD_SIZE / 2 - FROG_SIZE / 2;
        const newFrogY = newPad.y - FROG_SIZE;
        setFrogPosition({
          x: newFrogX,
          y: newFrogY
        });
        
        // Update aim target relative to new frog position
        updateAimTargetFromJoystick();
      }
    };
    
    // Start jump animation
    animateJump();
  };

  // Fixed joystick handlers
  const handleJoystickStart = (event) => {
    if (tongue.active || gameComplete || jumpHeight !== 0) return;
    setJoystickActive(true);
    updateJoystickPosition(event.nativeEvent.locationX, event.nativeEvent.locationY);
  };

  const handleJoystickMove = (event) => {
    if (!joystickActive) return;
    updateJoystickPosition(event.nativeEvent.locationX, event.nativeEvent.locationY);
  };

  const handleJoystickEnd = () => {
    setJoystickActive(false);
    // Keep the last joystick direction
  };

  const handleGameOver = () => {
    clearInterval(timerRef.current);
    clearInterval(gameInterval.current);
    clearTimeout(jumpTimerRef.current);
    clearTimeout(tongueTimerRef.current);
    setGameComplete(true);

    if (score >= 100) {
      // Send points to backend
      ApiService.addPoints(score).catch((err) => {
        console.error('Failed to add points:', err);
      });
      Alert.alert(
        "Level Complete!",
        `Great job! You caught ${score / 10} flies!`,
        [{ text: "Continue", onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert(
        "Time's Up!",
        `You caught ${score / 10} flies. Try again to reach 10!`,
        [
          { text: "Retry", onPress: () => startGame() },
          { text: "Exit", onPress: () => navigation.goBack() }
        ]
      );
    }
  };

  // Fixed joystick position calculation
  const updateJoystickPosition = (touchX, touchY) => {
    const centerX = joystickPosition.x;
    const centerY = joystickPosition.y;
    let dx = touchX - centerX;
    let dy = touchY - centerY;
    
    // Calculate the distance from center
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = joystickBaseRadius - joystickKnobRadius;
    
    // If the touch is outside the joystick base, normalize it to the edge
    if (distance > maxRadius) {
      const angle = Math.atan2(dy, dx);
      dx = Math.cos(angle) * maxRadius;
      dy = Math.sin(angle) * maxRadius;
    }
    
    // Update knob position
    setKnobPosition({ x: dx, y: dy });
    
    // Calculate normalized joystick values (-1 to 1)
    const normalizedX = dx / maxRadius;
    const normalizedY = dy / maxRadius;
    
    // Update joystick value
    setJoystickValue({ x: normalizedX, y: normalizedY });
    
    // Update aim target based on joystick position
    updateAimTargetFromJoystick(normalizedX, normalizedY);
  };

  // Fixed aim target update
  const updateAimTargetFromJoystick = (normX = joystickValue.x, normY = joystickValue.y) => {
    const frogCenterX = frogPosition.x + FROG_SIZE / 2;
    const frogCenterY = frogPosition.y + FROG_SIZE / 3;
    const aimLength = 250;
    
    // Use joystick value to calculate aim direction
    const aimX = frogCenterX + normX * aimLength;
    const aimY = frogCenterY + normY * aimLength;
    
    setAimTarget({ x: aimX, y: aimY });
  };

  // Fire tongue based on current aim target
  const handleFireTongue = () => {
    if (tongue.active || gameComplete) return;
    
    shootTongue(aimTarget.x, aimTarget.y);
  };

  // Rectangle-circle overlap check
  function rectCircleCollides(rx, ry, rw, rh, cx, cy, cr) {
    const closestX = Math.max(rx, Math.min(cx, rx + rw));
    const closestY = Math.max(ry, Math.min(cy, ry + rh));
    const distanceX = cx - closestX;
    const distanceY = cy - closestY;
    return (distanceX * distanceX + distanceY * distanceY) < (cr * cr);
  }

  // Fixed shootTongue with continuous collision check
  const shootTongue = (x, y) => {
    if (tongue.active || gameComplete) return;

    const frogX = frogPosition.x + FROG_SIZE / 2;
    const frogY = frogPosition.y + FROG_SIZE / 3;

    const dx = x - frogX;
    const dy = y - frogY;
    const totalLength = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    setTongue({
      active: true,
      x: frogX,
      y: frogY,
      targetX: x,
      targetY: y,
      length: 0,
      angle: angle
    });

    const tongueExtendDuration = 300;
    const tongueRetractDuration = 200;
    const tongueSteps = 15;
    const extendStepTime = tongueExtendDuration / tongueSteps;
    const retractStepTime = tongueRetractDuration / tongueSteps;
    let step = 0;
    let fliesHit = [];

    const checkStepCollisions = (currentLength) => {
      const tongueAngleRad = angle * Math.PI / 180;
      const tongueStartX = frogX;
      const tongueStartY = frogY;
      const tongueEndX = tongueStartX + Math.cos(tongueAngleRad) * currentLength;
      const tongueEndY = tongueStartY + Math.sin(tongueAngleRad) * currentLength;
      
      const minX = Math.min(tongueStartX, tongueEndX);
      const minY = Math.min(tongueStartY, tongueEndY);
      const rw = Math.abs(tongueEndX - tongueStartX);
      const rh = Math.abs(tongueEndY - tongueStartY);
      
      const thickness = 16;
      let rx = minX, ry = minY, width = rw, height = rh;
      if (rw > rh) {
        ry -= thickness / 2;
        height += thickness;
      } else {
        rx -= thickness / 2;
        width += thickness;
      }

      setFlies(prevFlies => {
        let updated = prevFlies.map((fly) => {
          if (fliesHit.includes(fly.id)) return fly;
          const flyCenterX = fly.x + FLY_SIZE / 2;
          const flyCenterY = fly.y + FLY_SIZE / 2;
          const hit = rectCircleCollides(rx, ry, width, height, flyCenterX, flyCenterY, FLY_SIZE / 2);
          if (hit) {
            fliesHit.push(fly.id);
            setScore(s => s + 10);
          }
          return fly;
        });
        return updated.filter(fly => !fliesHit.includes(fly.id));
      });
    };

    const animateTongueExtend = () => {
      step++;
      const progress = step / tongueSteps;
      const currentLength = totalLength * progress;
      setTongue(prev => ({ ...prev, length: currentLength }));
      checkStepCollisions(currentLength);
      if (step < tongueSteps) {
        tongueTimerRef.current = setTimeout(animateTongueExtend, extendStepTime);
      } else {
        step = 0;
        animateTongueRetract();
      }
    };

    const animateTongueRetract = () => {
      step++;
      const progress = 1 - (step / tongueSteps);
      const currentLength = totalLength * progress;
      setTongue(prev => ({ ...prev, length: currentLength }));
      checkStepCollisions(currentLength);
      if (step < tongueSteps) {
        tongueTimerRef.current = setTimeout(animateTongueRetract, retractStepTime);
      } else {
        setTongue(prev => ({ ...prev, active: false, length: 0 }));
      }
    };

    animateTongueExtend();
  };

  // Draw the aiming line
  const renderAimingLine = () => {
    if (tongue.active) return null;
    
    const frogX = frogPosition.x + FROG_SIZE / 2;
    const frogY = frogPosition.y + FROG_SIZE / 3;
    
    const dx = aimTarget.x - frogX;
    const dy = aimTarget.y - frogY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    const dashLength = 10;
    const gapLength = 5;
    const segmentLength = dashLength + gapLength;
    const numSegments = Math.floor(length / segmentLength);
    
    const segments = [];
    
    for (let i = 0; i < numSegments; i++) {
      const startDistance = i * segmentLength;
      const endDistance = startDistance + dashLength;
      
      if (endDistance <= length) {
        const t1 = startDistance / length;
        const startX = frogX + t1 * dx;
        const startY = frogY + t1 * dy;
        
        const segmentWidth = Math.min(dashLength, length - startDistance);
        
        segments.push(
          <View
            key={i}
            style={[
              styles.targetingDash,
              {
                left: startX,
                top: startY,
                width: segmentWidth,
                transform: [{ rotate: `${angle}deg` }]
              }
            ]}
          />
        );
      }
    }
    
    return segments;
  };

  // Render joystick
  const renderJoystick = () => {
    return (
      <View 
        style={[styles.joystickBase, {
          left: joystickPosition.x - joystickBaseRadius,
          top: joystickPosition.y - joystickBaseRadius
        }]}
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
      >
        <View 
          style={[styles.joystickKnob, {
            transform: [
              { translateX: knobPosition.x },
              { translateY: knobPosition.y }
            ]
          }]}
        />
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
            <Text style={styles.gameTitle}>FROG POND</Text>
            <Text style={styles.levelText}>LEVEL 5</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>TIME</Text>
              <Text style={styles.statValue}>{timer}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>FLIES</Text>
              <Text style={styles.statValue}>{score / 10}</Text>
            </View>
          </View>
        </View>

        <View style={styles.gameBoard}>
          {/* Water background */}
          <View style={styles.pond} />
          
          {/* Aiming line */}
          {renderAimingLine()}
          
          {/* Flies */}
          {flies.map((fly) => (
            <View
              key={fly.id}
              style={[styles.fly, { left: fly.x, top: fly.y }]}
            >
              <Text style={styles.flyText}>🪰</Text>
            </View>
          ))}
          
          {/* Lily pads */}
          {lilyPads.map((pad, index) => (
            <TouchableOpacity
              key={pad.id}
              style={[
                styles.lilyPad,
                { left: pad.x, top: pad.y },
                index === currentPad && styles.activePad
              ]}
              onPress={() => handleLilyPadPress(index)}
              activeOpacity={0.8}
            />
          ))}
          
          {/* Frog */}
          <View
            style={[
              styles.frog,
              {
                left: frogPosition.x,
                top: frogPosition.y - jumpHeight,
                transform: [{ scaleX: frogRotation === 0 ? 1 : -1 }]
              }
            ]}
          >
            <Text style={styles.frogText}>🐸</Text>
          </View>
          
          {/* Tongue */}
          {tongue.active && tongue.length > 0 && (
            <View
              style={[
                styles.tongue,
                {
                  left: tongue.x,
                  top: tongue.y,
                  width: tongue.length,
                  transform: [{ rotate: `${tongue.angle}deg` }]
                }
              ]}
            />
          )}
          
          {/* Joystick */}
          {renderJoystick()}
          
          {/* Fire button */}
          <TouchableOpacity 
            style={styles.fireButton}
            onPress={handleFireTongue}
            disabled={tongue.active}
          >
            <Text style={styles.fireButtonText}>FIRE!</Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        {!gameComplete && timer > 27 && (
          <View style={styles.instructions}>
            <Text style={styles.instructionText}>Use joystick to aim</Text>
            <Text style={styles.instructionText}>Press FIRE to shoot tongue</Text>
            <Text style={styles.instructionText}>Tap lily pads to jump</Text>
          </View>
        )}
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
  pond: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#1E6091',
    borderRadius: 10,
    opacity: 0.6,
  },
  lilyPad: {
    position: 'absolute',
    width: LILY_PAD_SIZE,
    height: LILY_PAD_SIZE / 2,
    borderRadius: LILY_PAD_SIZE / 2,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  activePad: {
    borderWidth: 2,
    borderColor: '#FFEB3B',
  },
  frog: {
    position: 'absolute',
    width: FROG_SIZE,
    height: FROG_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  frogText: {
    fontSize: 40,
  },
  fly: {
    position: 'absolute',
    width: FLY_SIZE,
    height: FLY_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flyText: {
    fontSize: 30,
  },
  tongue: {
    position: 'absolute',
    height: 8,
    backgroundColor: '#FF0000',
    transformOrigin: 'left',
    marginTop: 70,
    borderRadius: 2,
    elevation: 5,
    zIndex: 1000,
  },
  targetingDash: {
    position: 'absolute',
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    transformOrigin: 'left',
    marginTop: 70,
  },
  joystickBase: {
    position: 'absolute',
    width: JOYSTICK_SIZE,
    height: JOYSTICK_SIZE,
    borderRadius: JOYSTICK_SIZE / 2,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 2,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  joystickKnob: {
    width: JOYSTICK_SIZE / 2,
    height: JOYSTICK_SIZE / 2,
    borderRadius: JOYSTICK_SIZE / 4,
    backgroundColor: '#FFD700',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  fireButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 80,
    height: 80,
    backgroundColor: '#E53935',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFD700',
    elevation: 5,
  },
  fireButtonText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 14,
  },
  instructions: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 10,
  },
  instructionText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 10,
    marginVertical: 5,
    textAlign: 'center',
  },
});