const express = require("express")
const {verifyJWT} = require("../middlewares/auth.middlewares");
const { toggleVideoLike, toggleCommentLike } = require("../controllers/likes.controllers");
const likeRouter = express.Router()


likeRouter.route("/togglelike/:videoId").post(verifyJWT,toggleVideoLike);
likeRouter.route("/toggleCommentLike/:commentId").post(verifyJWT, toggleCommentLike);





module.exports={likeRouter}