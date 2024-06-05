const { isValidObjectId } = require("mongoose");
const { Comment } = require("../models/comments.models");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
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

module.exports = { addComment, updateComment, deleteComment };
