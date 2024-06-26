const { isValidObjectId, default: mongoose } = require("mongoose");
const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");
const { Likes } = require("../models/likes.models");
const { ApiResponse } = require("../utils/ApiResponse");

const toggleVideoLike = asyncHandler(async (req, res) => {
  //TODO: toggle likes on video
  // get the videoId of which we need to toggle the likes
  //check if the user already liked the video or not
  //if liked then findbyid and delete that like
  //if not then assign the user id into the isliked field
  //if ok return res
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid video id");
  }

  const existedLike = await Likes.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });

  // console.log(existedLike);
  if (existedLike) {
    await Likes.findByIdAndDelete(existedLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, "unliked successfully!!!"));
  } else {
    await Likes.create({
      video: videoId,
      likedBy: req.user?._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "video liked successfully!!!"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on comment
  //get the commentId from req.params
  //check the existence of like into the comment
  //if exist delete like
  //
  const { commentId } = req.params;
  // if(!isValidObjectId(commentId)){
  //   throw new ApiError(400,"invalid comment id")
  // }

  const existinglikeonComment = await Likes.findOne({
    comment: new mongoose.Types.ObjectId(commentId),
    likedBy: req.user?._id,
  });

  // console.log(existinglikeonComment)
  if (existinglikeonComment) {
    await Likes.findByIdAndDelete(existinglikeonComment._id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "unliked successfully"));
  } else {
    await Likes.create({
      comment: commentId,
      likedBy: req.user?._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "liked on comment successfully!!!"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "invalid tweet id");
  }

  const existingTweetlike = await Likes.findOne({
    tweet: tweetId,
    likedBy: req.user?._id,
  });

  if (existingTweetlike) {
    await Likes.findByIdAndDelete(existingTweetlike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "unliked successfully"));
  } else {
    await Likes.create({
      tweet: tweetId,
      likedBy: req.user?._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "liked successfully on tweets"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  //get the user id from the req
  //run aggregation pipeline

  const aggregateLikedVideos = await Likes.aggregate([
    {
      $match: {
        likedBy: req.user?._id,
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
            },
          },
          {
            $unwind: "$owner",
          },

          {
            $project: {
              _id: 0,
              username: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$videos",
    },
    {
      $project: {
        "videoFile.url": 1,
        title: 1,
        duration: 1,
        owner: {
          username: 1,
          email: 1,
        },
      },
    },
  ]);

  if (!aggregateLikedVideos) {
    throw new ApiError(404, "error while getting liked videos");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        aggregateLikedVideos,
        "likedVideos fetched successfully",
      ),
    );
});

module.exports = {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike,
  getLikedVideos,
};
