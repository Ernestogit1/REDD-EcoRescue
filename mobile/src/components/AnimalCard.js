import React from 'react';
import { View, Text, Image, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import animalData from '../constants/animalData';

const getConservationStars = (status) => {
  if (status.includes('Critically Endangered')) return 1;
  if (status.includes('Endangered')) return 2;
  if (status.includes('Vulnerable')) return 3;
  if (status.includes('Threatened') || status.includes('Near Threatened')) return 4;
  if (status.includes('Concern')) return 9;
  return 6;
};

export default function AnimalCard({ levelId, collectedAt, onPress, image }) {
  const animal = animalData[levelId];
  if (!animal) return (
    <View style={{ width: 120, height: 120, margin: 6, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}>
      <Text style={{ color: '#FFD700', fontSize: 10 }}>Unknown Card</Text>
    </View>
  );
  const conservationStars = getConservationStars(animal.conservationStatus);

  const getDifficultyColor = () => {
    switch(animal.difficulty) {
      case 'Easy': return ['#76C893', '#52B69A'];
      case 'Medium': return ['#FFB703', '#FB8500'];
      case 'Hard': return ['#E63946', '#D00000'];
      default: return ['#52B69A', '#1A759F'];
    }
  };

  const CardContent = (
    <View style={styles.cardContainer}>
      <LinearGradient colors={getDifficultyColor()} style={styles.cardHeader}>
        <Text style={styles.animalName}>{animal.animalName}</Text>
      </LinearGradient>
      <View style={styles.imageContainer}>
        <Image source={image || animal.image} style={styles.animalImage} />
      </View>
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>STATUS</Text>
        <View style={styles.starsContainer}>
          {[...Array(9)].map((_, i) => (
            <View
              key={`star-${i}`}
              style={[styles.star, i < conservationStars ? styles.filledStar : styles.emptyStar]}
            />
          ))}
        </View>
      </View>
      <View style={styles.dietContainer}>
        <Text style={styles.dietLabel}>DIET</Text>
        <Text style={styles.dietValue}>{animal.diet}</Text>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardFooterText}>Collected: {collectedAt ? new Date(collectedAt).toLocaleString() : ''}</Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={() => onPress(levelId)} activeOpacity={0.8}>
        {CardContent}
      </TouchableOpacity>
    );
  }
  return CardContent;
}

const styles = StyleSheet.create({
  cardContainer: {
    width: 150,
    backgroundColor: '#2A2B2A',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFD700',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    margin: 6,
    height: 200,
  },
  cardHeader: {
    padding: 6,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#FFD700',
  },
  animalName: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 9,
    textAlign: 'center',
  },
  imageContainer: {
    height: 60,
    backgroundColor: '#3E4E50',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  animalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  statusContainer: {
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    alignItems: 'center',
  },
  statusLabel: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 7,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  star: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    margin: 1,
  },
  filledStar: {
    backgroundColor: '#FFD700',
  },
  emptyStar: {
    backgroundColor: '#555',
  },
  dietContainer: {
    padding: 6,
    alignItems: 'center',
  },
  dietLabel: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 7,
  },
  dietValue: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 7,
    textAlign: 'center',
  },
  cardFooter: {
    backgroundColor: '#1A3C40',
    padding: 4,
    alignItems: 'center',
    marginTop: 'auto',
  },
  cardFooterText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 6,
    textAlign: 'center',
  },
}); 