const express = require("express");
const {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
} = require("../controllers/tweet.controller");
const { verifyJWT } = require("../middlewares/auth.middlewares");
const tweetRouter = express.Router();

tweetRouter.route("/create").post(verifyJWT, createTweet);
tweetRouter.route("/getUserTweets").get(verifyJWT, getUserTweets);
tweetRouter.route("/update/:tweetId").patch(verifyJWT, updateTweet);
tweetRouter.route("/delete/:tweetId").delete(verifyJWT, deleteTweet);

module.exports = {
  tweetRouter,
};
