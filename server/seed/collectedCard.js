// Add this at the top to load environment variables
require('dotenv').config();

const mongoose = require('mongoose');
// Fix the paths to point to the correct model locations
const CollectedCard = require('../database/models/collectedCard.model');
const User = require('../database/models/user.model');

const collectedCardsData = [
  {
    levelId: "level_1",
    name: "Forest Guardian",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
    description: "A mystical guardian protecting the ancient forest with nature's power."
  },
  {
    levelId: "level_2", 
    name: "Ocean Warrior",
    image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&h=300&fit=crop",
    description: "A brave warrior who commands the power of the seven seas."
  },
  {
    levelId: "level_3",
    name: "Mountain Sage",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    description: "An ancient sage who draws wisdom from the towering mountains."
  },
  {
    levelId: "level_4",
    name: "Fire Phoenix",
    image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop",
    description: "A legendary phoenix that rises from ashes with eternal flame."
  },
  {
    levelId: "level_5",
    name: "Crystal Mage",
    image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=300&fit=crop",
    description: "A powerful mage who harnesses the energy of mystical crystals."
  },
  {
    levelId: "level_6",
    name: "Shadow Ninja",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    description: "A stealthy ninja master of the shadows and ancient martial arts."
  },
  {
    levelId: "level_7",
    name: "Lightning Dragon",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    description: "A majestic dragon that controls thunder and lightning storms."
  },
  {
    levelId: "level_8",
    name: "Ice Queen",
    image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop",
    description: "The ruler of the frozen realm with power over ice and snow."
  },
  {
    levelId: "level_9",
    name: "Earth Titan",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
    description: "A colossal titan with the strength of mountains and earth."
  },
  {
    levelId: "level_10",
    name: "Wind Spirit",
    image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&h=300&fit=crop",
    description: "A graceful spirit that dances with the winds of freedom."
  },
  {
    levelId: "level_11",
    name: "Cosmic Wizard",
    image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=300&fit=crop",
    description: "A wizard who commands the power of stars and cosmic energy."
  },
  {
    levelId: "level_12",
    name: "Golden Knight",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    description: "A noble knight in shining golden armor, defender of justice."
  },
  {
    levelId: "level_13",
    name: "Dream Weaver",
    image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop",
    description: "A mystical being who weaves dreams and controls sleep realms."
  },
  {
    levelId: "level_14",
    name: "Time Keeper",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
    description: "The guardian of time itself, controlling past and future."
  },
  {
    levelId: "level_15",
    name: "Soul Reaper",
    image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&h=300&fit=crop",
    description: "A mysterious figure who guides souls between worlds."
  },
  {
    levelId: "level_16",
    name: "Light Bringer",
    image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=300&fit=crop",
    description: "A divine being that brings light to the darkest places."
  },
  {
    levelId: "level_17",
    name: "Void Walker",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    description: "A traveler between dimensions with power over the void."
  },
  {
    levelId: "level_18",
    name: "Nature's Heart",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
    description: "The embodiment of nature's life force and healing power."
  },
  {
    levelId: "level_19",
    name: "Storm Caller",
    image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&h=300&fit=crop",
    description: "A powerful shaman who summons storms and weather."
  },
  {
    levelId: "level_20",
    name: "Eternal Guardian",
    image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop",
    description: "The ultimate protector with immortal power and wisdom."
  }
];

const seedCollectedCards = async () => {
  try {
    // Connect to MongoDB using the MONGO_URI from your .env file
    if (mongoose.connection.readyState === 0) {
      // Use MONGO_URI which matches your .env file
      const connectionString = process.env.MONGO_URI || 
                              process.env.MONGODB_URI || 
                              'mongodb://localhost:27017/redd_game_db';
      
      console.log('Attempting to connect to MongoDB...');
      console.log('Using connection string from MONGO_URI environment variable');
      
      await mongoose.connect(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ Connected to MongoDB Atlas successfully');
    }

    const userId = "687d01382eeda7730d8eba46";

    // Check if user exists
    console.log(`Looking for user with ID: ${userId}`);
    const userExists = await User.findById(userId);
    if (!userExists) {
      console.error(`❌ User with ID ${userId} not found!`);
      console.log('Available users:');
      const users = await User.find({}, '_id username email').limit(5);
      users.forEach(user => {
        console.log(`- ${user._id} | ${user.username} | ${user.email}`);
      });
      return;
    }

    console.log(`✅ Found user: ${userExists.username} (${userExists.email})`);

    // Clear existing collected cards for this user (optional)
    const deletedCount = await CollectedCard.deleteMany({ userId: userId });
    console.log(`🗑️  Cleared ${deletedCount.deletedCount} existing collected cards for user ${userId}`);

    // Create collected cards with the userId
    const collectedCards = collectedCardsData.map(card => ({
      ...card,
      userId: userId,
      collectedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
    }));

    // Insert collected cards
    console.log('Inserting collected cards...');
    const insertedCards = await CollectedCard.insertMany(collectedCards);
    
    console.log(`✅ Successfully seeded ${insertedCards.length} collected cards for user ${userId}`);
    console.log('\n📋 Seeded cards:');
    insertedCards.forEach((card, index) => {
      console.log(`${String(index + 1).padStart(2, '0')}. ${card.name.padEnd(20, ' ')} - Level: ${card.levelId}`);
    });

    return insertedCards;

  } catch (error) {
    console.error('❌ Error seeding collected cards:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Possible solutions:');
      console.log('1. Make sure MongoDB is running locally');
      console.log('2. Check your MongoDB connection string in .env file');
      console.log('3. If using MongoDB Atlas, ensure your IP is whitelisted');
      console.log('4. Verify your database credentials');
    }
    
    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Authentication error:');
      console.log('1. Check your MongoDB username and password');
      console.log('2. Verify your database user has proper permissions');
    }
    
    throw error;
  } finally {
    // Close the connection after seeding
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('🔌 Database connection closed');
    }
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedCollectedCards()
    .then(() => {
      console.log('🎉 Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error.message);
      process.exit(1);
    });
}

module.exports = { seedCollectedCards, collectedCardsData };