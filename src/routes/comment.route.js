const express = require("express");
const { verifyJWT } = require("../middlewares/auth.middlewares");
const {
  addComment,
  updateComment,
  deleteComment,
  getVideoComments,
} = require("../controllers/comment.controllers");
const commentRouter = express.Router();

commentRouter.route("/addcomment/:videoId").post(verifyJWT, addComment);
commentRouter.route("/update/:commentId").patch(verifyJWT, updateComment);
commentRouter.route("/delete/:commentId").delete(verifyJWT, deleteComment);
commentRouter.route("/getvideocomments/:videoId").get(verifyJWT, getVideoComments);


module.exports = { commentRouter };
