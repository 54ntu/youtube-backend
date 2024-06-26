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
        as: "videosDetails",
      },
    },
    {
      $addFields: {
        totalVideos: {
          $size: "$videosDetails",
        },
        totalviews: {
          $sum: "$videoDetails.views",
        },
      },
    },
    // {
    //   $unwind: "$videosDetails",
    // },

    {
      $project: {
        name: 1,
        description: 1,
        totalviews: 1,
        totalVideos: 1,
        createdAt: 1,
      },
    },
  ]);

  if (!userPlaylist) {
    throw new ApiError(404, "playlist not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userPlaylist,
        "userplaylist fetched successfully....",
      ),
    );
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

  const playListdetails = await Playlist.findById(playlistId);
  // console.log(playListdetails.owner.toString())

  // check whether the authorized user of the playlist is trying to add videos into the playlist or not
  if (playListdetails.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "you are not the owner of this playlist");
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

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, " invalid playlist id ");
  }

  const playlistByid = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
      },
    },

    {
      $match: {
        "videos.isPublished": true,
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $addFields: {
        totalVideos: {
          $size: "$videos",
        },
        totalviews: {
          $sum: "$videos.views",
        },
      },
    },

    {
      $unwind: "$owner",
    },
    {
      $unwind: "$videos",
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        totalVideos: 1,
        totalviews: 1,
        videos: {
          "videoFile.url": 1,
        },
        owner: {
          username: 1,
        },
      },
    },
  ]);

  if (!playlistByid) {
    throw new ApiError(404, "playlist not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlistByid, "playlist is fetched successfully"),
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "playlist id is not valid");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "video is not valid");
  }

  const playlistdetails = await Playlist.findById(playlistId);
  // console.log(playlistdetails)

  if (playlistdetails.owner.toString() !== req.user?._id) {
    throw new ApiError(400, "you are not the owner of this playlist");
  }

  if (playlistdetails.videos.length < 1) {
    throw new ApiError(
      404,
      "videos are not available for removing in playlist",
    );
  }

  const playlistaftervideoRemoved = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: videoId,
      },
    },
    {
      new: true,
    },
  );

  if (!playlistaftervideoRemoved) {
    throw new ApiError(500, "error while removing the videos from playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "videos removed successfully from playlist"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "playlist id is not valid");
  }

  const playlist = await Playlist.findById(playlistId);
  // console.log(playlist);

  if (!playlist) {
    throw new ApiError(404, "playlist not found");
  }

  if (playlist.owner.toString() !== req.user?._id) {
    throw new ApiError(401, "you are not authorized to delete the playlist");
  }

  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

  // console.log(deletedPlaylist);
  if (!deletedPlaylist) {
    throw new ApiError(500, "playlist deletion failed.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "playlist deleted successfully."));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "invalid play list id");
  }

  if (!(name && description)) {
    throw new ApiError(400, "name and description required");
  }

  const playlistdetails = await Playlist.findById(playlistId);
  if(playlistdetails.owner.toString() !== req.user?._id.toString()){
    throw new ApiError(400,"you are not allowed to change the playlist details")
  }

  const playlist = await Playlist.findByIdAndUpdate(playlistId, {
    $set: {
      name: name,
      description: description,
    },
  },
  {
    new:true
  }

);
  // console.log(playlist)
  if(!playlist){
    throw new ApiError(500,"error while updating playlist")
  }

  return res.status(200)
  .json(new ApiResponse(200,playlist,"playlist updated successfully"))
});

module.exports = {
  createPlaylist,
  getUserPlaylists,
  addVideoToPlaylist,
  getPlaylistById,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
