const { isValidObjectId } = require("mongoose");
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
});

module.exports = { toggleVideoLike, toggleCommentLike };
