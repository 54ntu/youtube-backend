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


  if(!playlistByid){
    throw new ApiError(404,"playlist not found")
  }


  return res.status(200)
  .json(new ApiResponse(200,playlistByid,"playlist is fetched successfully"))


});






module.exports = {
  createPlaylist,
  getUserPlaylists,
  addVideoToPlaylist,
  getPlaylistById,
};
