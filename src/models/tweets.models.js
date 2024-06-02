const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({

    content:{
        type:String,
        required:true   
    },

    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }


},{timestamps:true})




const TweetModel = mongoose.model("TweetModel",tweetSchema);
module.exports = {
    TweetModel
}