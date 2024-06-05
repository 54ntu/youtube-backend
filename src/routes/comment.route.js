const express = require("express")
const { verifyJWT } = require("../middlewares/auth.middlewares")
const { addComment, updateComment } = require("../controllers/comment.controllers")
const commentRouter = express.Router()


commentRouter.route("/addcomment/:videoId").post(verifyJWT, addComment)
commentRouter.route("/update/:commentId").patch(verifyJWT, updateComment);





module.exports={commentRouter}