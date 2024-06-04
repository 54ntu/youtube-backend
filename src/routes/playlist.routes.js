const express = require("express");
const { verifyJWT } = require("../middlewares/auth.middlewares");
const {
  createPlaylist,
  getUserPlaylists,
  addVideoToPlaylist,
  getPlaylistById,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
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
playlistRouter
  .route("/remove/:videoId/:playlistId")
  .patch(verifyJWT, removeVideoFromPlaylist);
playlistRouter.route("/delete/:playlistId").delete(verifyJWT, deletePlaylist);
playlistRouter
  .route("/update/:playlistId")
  .patch(verifyJWT, updatePlaylist);

module.exports = { playlistRouter };
