const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username:  { 
      type: String, 
      required: true 
    },
    email:  { 
      type: String, 
      required: true, 
      unique: true 
    },
    firebaseUid: { 
      type: String, 
      required: true, 
      unique: true 
    },
    password: { 
      type: String, 
      required: true, 
      default: "firebase-manage" 
    }, 
    avatar: {
       type: String, 
       default: '',
       required: true
       }, 
    rank:{
       type: string, 
       default: 'Novice'
      },
    rescueStars:{
      type: Number,
      default: 0
    },
    pushToken: {
       type: String,
        default: '' 
      },
  },
  { 
    timestamps: true 
  }
);

module.exports = mongoose.model("User", UserSchema);