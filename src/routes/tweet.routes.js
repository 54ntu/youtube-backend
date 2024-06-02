const express = require('express');
const { createTweet } = require('../controllers/tweet.controller');
const { verifyJWT } = require("../middlewares/auth.middlewares");
const tweetRouter = express.Router();


tweetRouter.route("/create").post(verifyJWT, createTweet);


module.exports={
    tweetRouter
}