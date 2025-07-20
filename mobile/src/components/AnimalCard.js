import React from 'react';
import { View, Text, Image, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Copy animalData and getConservationStars from LevelDetailsScreen
const animalData = {
  1: { animalName: "Rabbit", habitat: "Woodlands, Meadows, and Forests", diet: "Herbivore", conservationStatus: "Least Concern", funFacts: ["Rabbits can jump up to 3 feet high and 9 feet long", "A rabbit's teeth never stop growing", "Rabbits can see almost 360 degrees around them"], howToHelp: ["Plant native plants in your garden", "Don't use pesticides that can harm rabbits", "Support wildlife corridors in your community"], image: require('../../assets/images/levels/easy.png'), difficulty: "Easy" },
  2: { animalName: "Squirrel", habitat: "Forests and Urban Parks", diet: "Omnivore", conservationStatus: "Least Concern", funFacts: ["Squirrels can find food buried beneath a foot of snow", "They plant thousands of trees by forgetting where they buried nuts", "Squirrels can rotate their ankles 180 degrees"], howToHelp: ["Plant native trees that provide nuts and seeds", "Create wildlife-friendly spaces in your yard", "Avoid trimming trees during nesting season"], image: require('../../assets/images/levels/easy.png'), difficulty: "Easy" },
  3: { animalName: "Duck", habitat: "Wetlands, Lakes, and Ponds", diet: "Omnivore", conservationStatus: "Least Concern", funFacts: ["Ducks have waterproof feathers", "They can sleep with one eye open", "Baby ducks can swim as soon as they hatch"], howToHelp: ["Never feed bread to ducks - it's bad for them", "Keep local water sources clean", "Support wetland conservation efforts"], image: require('../../assets/images/levels/easy.png'), difficulty: "Easy" },
  4: { animalName: "Butterfly", habitat: "Gardens, Meadows, and Forests", diet: "Nectar from flowers", conservationStatus: "Varies by species", funFacts: ["Butterflies taste with their feet", "They go through complete metamorphosis", "Some butterflies migrate thousands of miles"], howToHelp: ["Plant native flowers in your garden", "Avoid using pesticides", "Create butterfly watering stations"], image: require('../../assets/images/levels/easy.png'), difficulty: "Easy" },
  5: { animalName: "Frog", habitat: "Ponds, Wetlands, and Damp Areas", diet: "Carnivore (Insects)", conservationStatus: "Many species are Threatened", funFacts: ["Frogs absorb water through their skin", "They can jump up to 20 times their body length", "Some frogs can change color"], howToHelp: ["Create a small pond in your garden", "Reduce chemical use in your yard", "Support wetland conservation"], image: require('../../assets/images/levels/easy.png'), difficulty: "Easy" },
  6: { animalName: "Red Fox", habitat: "Forests, Grasslands, and Urban Areas", diet: "Omnivore", conservationStatus: "Least Concern", funFacts: ["Foxes have whiskers on their legs to help navigate", "They can hear rodents digging underground", "Red foxes are found on every continent except Antarctica"], howToHelp: ["Drive carefully in areas where foxes live", "Keep pets indoors at night in fox areas", "Support wildlife-friendly urban planning"], image: require('../../assets/images/levels/easy.png'), difficulty: "Medium" },
  7: { animalName: "Raccoon", habitat: "Forests and Urban Areas", diet: "Omnivore", conservationStatus: "Least Concern", funFacts: ["Raccoons can remember solutions to tasks for up to three years", "They wash their food before eating it", "Their hands have sensitive touch receptors"], howToHelp: ["Secure trash cans to prevent conflicts", "Never feed wild raccoons", "Support urban wildlife management programs"], image: require('../../assets/images/levels/easy.png'), difficulty: "Medium" },
  8: { animalName: "Owl", habitat: "Forests, Deserts, and Grasslands", diet: "Carnivore", conservationStatus: "Varies by species", funFacts: ["Owls can rotate their heads up to 270 degrees", "They have special feathers for silent flight", "Some owl species can hear prey under snow"], howToHelp: ["Preserve old trees that provide nesting sites", "Avoid using rodenticides that harm owls", "Install owl nesting boxes"], image: require('../../assets/images/levels/easy.png'), difficulty: "Medium" },
  9: { animalName: "Beaver", habitat: "Rivers, Lakes, and Wetlands", diet: "Herbivore", conservationStatus: "Least Concern", funFacts: ["Beavers can hold their breath underwater for 15 minutes", "Their teeth never stop growing", "Beaver dams create habitats for many other species"], howToHelp: ["Support stream and river conservation", "Learn about beaver management solutions", "Educate others about beavers' ecological importance"], image: require('../../assets/images/levels/easy.png'), difficulty: "Medium" },
  10: { animalName: "Turtle", habitat: "Lakes, Rivers, and Wetlands", diet: "Omnivore", conservationStatus: "Many species are Threatened", funFacts: ["Some turtles can live over 100 years", "Turtles have existed for over 200 million years", "They can feel through their shell"], howToHelp: ["Never release pet turtles into the wild", "Help turtles cross roads safely", "Reduce plastic pollution that harms aquatic turtles"], image: require('../../assets/images/levels/easy.png'), difficulty: "Medium" },
  11: { animalName: "Snow Leopard", habitat: "Mountain Ranges of Central Asia", diet: "Carnivore", conservationStatus: "Vulnerable", funFacts: ["Snow leopards can jump six times their body length", "Their thick tails help with balance and warmth", "They're sometimes called 'ghosts of the mountains'"], howToHelp: ["Support conservation organizations", "Learn about climate change impacts on mountain habitats", "Spread awareness about endangered species"], image: require('../../assets/images/levels/easy.png'), difficulty: "Hard" },
  12: { animalName: "Orangutan", habitat: "Rainforests of Borneo and Sumatra", diet: "Herbivore (Primarily Fruit)", conservationStatus: "Critically Endangered", funFacts: ["Orangutans share 97% of their DNA with humans", "They make new sleeping nests every night", "Baby orangutans stay with their mothers for up to 8 years"], howToHelp: ["Avoid products with unsustainable palm oil", "Support rainforest conservation efforts", "Recycle paper products to reduce deforestation"], image: require('../../assets/images/levels/easy.png'), difficulty: "Hard" },
  13: { animalName: "Sea Turtle", habitat: "Oceans Worldwide", diet: "Varies by species", conservationStatus: "Endangered", funFacts: ["Sea turtles return to the same beach where they were born to lay eggs", "They can hold their breath for hours underwater", "Some species can live up to 100 years"], howToHelp: ["Reduce plastic use to keep oceans clean", "Turn off lights near nesting beaches", "Support beach clean-up efforts"], image: require('../../assets/images/levels/easy.png'), difficulty: "Hard" },
  14: { animalName: "Bald Eagle", habitat: "Near large bodies of water with old-growth trees", diet: "Carnivore", conservationStatus: "Least Concern (Recovered)", funFacts: ["Bald eagles can spot prey from 2 miles away", "Their nests can weigh up to 2,000 pounds", "They were once endangered but have recovered"], howToHelp: ["Keep waterways clean from pollution", "Support habitat protection for nesting sites", "Learn about conservation success stories"], image: require('../../assets/images/levels/easy.png'), difficulty: "Hard" },
  15: { animalName: "Poison Dart Frog", habitat: "Rainforests of Central and South America", diet: "Carnivore (Small insects)", conservationStatus: "Varies by species", funFacts: ["Their bright colors warn predators they're toxic", "They get their toxins from their diet in the wild", "Some species care for their tadpoles individually"], howToHelp: ["Support rainforest conservation", "Learn about amphibian decline worldwide", "Reduce use of chemicals that harm amphibians"], image: require('../../assets/images/levels/easy.png'), difficulty: "Hard" },
};

const getConservationStars = (status) => {
  if (status.includes('Critically Endangered')) return 1;
  if (status.includes('Endangered')) return 2;
  if (status.includes('Vulnerable')) return 3;
  if (status.includes('Threatened') || status.includes('Near Threatened')) return 4;
  if (status.includes('Concern')) return 9;
  return 6;
};

export default function AnimalCard({ levelId, collectedAt, onPress }) {
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
        <Image source={animal.image} style={styles.animalImage} />
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
    width: 120,
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