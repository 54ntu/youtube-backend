const express = require("express");
const { publishAVideo, getVideoById } = require("../controllers/video.controllers");
const { verifyJWT } = require("../middlewares/auth.middlewares");
const { upload } = require("../middlewares/multer.middlewares");
const videoRouter = express.Router();

videoRouter.route("/publish-video").post(
  verifyJWT,
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishAVideo,
);


videoRouter.route("/getVideo/:videoId").get(verifyJWT,getVideoById);

module.exports = { videoRouter };
