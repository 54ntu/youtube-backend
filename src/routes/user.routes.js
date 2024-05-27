const express = require('express');
const { registerUser, loginUser, logoutUser, refreshAccessToken, changePassword } = require('../controllers/user.controllers');
const {upload} = require("../middlewares/multer.middlewares");
const { verifyJWT } = require('../middlewares/auth.middlewares');
const router = express.Router();

router.route('/register').post(upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1

    }
])   ,registerUser);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/changePassword").post(verifyJWT,changePassword)


module.exports = {router}