const { asyncHandler } = require("../utils/asyncHandler");
const { Video } = require("../models/video.models");
const {Subscription} = require("../models/subcriptions.models")
const { default: mongoose, isValidObjectId } = require("mongoose");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { User } = require("../models/user.models");

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const userId = req.user?._id;
  //  console.log(userId)
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, " invalid channel id");
  }

  const videos = await Video.aggregate([
    {
        $match:{
            owner :new mongoose.Types.ObjectId(userId)
        }
    },
    {
        $lookup:{
            from :"likes",
            localField:"_id",
            foreignField:"video",
            as:"likes"
        }
    },
    {
        $group:{
            _id:null,
            totalViews:{$sum:"$views"},
            totalLikes :{$sum:{$size:"$likes"}},
            totalvideos:{$sum:1}
        }
    }


  ])


  const subscribercount = await Subscription.aggregate([
    {
        $match:{
            channel:new mongoose.Types.ObjectId(userId)
        }
    },
    {
        $addFields:{
            totalsubscribers:{
                $sum:1
            }
        }
    }

  ])


  const channelStats={
    totalvideos:videos[0]?.totalvideos || 0,
    totalLikes: videos[0]?.totalLikes || 0,
    totalViews: videos[0]?.totalViews || 0,
    totalsubscribers : subscribercount[0]?.totalsubscribers || 0
  }


  if(!channelStats){
    throw new ApiError(500,"error on fetching channel stats")
  }

  return res.status(200)
  .json(new ApiResponse(
    200, channelStats," channel status fetched successfully"
  ))

});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  // get user id from req
  //match that id
  //   console.log(req.user._id)
  if (!isValidObjectId(req.user?._id)) {
    throw new ApiError(400, "invalid user id");
  }

  const channelVideos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user?._id),
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
      $unwind: "$owner",
    },
    {
      $project: {
        "videoFile.url": 1,
        "thumbnail.url": 1,
        owner: {
          username: 1,
        },
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        createdAt: 1,
      },
    },
  ]);

  if (!channelVideos) {
    throw new ApiError(500, "error fetching the videos");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channelVideos, "videos fetched successfully!!"));
});

module.exports = {
  getChannelStats,
  getChannelVideos,
};
