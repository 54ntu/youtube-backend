const express = require('express');
const { registerUser, loginUser } = require('../controllers/user.controllers');
const {upload} = require("../middlewares/multer.middlewares")
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


module.exports = {router}