const app = require("./app");
const connectDB = require("../config/db");
const createAdmin = require("../admin/src/utils/adminSetup");
const dotenv = require("dotenv");


dotenv.config();
connectDB().then(() => {
  createAdmin(); 
});


const PORT = process.env.PORT || 5174;

app.listen(PORT, () => {
  console.log(`Ang server ay tumatakbo sa port ${PORT}!!!!`);

});