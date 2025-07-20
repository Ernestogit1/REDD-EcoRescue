const animalData = {
  1: {
    animalName: "Rabbit",
    habitat: "Woodlands, Meadows, and Forests",
    diet: "Herbivore",
    conservationStatus: "Least Concern",
    funFacts: [
      "Rabbits can jump up to 3 feet high and 9 feet long",
      "A rabbit's teeth never stop growing",
      "Rabbits can see almost 360 degrees around them"
    ],
    howToHelp: [
      "Plant native plants in your garden",
      "Don't use pesticides that can harm rabbits",
      "Support wildlife corridors in your community"
    ],
    image: require('../../assets/images/pets/Rabbit.png'),  
    difficulty: "Easy"
  },
  2: {
    animalName: "Squirrel",
    habitat: "Forests and Urban Parks",
    diet: "Omnivore",
    conservationStatus: "Least Concern",
    funFacts: [
      "Squirrels can find food buried beneath a foot of snow",
      "They plant thousands of trees by forgetting where they buried nuts",
      "Squirrels can rotate their ankles 180 degrees"
    ],
    howToHelp: [
      "Plant native trees that provide nuts and seeds",
      "Create wildlife-friendly spaces in your yard",
      "Avoid trimming trees during nesting season"
    ],
    image: require('../../assets/images/pets/Squirrel.png'),
    difficulty: "Easy"
  },
  3: {
    animalName: "Duck",
    habitat: "Wetlands, Lakes, and Ponds",
    diet: "Omnivore",
    conservationStatus: "Least Concern",
    funFacts: [
      "Ducks have waterproof feathers",
      "They can sleep with one eye open",
      "Baby ducks can swim as soon as they hatch"
    ],
    howToHelp: [
      "Never feed bread to ducks - it's bad for them",
      "Keep local water sources clean",
      "Support wetland conservation efforts"
    ],
    image: require('../../assets/images/pets/Duck.png'),
    difficulty: "Easy"
  },
  4: {
    animalName: "Butterfly",
    habitat: "Gardens, Meadows, and Forests",
    diet: "Nectar from flowers",
    conservationStatus: "Varies by species",
    funFacts: [
      "Butterflies taste with their feet",
      "They go through complete metamorphosis",
      "Some butterflies migrate thousands of miles"
    ],
    howToHelp: [
      "Plant native flowers in your garden",
      "Avoid using pesticides",
      "Create butterfly watering stations"
    ],
    image: require('../../assets/images/pets/Butterfly.png'),
    difficulty: "Easy"
  },
  5: {
    animalName: "Frog",
    habitat: "Ponds, Wetlands, and Damp Areas",
    diet: "Carnivore (Insects)",
    conservationStatus: "Many species are Threatened",
    funFacts: [
      "Frogs absorb water through their skin",
      "They can jump up to 20 times their body length",
      "Some frogs can change color"
    ],
    howToHelp: [
      "Create a small pond in your garden",
      "Reduce chemical use in your yard",
      "Support wetland conservation"
    ],
    image: require('../../assets/images/pets/Frog.png'),
    difficulty: "Easy"
  },
  6: {
    animalName: "Red Fox",
    habitat: "Forests, Grasslands, and Urban Areas",
    diet: "Omnivore",
    conservationStatus: "Least Concern",
    funFacts: [
      "Foxes have whiskers on their legs to help navigate",
      "They can hear rodents digging underground",
      "Red foxes are found on every continent except Antarctica"
    ],
    howToHelp: [
      "Drive carefully in areas where foxes live",
      "Keep pets indoors at night in fox areas",
      "Support wildlife-friendly urban planning"
    ],
    image: require('../../assets/images/pets/Red Fox.png'),
    difficulty: "Medium"
  },
  7: {
    animalName: "Raccoon",
    habitat: "Forests and Urban Areas",
    diet: "Omnivore",
    conservationStatus: "Least Concern",
    funFacts: [
      "Raccoons can remember solutions to tasks for up to three years",
      "They wash their food before eating it",
      "Their hands have sensitive touch receptors"
    ],
    howToHelp: [
      "Secure trash cans to prevent conflicts",
      "Never feed wild raccoons",
      "Support urban wildlife management programs"
    ],
    image: require('../../assets/images/pets/Raccoon.png'),
    difficulty: "Medium"
  },
  8: {
    animalName: "Owl",
    habitat: "Forests, Deserts, and Grasslands",
    diet: "Carnivore",
    conservationStatus: "Varies by species",
    funFacts: [
      "Owls can rotate their heads up to 270 degrees",
      "They have special feathers for silent flight",
      "Some owl species can hear prey under snow"
    ],
    howToHelp: [
      "Preserve old trees that provide nesting sites",
      "Avoid using rodenticides that harm owls",
      "Install owl nesting boxes"
    ],
    image: require('../../assets/images/pets/Owl.png'),
    difficulty: "Medium"
  },
  9: {
    animalName: "Beaver",
    habitat: "Rivers, Lakes, and Wetlands",
    diet: "Herbivore",
    conservationStatus: "Least Concern",
    funFacts: [
      "Beavers can hold their breath underwater for 15 minutes",
      "Their teeth never stop growing",
      "Beaver dams create habitats for many other species"
    ],
    howToHelp: [
      "Support stream and river conservation",
      "Learn about beaver management solutions",
      "Educate others about beavers' ecological importance"
    ],
    image: require('../../assets/images/pets/Beaver.png'),
    difficulty: "Medium"
  },
  10: {
    animalName: "Turtle",
    habitat: "Lakes, Rivers, and Wetlands",
    diet: "Omnivore",
    conservationStatus: "Many species are Threatened",
    funFacts: [
      "Some turtles can live over 100 years",
      "Turtles have existed for over 200 million years",
      "They can feel through their shell"
    ],
    howToHelp: [
      "Never release pet turtles into the wild",
      "Help turtles cross roads safely",
      "Reduce plastic pollution that harms aquatic turtles"
    ],
    image: require('../../assets/images/pets/Turtle.png'),
    difficulty: "Medium"
  },
  11: {
    animalName: "Snow Leopard",
    habitat: "Mountain Ranges of Central Asia",
    diet: "Carnivore",
    conservationStatus: "Vulnerable",
    funFacts: [
      "Snow leopards can jump six times their body length",
      "Their thick tails help with balance and warmth",
      "They're sometimes called 'ghosts of the mountains'"
    ],
    howToHelp: [
      "Support conservation organizations",
      "Learn about climate change impacts on mountain habitats",
      "Spread awareness about endangered species"
    ],
    image: require('../../assets/images/pets/Snow Leopard.png'),
    difficulty: "Hard"
  },
  12: {
    animalName: "Orangutan",
    habitat: "Rainforests of Borneo and Sumatra",
    diet: "Herbivore (Primarily Fruit)",
    conservationStatus: "Critically Endangered",
    funFacts: [
      "Orangutans share 97% of their DNA with humans",
      "They make new sleeping nests every night",
      "Baby orangutans stay with their mothers for up to 8 years"
    ],
    howToHelp: [
      "Avoid products with unsustainable palm oil",
      "Support rainforest conservation efforts",
      "Recycle paper products to reduce deforestation"
    ],
    image: require('../../assets/images/pets/Orangutan.png'),
    difficulty: "Hard"
  },
  13: {
    animalName: "Sea Turtle",
    habitat: "Oceans Worldwide",
    diet: "Varies by species",
    conservationStatus: "Endangered",
    funFacts: [
      "Sea turtles return to the same beach where they were born to lay eggs",
      "They can hold their breath for hours underwater",
      "Some species can live up to 100 years"
    ],
    howToHelp: [
      "Reduce plastic use to keep oceans clean",
      "Turn off lights near nesting beaches",
      "Support beach clean-up efforts"
    ],
    image: require('../../assets/images/pets/Sea Turtle.png'),
    difficulty: "Hard"
  },
  14: {
    animalName: "Bald Eagle",
    habitat: "Near large bodies of water with old-growth trees",
    diet: "Carnivore",
    conservationStatus: "Least Concern (Recovered)",
    funFacts: [
      "Bald eagles can spot prey from 2 miles away",
      "Their nests can weigh up to 2,000 pounds",
      "They were once endangered but have recovered"
    ],
    howToHelp: [
      "Keep waterways clean from pollution",
      "Support habitat protection for nesting sites",
      "Learn about conservation success stories"
    ],
    image: require('../../assets/images/pets/Bald Eagle.png'),
    difficulty: "Hard"
  },
  15: {
    animalName: "Poison Dart",
    habitat: "Rainforests of Central and South America",
    diet: "Carnivore",
    conservationStatus: "Varies by species",
    funFacts: [
      "Their bright colors warn predators they're toxic",
      "They get their toxins from their diet in the wild",
      "Some species care for their tadpoles individually"
    ],
    howToHelp: [
      "Support rainforest conservation",
      "Learn about amphibian decline worldwide",
      "Reduce use of chemicals that harm amphibians"
    ],
    image: require('../../assets/images/pets/Poison Dart Frog.png'),
    difficulty: "Hard"
  }
};

export default animalData; 