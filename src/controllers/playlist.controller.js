const { isValidObjectId, default: mongoose } = require("mongoose");
const { Playlist } = require("../models/playlists.models");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const { Video } = require("../models/video.models");

const createPlaylist = asyncHandler(async (req, res) => {
  //TODO: create playlist
  // get name and description from req.body
  //check if empty or not

  const { name, description } = req.body;
  if (!name && !description) {
    throw new ApiError(400, " name and descriptions are required");
  }

  const ownerId = req.user?._id;
  const playlist = await Playlist.create({
    name,
    description,
    owner: ownerId,
  });

  // console.log(playlist);
  if (!playlist) {
    throw new ApiError(500, "error while creating playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  // console.log(userId);

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "invalid user id");
  }

  const userPlaylist = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
  ]);

  // console.log(userPlaylist)
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "invalid playlist id");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid video id");
  }

  const video = await Video.findById(videoId);
  //  console.log(video)

  const playListdetails= await Playlist.findById(playlistId);
  // console.log(playListdetails.owner.toString())


  // check whether the authorized user of the playlist is trying to add videos into the playlist or not
  if(playListdetails.owner.toString() !== req.user?._id.toString()){
    throw new ApiError(400,"you are not the owner of this playlist")
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: {
        videos: video?._id,
      },
    },
    {
      new: true,
    },
  );
  //  console.log(playlist);

  if (!playlist) {
    throw new ApiError(500, "error while adding videos into the playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlist,
        "video is added successfully into the playlist",
      ),
    );
});



module.exports = { createPlaylist, getUserPlaylists, addVideoToPlaylist };
