const express = require("express");
const { verifyJWT } = require("../middlewares/auth.middlewares");
const {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike,
  getLikedVideos,
} = require("../controllers/likes.controllers");
const likeRouter = express.Router();

likeRouter.route("/togglelike/:videoId").post(verifyJWT, toggleVideoLike);
likeRouter
  .route("/toggleCommentLike/:commentId")
  .post(verifyJWT, toggleCommentLike);
likeRouter
  .route("/toggletweetLike/:tweetId")
  .post(verifyJWT, toggleTweetLike);
  likeRouter
    .route("/getLikedVideos")
    .get(verifyJWT, getLikedVideos);



module.exports = { likeRouter };
