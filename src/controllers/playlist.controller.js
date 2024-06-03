const { Playlist } = require("../models/playlists.models");
const {ApiError} = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const {asyncHandler} = require("../utils/asyncHandler")

const createPlaylist = asyncHandler(async (req, res) => {
  //TODO: create playlist
  // get name and description from req.body
  //check if empty or not
  
  const { name, description } = req.body;
  if(!name && ! description){
    throw new ApiError(400," name and descriptions are required")
  }

  const ownerId = req.user?._id
  const playlist = await Playlist.create({
    name,
    description,
    owner:ownerId
  })


  // console.log(playlist);
  if(!playlist){
    throw new ApiError(500,"error while creating playlist")
  }

  return res.status(200)
  .json(
    new ApiResponse(200, playlist, "playlist created successfully")
  )


});



module.exports = { createPlaylist };