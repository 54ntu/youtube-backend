const express = require("express");
const { verifyJWT } = require("../middlewares/auth.middlewares");
const {
  createPlaylist,
  getUserPlaylists,
  addVideoToPlaylist,
  getPlaylistById,
} = require("../controllers/playlist.controller");
const playlistRouter = express.Router();

playlistRouter.route("/createPlaylist").post(verifyJWT, createPlaylist);
playlistRouter
  .route("/getUserPlaylist/:userId")
  .get(verifyJWT, getUserPlaylists);
playlistRouter
  .route("/add/:videoId/:playlistId")
  .patch(verifyJWT, addVideoToPlaylist);
playlistRouter
  .route("/getPlaylist/:playlistId")
  .get(verifyJWT, getPlaylistById);



module.exports = { playlistRouter };
