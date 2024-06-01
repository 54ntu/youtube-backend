const { asyncHandler } = require("../utils/asyncHandler");
const { Video } = require("../models/video.models");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const {
  uploadOnCloudinary,
  deleteOnCloudinary,
} = require("../utils/cloudinary");
const { default: mongoose, isValidObjectId } = require("mongoose");

const getAllVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find();
  console.log(videos);
});

const publishAVideo = asyncHandler(async (req, res) => {
  //get the title and description from the req.body
  //check if empty
  //get video and thumbnail path
  //upload them into cloudinary
  //check video and thumbnail
  //if ok then go for create

  const { title, description } = req.body;
  if (!(title && description)) {
    throw new ApiError(400, "title and description are required!!!!");
  }

  const videoFilePath = req.files?.video[0]?.path;
  // console.log("videoFilePath : ", videoFilePath);
  const thumbnailFilePath = req.files?.thumbnail[0]?.path;
  // console.log("thumbnailFilePath : ", thumbnailFilePath);
  if (!(videoFilePath && thumbnailFilePath)) {
    throw new ApiError(
      400,
      "videofilePath and thumbnailFilepath is required!!!!!!",
    );
  }

  const video = await uploadOnCloudinary(videoFilePath);
  // console.log("response after cloudinary upload : ", video);
  const thumbnail = await uploadOnCloudinary(thumbnailFilePath);
  // console.log("response from cloudinary for thumbnail is : ", thumbnail);

  if (!(video && thumbnail)) {
    throw new ApiError(400, "video url and thumbnail url is required!!!");
  }

  const response = await Video.create({
    title,
    description,
    videoFile: {
      public_id: video.public_id,
      url: video.url,
    },
    thumbnail: {
      public_id: thumbnail.public_id,
      url: thumbnail.url,
    },
    duration: video.duration,
    owner: req.user?._id,
    isPublished: true,
  });

  const isUploaded = await Video.findById(response._id);

  if (!isUploaded) {
    throw new ApiError(500, "error while publishing video");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, response, "new video published successfully....."),
    );
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  console.log(videoId);
  // console.log(req.params);
  //TODO: get video by id

  if (!videoId) {
    throw new ApiError(400, "id is not given");
  }

  // console.log("user id is : ",req.user._id);

  // const response = await Video.findById(videoId);

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },

    {
      $lookup: {
        from: "likes",
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
              subscriberCount: {
                $size: "$subscribers",
              },
              isSubscribed: {
                $cond: {
                  if: {
                    $in: [
                      new mongoose.Types.ObjectId(req.user?._id),
                      "$subscribers.subscriber",
                    ],
                  },
                  then: true,
                  else: false,
                },
              },
            },
          },
          {
            $project: {
              avatar: 1,
              username: 1,
              subscriberCount: 1,
              isSubscribed: 1,
            },
          },
        ],
      },
    },

    //actually we are getting owner fields as array data so to convert that array into object we can use another stages
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
    {
      $addFields: {
        likeCount: {
          $size: "$likes",
        },
        isLiked: {
          $cond: {
            if: {
              $in: [
                new mongoose.Types.ObjectId(req.user?._id),
                "$likes.likedBy",
              ],
            },
            then: true,
            else: false,
          },
        },
      },
    },

    {
      $project: {
        videoFile: 1,
        owner: 1,
        likeCount: 1,
        isLiked: 1,
      },
    },
  ]);

  if (video?.length < 1) {
    throw new ApiError(404, "video not found!!!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  //TODO: update video details like title, description, thumbnail
  const { videoId } = req.params;
  const { title, description } = req.body;

  //fetching the thumbnail local file path from req.files
  const thumbnailLocalPath = req.file?.path;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "videoId is not valid");
  }

  if (!(title && description)) {
    throw new ApiError(400, "title and descriptions are  required");
  }

  //find the video by its ID
  const video = await Video.findById(videoId);

  //checking the video
  if (!video) {
    throw new ApiError(404, "video not found...");
  }

  //checking if the user and owner is same
  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "you are not authorized to update video");
  }

  //fetch the public id of old thumbnail to delete
  const oldThumbnailPublicId = video.thumbnail.public_id;

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnail local file path is required");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  // console.log(thumbnail);

  if (!thumbnail) {
    throw new ApiError(400, "thumbnail is required");
  }

  const updatedVideoFile = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
        thumbnail: {
          public_id: thumbnail.public_id,
          url: thumbnail.url,
        },
      },
    },
    {
      new: true,
    },
  );

  if (!updatedVideoFile) {
    throw new ApiError(500, "error on updating video file");
  }

  if (updatedVideoFile) {
    await deleteOnCloudinary(oldThumbnailPublicId);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideoFile, "data updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid id...");
  }

  const video = await Video.findById(videoId);

  //check the availability of video
  if (!video) {
    throw new ApiError(404, "video not found!!!!");
  }

  //check whether the user is valid or not

  if (video.owner.toString() !== req.user?._id) {
    throw new ApiError(400, "you are not authorized user to delete video");
  }

  const response = await Video.findByIdAndDelete(videoId);

  if (!response) {
    throw new ApiError(500, "error while deleting data");
  }

  await deleteOnCloudinary(video.videoFile.public_id , "video");
  await deleteOnCloudinary(video.thumbnail.public_id);



  return res
    .status(200)
    .json(new ApiResponse(200, {}, "data deleted successfully..."));
});

module.exports = {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
};
