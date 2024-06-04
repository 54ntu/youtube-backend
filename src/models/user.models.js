const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
 
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String, //we will store url fetch from cloudinary
      required: true,
    },

    coverImage: {
      type: String, //url from cloudinary
    },

    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],

    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// userSchema.methods.generateAccessToken = function () {
//   return jwt.sign(
//     {
//       _id: this._id,
//       email: this.email,
//     },

//     process.env.ACCESS_TOKEN_SECRET,
//     {
//       expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
//     },
//   );
// };

// userSchema.methods.generateRefreshToken = function () {
//   return jwt.sign(
//     {
//       _id: this._id,
//     },

//     process.env.REFRESH_TOKEN_SECRET,
//     {
//       expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
//     },
//   );
// };

const User = mongoose.model("User", userSchema);
module.exports = { User };
