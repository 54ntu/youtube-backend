const {asyncHandler} = require("../utils/asyncHandler");
const {Video} = require('../models/video.models')
const {ApiError} = require('../utils/ApiError');
const {ApiResponse} = require("../utils/ApiResponse")
const { uploadOnCloudinary } = require("../utils/cloudinary");
const { default: mongoose } = require("mongoose");

const getAllVideos = asyncHandler(async(req,res)=>{
    const videos = await Video.find();
    console.log(videos);



})



const publishAVideo =  asyncHandler(async(req,res)=>{
    //get the title and description from the req.body
    //check if empty
    //get video and thumbnail path
    //upload them into cloudinary
    //check video and thumbnail
    //if ok then go for create

    const {title,description}=req.body;
    if(!(title && description)){
            throw new ApiError(400,"title and description are required!!!!")
    }

    const videoFilePath = req.files?.video[0]?.path;
    // console.log("videoFilePath : ", videoFilePath);
    const thumbnailFilePath = req.files?.thumbnail[0]?.path;
    // console.log("thumbnailFilePath : ", thumbnailFilePath);
    if(!(videoFilePath && thumbnailFilePath)){
        throw new ApiError(400,"videofilePath and thumbnailFilepath is required!!!!!!");
    }


    const video = await uploadOnCloudinary(videoFilePath);
    // console.log("response after cloudinary upload : ", video);
    const thumbnail = await uploadOnCloudinary(thumbnailFilePath);
    // console.log("response from cloudinary for thumbnail is : ", thumbnail);

    

    if(!(video && thumbnail)){
        throw new ApiError(400,"video url and thumbnail url is required!!!");
    }


    const response = await Video.create({
        title,
        description,
        videoFile: video.url,
        thumbnail:thumbnail.url,
        duration:video.duration,
        owner : req.user?._id,
        isPublished:true,


    })


    const isUploaded = await Video.findById(response._id);

    if (!isUploaded) {
      throw new ApiError(500, "error while publishing video");
    }


    return res.status(200)
    .json(
        new ApiResponse(200,response, "new video published successfully.....")
    )
    
})



const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  console.log(videoId);
  // console.log(req.params);
  //TODO: get video by id


  if(!videoId){
    throw new ApiError(400,"id is not given");
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "likesmodels",
        localField: "_id",
        foreignField: "video",
        as: "likes",
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
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers",
            },
          },
          {
            $addFields: {
              subscribercount: {
                $size: "$subscribers",
              },
              isSubscribed: {
                $cond: {
                  if: {
                    $in: [req.user?._id, "$subscribers.subscriber"],
                  },
                  then: true,
                  else: false,
                },
              },
            },
          },
          {
            $project: {
              username: 1,
              "avatar.url": 1,
              subscribercount: 1,
              isSubscribed: 1,
            },
          },
        ],
      },
    },

    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
        owner: {
          $first: "owner",
        },
        isLiked: {
          $cond: {
            if: { $in: [req.user?._id, "$likes.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        "videoFile.url": 1,
        title: 1,
        description: 1,
        views: 1,
        createdAt: 1,
        duration: 1,
        comments: 1,
        owner: 1,
        likesCount: 1,
        isLiked: 1,
      },
    },
  ]);


  return res.json(video)

});





module.exports = {
  getAllVideos,
  publishAVideo,
  getVideoById,
};