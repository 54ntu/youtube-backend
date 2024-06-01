const express = require("express");
const {
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
} = require("../controllers/video.controllers");
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

videoRouter.route("/getVideo/:videoId").get(verifyJWT, getVideoById);
videoRouter
  .route("/update-video/:videoId")
  .patch(verifyJWT, upload.single("thumbnail"), updateVideo);

videoRouter.route("/delete/:videoId").delete(verifyJWT, deleteVideo);

module.exports = { videoRouter };
