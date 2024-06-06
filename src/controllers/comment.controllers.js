const { isValidObjectId, default: mongoose } = require("mongoose");
const { Comment } = require("../models/comments.models");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { Video } = require("../models/video.models");
const { asyncHandler } = require("../utils/asyncHandler");

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  //get the content from the req.body
  //get the videoID from the req.params
  //check if empty
  //save the data into the database
  //if ok return response
  //else throw an error

  const { content } = req.body;
  const { videoId } = req.params;
  if (!(content && videoId)) {
    throw new ApiError(400, "content and video reference are required");
  }

  const userId = req.user?._id;

  const comments = await Comment.create({
    content,
    video: videoId,
    owner: userId,
  });

  if (!comments) {
    throw new ApiError(500, "error while adding comments");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, comments, "your comment is saved successfully!!!"),
    );
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  //get the comment id from the req.params
  //get the content from the req.body
  //check the owner id store in comment model is same as register user
  //query database and update the data if condition is matched
  // check successfully saved
  // if success then return res

  const { commentId } = req.params;
  // console.log(commentId);
  const { content } = req.body;
  // console.log(content);/
  if (!(commentId && content)) {
    throw new ApiError(400, "comment id and content both required");
  }

  const comments = await Comment.findById(commentId);
  // console.log(comments)
  //check owner id stored in database and user id comming from req are same
  if (comments.owner.toString() !== req.user?._id) {
    throw new ApiError(400, " you are not the owner of this comment");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content,
      },
    },
    {
      new: true,
    },
  );

  // console.log(updatedComment);
  if (!updatedComment) {
    throw new ApiError(500, {}, "error while updating comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  //get the comment id from the params
  //query database
  //check the user id from req and owner id store in database are same
  // query delete operations to the database
  //return res
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "comment id is not valid");
  }

  const comments = await Comment.findById(commentId);

  if (comments.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(401, "you are not authorized to delete this comment");
  }

  const deletedComment = await Comment.findByIdAndDelete(commentId);

  if (!deletedComment) {
    throw new ApiError(500, " comment deletion failed");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "comment deleted successfully"));
});

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "video id is not valid");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "video not found!!!!");
  }


  const pageNumber = parseInt(page,10)
  const limitNumber = parseInt(limit,10);
  const skip = (pageNumber-1)*limitNumber;

  const aggregateComments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
        pipeline: [
          {
            $project: {
              title: 1,
              "videoFile.url": 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$video",
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerdetails",
        pipeline: [
          {
            $project: {
              username: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$ownerdetails",
    },

    {
      $sort: {
        createdAt: -1,
      },
    },

    {
      $project: {
        _id: 0,
        content: 1,
        video: {
          "videoFile.url": 1,
          title: 1,
        },
        "ownerdetails.username": 1,
        createdAt: 1,
      },
    },
    {
      $skip: skip, // Skip documents for pagination
    },
    {
      $limit: limitNumber, // Limit documents for pagination
    },
  ]);

  // return res.json(aggregateComments);
  if(!aggregateComments){
    throw new ApiError(500,"error on fetching comments")
  }

  return res.status(200)
  .json(new ApiResponse(200,aggregateComments[0],"comments fetched successfully!!!!"))

});



module.exports = { addComment, updateComment, deleteComment, getVideoComments };
