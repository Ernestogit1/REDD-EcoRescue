import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

export default function CustomPopup({ visible, title, message, buttons = [], onClose }) {
  const popupAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
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
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
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
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient colors={["#52B69A", "#1A759F"]} style={styles.popupHeader}>
            <Text style={styles.popupTitle}>{title}</Text>
          </LinearGradient>
          <View style={styles.popupBody}>
            <Text style={styles.popupMessage}>{message}</Text>
            <View style={styles.popupButtonContainer}>
              {buttons.map((button, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.popupButton,
                    button.primary ? styles.primaryButton : styles.secondaryButton,
                  ]}
                  onPress={() => {
                    if (button.onPress) button.onPress();
                    if (onClose) onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={button.primary ? ["#52B69A", "#1A759F"] : ["#4A5859", "#2C3333"]}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.popupButtonText}>{button.text}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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