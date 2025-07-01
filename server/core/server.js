const app = require("./app");
const connectDB = require("../config/db");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from server root folder (not mobile)
dotenv.config({ path: path.join(__dirname, '../.env') });
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Ang server ay tumatakbo sa port ${PORT}!`); // Fixed template literal
});