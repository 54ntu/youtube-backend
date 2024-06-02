const { default: mongoose, isValidObjectId } = require("mongoose");
const { TweetModel } = require("../models/tweets.models");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { asyncHandler } = require("../utils/asyncHandler");

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  //get the data comming from the req.body
  //verify if not empty
  //create object if everything is ok

  const { content } = req.body;
  //   console.log(content);
  if (!content) {
    throw new ApiError(400, "content is not provided");
  }

  const tweets = await TweetModel.create({
    content,
    owner: req.user?._id,
  });

  // console.log(tweets);
  if (!tweets) {
    throw new ApiError(500, "error on creating tweets");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "tweets created successfully!!!"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const user_id = req.user?._id;
  //    console.log(user_id);
    if(!isValidObjectId(user_id)){
        throw new ApiError(400,"user id is not valid")
    }

  const userTweets = await TweetModel.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(user_id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },

    {
      $project: {
        content: 1,
        owner: 1,
      },
    },
  ]);

//   console.log(userTweets);

if(!userTweets){
    throw new ApiError(404,"user tweets is not found")
}

return res.status(200)
.json(new ApiResponse(
    200, userTweets[0],"user tweets is fetched successfully!!!"
))

});

module.exports = { createTweet, getUserTweets };
