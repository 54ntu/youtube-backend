const {asyncHandler} = require("../utils/asyncHandler");
const {Video} = require('../models/video.models')
const {ApiError} = require('../utils/ApiError');
const {ApiResponse} = require("../utils/ApiResponse")
const { uploadOnCloudinary } = require("../utils/cloudinary");

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
  //TODO: get video by id
});





module.exports = {
  getAllVideos,
  publishAVideo,
  getVideoById,
};