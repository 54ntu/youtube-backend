const express = require("express")
const {verifyJWT} = require("../middlewares/auth.middlewares")
const { createPlaylist, getUserPlaylists, addVideoToPlaylist } = require("../controllers/playlist.controller")
const playlistRouter = express.Router()

playlistRouter.route("/createPlaylist").post(verifyJWT,createPlaylist)
playlistRouter.route("/getUserPlaylist/:userId").get(verifyJWT, getUserPlaylists);
playlistRouter.route("/add/:videoId/:playlistId").patch(verifyJWT,addVideoToPlaylist);




module.exports ={playlistRouter}