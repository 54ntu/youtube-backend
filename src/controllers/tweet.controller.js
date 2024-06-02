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
  if (!isValidObjectId(user_id)) {
    throw new ApiError(400, "user id is not valid");
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

  if (!userTweets) {
    throw new ApiError(404, "user tweets is not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userTweets[0],
        "user tweets is fetched successfully!!!",
      ),
    );
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  //get the tweets id from the req.params
  //validate the id
  //check the user using req.user?._id is equal to the tweets owner id
  //query database
  //return response

  const { content } = req.body;
  const { tweetId } = req.params;
  const user_id = req.user?._id;
  if (!content) {
    throw new ApiError(400, "content is required");
  }
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "invalid tweet id");
  }

  if (!isValidObjectId(user_id)) {
    throw new ApiError(400, "invalid user id");
  }

  const tweet = await TweetModel.findById(tweetId);
  //   console.log(tweet)

  if (tweet.owner.toString() !== req.user?._id) {
    throw new ApiError(400, "you are not the owner of this tweets");
  }

  const updatedTweets = await TweetModel.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content,
      },
    },
    {
      new: true,
    },
  );

  // console.log(updatedTweets);
  if (!updatedTweets) {
    throw new ApiError(400, "error while updating tweets");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweets, "tweets updated successfully!!"));
});


const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet

  //get the tweet id to delete from req.params
  //get user id from the req
  //validate both the id
  //query database using tweet id
  //validate user and owner of the tweet is same
  //query database to delete
  //return response

  const {tweetId} = req.params
  const user_id = req.user?._id
  if(!isValidObjectId(tweetId)){
    throw new ApiError(400,"tweet id is not valid")
  }

  if(! isValidObjectId(user_id)){
    throw new ApiError(400,"user id is not valid")
  }

  const tweet = await TweetModel.findById(tweetId);
  
  if(!tweet){
    throw new ApiError(404,"tweets not found")
  }

  if(tweet.owner.toString() !== req.user?._id.toString()){
    throw new ApiError(400,"you are not the owner of this tweets")

  }

  const deleteTweet = await TweetModel.findByIdAndDelete(tweetId);
  if(!deleteTweet){
    throw new ApiError(500,"error while deleting the tweets")
  }

  return res.status(200)
  .json(
    new ApiResponse(200,
        "tweets deleted successfully.."
    )
  )


});

module.exports = { createTweet, getUserTweets, updateTweet, deleteTweet };
