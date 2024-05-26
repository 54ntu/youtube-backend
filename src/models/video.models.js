const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    videoFile:{
        type:String, //url of video from third party services will be saved into database
        required:true
    },

    thumbnail:{
        type:String,
        required:true
    },

    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    title:{
        type:String,
        required:true
    },

    description:{
        type:String,
        required:true,
    },

    duration:{
        type:Number, //time will be given by the cloudinary
        required:true,
    },

    views:{
        type:Number,
        default:0
    },

    isPublished:{
        type:Boolean,
        default:true
    }


},
{
    timestamps:true,
})


const Video = mongoose.model('Video',videoSchema);
module.exports = {Video};