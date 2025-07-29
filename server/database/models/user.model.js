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
    }, 
    age: {
      type: Number,
      min: 5,
      max: 99,
      required: true
    },
    grade: {
      type: Number,
      min: 1,
      max: 6,
      required: true
    },
    avatar: {
       type: String, 
       default: '',
       }, 
    rank:{
       type: String,
        
       default: 'Novice'
      },
    rescueStars:{
      type: Number,
      default: 0
    },
    points:{
      type: Number,
      default: 0
    },
    pushToken: {
       type: String,
        default: '' 
      },
    isAdmin:{
      type: Boolean,
      default:false
    }
  },
  
  { 
    timestamps: true 
  }
);

module.exports = mongoose.model("User", UserSchema);