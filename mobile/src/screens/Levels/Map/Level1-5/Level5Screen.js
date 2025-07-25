import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, Image, Animated, Modal } from 'react-native';
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
  // Add popup state variables
  const [showPopup, setShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupButtons, setPopupButtons] = useState([]);
  const [pendingAction, setPendingAction] = useState(null); // 'restart' | 'exit' | null
  const popupAnim = useRef(new Animated.Value(0)).current;
  
  const timerRef = useRef(null);
  const gameInterval = useRef(null);
  const jumpTimerRef = useRef(null);
  const tongueTimerRef = useRef(null);
  
  // Joystick state
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPosition, setJoystickPosition] = useState({ x: 120, y: screenHeight - 200 });
  const [joystickValue, setJoystickValue] = useState({ x: 0, y: -1 });
  const [knobPosition, setKnobPosition] = useState({ x: 0, y: 0 });
  const joystickBaseRadius = JOYSTICK_SIZE / 2;
  const joystickKnobRadius = JOYSTICK_SIZE / 4;

  // Collectible card modal state
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardAnim] = useState(new Animated.Value(0));

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
  }, [showPopup, pendingAction]);

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

  // Memoized handlers for popup buttons
  const handlePlayAgain = useCallback(() => {
    setShowPopup(false);
    setPendingAction('restart');
  }, []);
  
  const handleExit = useCallback(() => {
    setShowPopup(false);
    setPendingAction('exit');
  }, []);

  const handleContinue = useCallback(() => {
    setShowPopup(false);
    setPendingAction('exit');
  }, []);

  // Memoize button handlers to prevent recreation on each render
  const handlePopupButtonPress = useCallback((onPress) => {
    return onPress;
  }, []);

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
      
      // Show success popup
      setPopupTitle('LEVEL COMPLETE!');
      setPopupMessage(`GREAT JOB! YOU CAUGHT ${score / 10} FLIES!`);
      setPopupButtons([
        { text: 'CONTINUE', onPress: handleContinue }
      ]);
      setShowPopup(true);

      setTimeout(async () => {
        try {
          await ApiService.markLevelComplete(5);
          await ApiService.awardCollectibleCard({ level: 5 });
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
    } else {
      // Show failure popup
      setPopupTitle('TIME\'S UP!');
      setPopupMessage(`YOU CAUGHT ${score / 10} FLIES. TRY AGAIN TO REACH 10!`);
      setPopupButtons([
        { text: 'RETRY', onPress: handlePlayAgain },
        { text: 'EXIT', onPress: handleExit }
      ]);
      setShowPopup(true);
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

  // Render popup component
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
                source={require('../../../../../assets/images/pets/Owl.png')}
                style={{ width: 120, height: 120, marginBottom: 16 }}
                resizeMode="contain"
              />
              <Text style={styles.modalMessage}>Owl Card\nCongratulations! You collected a new card for Level 5.</Text>
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
      
      {renderPopup()}
      {renderCardModal()}
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
    bottom: 70,
    right: 120,
    width: 90,
    height: 90,
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