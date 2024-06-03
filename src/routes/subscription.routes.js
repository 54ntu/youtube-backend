const express = require("express");
const {
  toggleSubscription,
  getUserChannelSubscribers,
} = require("../controllers/subscription.controllers");
const { verifyJWT } = require("../middlewares/auth.middlewares");
const subscriptionRouter = express.Router();

subscriptionRouter
  .route("/toggleSubscription/:channelId")
  .post(verifyJWT, toggleSubscription);
subscriptionRouter
  .route("/getUserChannelSubscriber/:channelId")
  .get(verifyJWT, getUserChannelSubscribers);

module.exports = { subscriptionRouter };
