const express = require("express")
const {verifyJWT} = require("../middlewares/auth.middlewares")
const { createPlaylist } = require("../controllers/playlist.controller")
const playlistRouter = express.Router()

playlistRouter.route("/createPlaylist").post(verifyJWT,createPlaylist)




module.exports ={playlistRouter}