const { TweetModel } = require("../models/tweets.models");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const {asyncHandler} = require("../utils/asyncHandler")


const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  //get the data comming from the req.body
  //verify if not empty
  //create object if everything is ok

  const {content} = req.body;
//   console.log(content);
    if(!content){
        throw new ApiError(400,"content is not provided")
    }

    const tweets = await TweetModel.create({
        content,
        owner:req.user?._id
    })

    // console.log(tweets);
    if(!tweets){
        throw new ApiError(500,"error on creating tweets")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,tweets,"tweets created successfully!!!")
    )

});



module.exports={createTweet}