const mongoose = require("mongoose");

const likesSchema = new mongoose.Schema(
  {
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },

    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
    likedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    tweet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TweetModel",
    },
  },
  { timestamps: true },
);


const Likes = mongoose.model("Likes", likesSchema);
module.exports = { Likes };