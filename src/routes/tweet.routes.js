const express = require('express');
const { createTweet, getUserTweets } = require('../controllers/tweet.controller');
const { verifyJWT } = require("../middlewares/auth.middlewares");
const tweetRouter = express.Router();


tweetRouter.route("/create").post(verifyJWT, createTweet);
tweetRouter.route("/getUserTweets").get(verifyJWT, getUserTweets);



module.exports={
    tweetRouter
}