const admin = require("../../../config/firebase-admin"); 
const User = require("../../../database/models/user.model"); 

const createAdminUser = async () => {
  try {
    const existingAdmin = await User.findOne({ isAdmin: true });

    if (existingAdmin) {
      console.log("Meron nang admin!!!");
      return;
    }

    console.log("Walang ADMIN account. Gumagawa na ng admin account");

    //  Check existing Firebase  admin email
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail("admin@gmail.com");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        console.log("🔹 YUNG ADMIN WALA SA FIREBASE!!! Kaya gagawa tayo ng bagong user sa firebase...");
        userRecord = await admin.auth().createUser({
          email: "admin@gmail.com",
          password: "admin123",   // store in the firebase
          displayName: "Admin",
        });
      } else {
        console.error("yung firebase ay nag kaka error!!:", error);
        return;
      }
    }

    // if no admin exist in MongoDB, create one
    const newAdmin = new User({
      username: "Admin",//==============================||
      email: "admin@gmail.com",//                   ||
      firebaseUid: userRecord.uid,//                || 
      password: "firebase-manage", //               ||      
      rank:'admin', //                     ||======> storein MongoDB   
      rescueStars: "69", //                   ||   
      avatar: "default-avatar.png", //              ||   
      pushToken: "", //                            ||
     //===============================||
    });

    await newAdmin.save();
    console.log("NAKAGAWA NA NG ADMIN ACCOUNT AT NASA MONGODB NA!!!!");
  } catch (error) {
    console.error("MAY ERROR SA PAG SETUP NG ADMIN ACCOUNT:", error);
  }
};

module.exports = createAdminUser;