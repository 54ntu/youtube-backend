const { asyncHandler } = require("../utils/asyncHandler");
const { Subscription } = require("../models/subcriptions.models");
const { isValidObjectId, default: mongoose } = require("mongoose");
const { ApiError } = require("../utils/ApiError");
const {ApiResponse} = require("../utils/ApiResponse")
const { User } = require("../models/user.models");

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "invalid channel id");
  }

  const isSubscribed = await Subscription.findOne({
    subscriber: req.user?._id,
    channel: channelId,
  });

  if (isSubscribed) {
    await Subscription.findByIdAndDelete(isSubscribed?._id);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { subscribed: false },
          "unsunscribed successfully",
        ),
      );
  }

  await Subscription.create({
    subscriber: req.user?._id,
    channel: channelId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { subscribed: true }, "subscribed successfully"),
    );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  console.log(channelId);

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, " invalid channel id");
  }

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribedTosubscriber",
            },
          },
          {
            $addFields: {
              subscribedTosubscriber: {
                $cond: {
                  if: {
                    $in: [channelId, "$subscribedTosubscriber.subscriber"],
                  },
                  then: true,
                  else: false,
                },
              },
              subscriberCount: {
                $size: "$subscribedTosubscriber",
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        subscriber: {
          $first: "$subscriber",
        },
      },
    },
    {
      $project: {
        subscriber: {
          _id: 1,
          username: 1,
          fullName: 1,
          subscribedTosubscriber: 1,
          subscriberCount: 1,
        },
      },
    },
  ]);

  console.log(subscribers);

  if (!subscribers) {
    throw new ApiError(404, "data not found!!");
  }

  return res
    .status(200)
    .json(200, subscribers[0], "data fetched successfully!!!");
});





// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "invalid subscriberId");
  }

  const subscribedChannel = await Subscription.aggregate([
    {
      $match: new mongoose.Types.ObjectId(subscriberId),
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "subscribedchannel",
      },
    },
    {
      $addFields: {
        subscribedChannel: {
          $first: "$subscribedchannel",
        },
      },
    },
    {
      $project: {
        _id: 0,
        subscribedChannel:1
      },
    },
  ]);

  console.log(subscribedChannel);


  if(!subscribedChannel){
    throw new ApiError(404," channel details not found!!!!!!")
  }

  return res.status(200)
  .json(new ApiResponse( 200, subscribedChannel[0], "channel details fetched successfully!!!"))




});

module.exports = {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
};
