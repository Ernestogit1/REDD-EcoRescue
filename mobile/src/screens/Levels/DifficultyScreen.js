import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');

export default function DifficultyScreen() {
    const navigation = useNavigation();
    const [selectedLevel, setSelectedLevel] = useState(null);
    
    // Animation values
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const boxAnims = useRef([
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
    ]).current;

    const levels = [
        { 
            id: 1, 
            name: 'EASY', 
            grade: 'Grade 1-2',
            color: '#4ade80',
            image: require('../../../assets/images/levels/easy.png')
        },
        { 
            id: 2, 
            name: 'MEDIUM', 
            grade: 'Grade 3-4',
            color: '#fbbf24',
            image: require('../../../assets/images/levels/medium.png')
        },
        { 
            id: 3, 
            name: 'HARD', 
            grade: 'Grade 5-6',
            color: '#f87171',
            image: require('../../../assets/images/levels/hard.png')
        },
    ];

    useEffect(() => {
        // Title and content animations
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
        ]).start();

        // Staggered box animations
        const boxAnimations = boxAnims.map((anim, index) =>
            Animated.timing(anim, {
                toValue: 1,
                duration: 500,
                delay: index * 200,
                useNativeDriver: true,
            })
        );

        Animated.stagger(200, boxAnimations).start();
    }, []);

    const handleLevelPress = (level) => {
        setSelectedLevel(level.id);
        // Add a small delay for the selection animation
        setTimeout(() => {
            navigation.navigate('LevelMap', { level });
        }, 300);
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

    return (
        <LinearGradient colors={["#1a4d2e", "#2d5a3d", "#1a4d2e"]} style={styles.container}>
            <View style={styles.mainContent}>
                {/* Title */}
                <Animated.View style={[
                    styles.header,
                    {
                        transform: [{ scale: scaleAnim }],
                        opacity: fadeAnim,
                    }
                ]}>
                    <Text style={styles.title}>SELECT DIFFICULTY</Text>
                </Animated.View>

                {/* Difficulty Boxes Row */}
                <View style={styles.boxesRow}>
                    {levels.map((level, index) => (
                        <Animated.View
                            key={level.id}
                            style={[
                                styles.boxWrapper,
                                {
                                    opacity: boxAnims[index],
                                    transform: [
                                        {
                                            translateY: boxAnims[index].interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [50, 0],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        >
                            <TouchableOpacity
                                style={[
                                    styles.difficultyBox,
                                    selectedLevel === level.id && styles.selectedBox,
                                    { borderColor: level.color }
                                ]}
                                onPress={() => handleLevelPress(level)}
                                activeOpacity={0.8}
                            >
                                <Image 
                                    source={level.image}
                                    style={styles.thumbnail}
                                    resizeMode="contain"
                                />
                                <View style={styles.boxContent}>
                                    <Text style={[styles.levelName, { color: level.color }]}>
                                        {level.name}
                                    </Text>
                                    <Text style={styles.gradeText}>
                                        {level.grade}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mainContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontFamily: 'PressStart2P_400Regular',
        color: '#FFD700',
        fontSize: 16,
        textShadowColor: '#B8860B',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 0,
    },
    boxesRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '90%',
        paddingHorizontal: 10,
        gap: 20,
    },
    boxWrapper: {
        flex: 1,
        maxWidth: screenWidth / 3 - 20,
        aspectRatio: 0.8,
    },
    difficultyBox: {
        backgroundColor: '#8B4513',
        borderWidth: 3,
        borderRadius: 8,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.6,
        shadowRadius: 4,
        elevation: 6,
        height: '100%',
    },
    selectedBox: {
        transform: [{ scale: 1.05 }],
        shadowColor: '#FFD700',
        shadowOpacity: 0.8,
    },
    thumbnail: {
        width: '100%',
        height: '80%',  
        borderBottomWidth: 2,
        borderBottomColor: '#3d2914',
    },
    boxContent: {
        flex: 1,
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    levelName: {
        fontFamily: 'PressStart2P_400Regular',
        fontSize: 10,
        marginBottom: 4,
        textAlign: 'center',
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 0,
    },
    gradeText: {
        fontFamily: 'PressStart2P_400Regular',
        color: '#fbbf24',
        fontSize: 8,
        textAlign: 'center',
    },
    backButton: {
        position: 'absolute',
        bottom: 20,
        backgroundColor: '#8B4513',
        borderWidth: 2,
        borderColor: '#3d2914',
        borderTopColor: '#CD853F',
        borderLeftColor: '#CD853F',
        borderRadius: 4,
        padding: 12,
        alignItems: 'center',
    },
    backButtonText: {
        fontFamily: 'PressStart2P_400Regular',
        color: '#FFD700',
        fontSize: 10,
    },
});