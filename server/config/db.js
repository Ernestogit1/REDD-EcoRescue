const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('NAKA CONNECT NA ANG MongoDB!!!');
  } catch (error) {
    console.error(`Error connecting MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;