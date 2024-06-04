const express = require("express")
const {verifyJWT} = require("../middlewares/auth.middlewares");
const { toggleVideoLike } = require("../controllers/likes.controllers");
const likeRouter = express.Router()


likeRouter.route("/togglelike/:videoId").post(verifyJWT,toggleVideoLike);




module.exports={likeRouter}