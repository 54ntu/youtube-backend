const express = require("express")
const {verifyJWT} = require("../middlewares/auth.middlewares")
const { getChannelStats, getChannelVideos } = require("../controllers/dashboard.coontrollers")
const dashboardRouter = express.Router()

dashboardRouter.route("/getChannelStats").get(verifyJWT, getChannelStats);
dashboardRouter.route("/getChannelVideos").get(verifyJWT, getChannelVideos);



module.exports={dashboardRouter}