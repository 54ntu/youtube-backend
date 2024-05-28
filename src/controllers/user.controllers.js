const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { User } = require("../models/user.models");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const { hashPassword, comparePassword } = require("../utils/authcontrollers");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");

const registerUser = asyncHandler(async (req, res) => {
  //fetch the data from req
  //validate data
  //validate user already exist : username or email
  //check for images, and avatar
  //upload them to cloudinary
  //if successfull -check it
  //hashed password
  //create user object
  //remove password and refreshtoken field from response
  //check for user creation
  //return response

  const { username, email, fullName, password } = req.body;
  // console.log(username);
  if (!(username && email && fullName && password)) {
    throw new ApiError(400, "all fields are required!!!");
  }

  //user already exists - email or username

  const userExist = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (userExist) {
    throw new ApiError(409, "username or email already exist!!!!");
  }

  //   console.log(req.files);

  // console.log( req.files?.avatar[0]?.path)
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is required!!!!!");
  }

  // console.log("avatarlocalPath value from req.files is :", avatarLocalPath);
  // console.log(
  //   "coverImageLocalFilePath value from req.files is : ",
  //   coverImageLocalPath,
  // );

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  console.log("response from cloudinary for avatar: ", avatar);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  console.log("coverImage response from cloudinary is : ", coverImage);

  if (!avatar) {
    throw new ApiError(400, "avatar file is required!!!!");
  }

  //password hashing
  const hashedPassword = await hashPassword(password);
  //   console.log('hashpassword : ', hashedPassword);

  const user = await User.create({
    username,
    email,
    fullName,
    password: hashedPassword,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!createdUser) {
    throw new ApiError(500, "error while registering user data");
  }

  //resturn response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user created successfully.."));
});

const loginUser = asyncHandler(async (req, res) => {
  //get the data from the req.body email or username or password
  //validate if empty or not
  //user is there or not
  //compare password
  //generate token into cookies
  //if everything ok then user logged in
  //pass token into the response

  const { username, email, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(409, "username or email is required!!!!");
  }

  const userExist = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!userExist) {
    throw new ApiError(404, "user data not found!!!");
  }

  // console.log("user data from user model is : ", userExist);
  const isPasswordMatched = await comparePassword(password, userExist.password);
  // console.log(matchPassword);

  if (!isPasswordMatched) {
    throw new ApiError(401, "password doesnot matched!!!");
  }

  //generate accessTOken and refresh Token

  const accessToken = await jwt.sign(
    {
      _id: userExist._id,
      email: userExist.email,
    },

    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );

  const refreshToken = await jwt.sign(
    {
      _id: userExist._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );

  // console.log("accesstoke is : ", accessToken);
  // console.log("refresh Token value is : ", refreshToken);

  //storing refreshToken into the User model
  userExist.refreshToken = refreshToken;
  userExist.save();

  const loggedInUser = await User.findById(userExist._id).select(
    "-password -refreshToken",
  );
  // console.log(loggedInUser);

  //before we set accessToken and RefreshToken into the cookies we need to define options
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          loggedInUser,
          accessToken,
          refreshToken,
        },

        "user loggedIn successfully!!!",
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // console.log("user data is : ",req.user);

  //destroy refreshtoken from the database
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { refreshToken: undefined }, //this will set refreshtoken value undefined
    },
    {
      new: true, // this will reset the state in database
    },
  );

  //destroy token from cookie

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out successfully!!!"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incommingRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incommingRefreshToken) {
      throw new ApiError(401, "unauthorized refresh token");
    }

    const decodedToken = jwt.verify(
      incommingRefreshToken,
      REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "invalid token!!!!!");
    }

    if (incommingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expired or used!!!");
    }

    ///generate new access token and new refresh token

    const new_accessToken = await jwt.sign(
      {
        _id: user._id,
        email: user.email,
      },

      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      },
    );

    const new_refreshToken = await jwt.sign(
      {
        _id: user._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      },
    );

    user.refreshToken = new_refreshToken;
    user.save();

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", new_accessToken, options)
      .cookie("refreshToken", new_refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken: new_accessToken,
            refreshToken: new_refreshToken,
          },
          "new tokens are created!!!",
        ),
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid token");
  }
});

const changePassword = asyncHandler(async (req, res) => {
  try {
    //old password and new password from req.body
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);
    const isPasswordMatched = await comparePassword(oldPassword, user.password);
    if (!isPasswordMatched) {
      throw new ApiError(400, "invalid old password!!!");
    }

    const hashedPassword = await hashPassword(newPassword);

    user.password = hashedPassword;
    user.save();

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "password changed successfully!!!!"));
  } catch (error) {
    console.log(error);
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user?._id).select(
      " -password -refreshToken",
    );
    // console.log(user);

    return res
      .status(200)
      .json(
        new ApiResponse(200, user, "current user data fetched successfully!!!"),
      );
  } catch (error) {
    console.log(
      error?.message || "error while fetching the current user data!!!",
    );
  }
});

const updateUserDetail = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { email, fullName } = req.body;
  if (!(email && fullName)) {
    throw new ApiError(401, "all fields are required!!!");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        email,
        fullName,
      },
    },
    {
      new: true,
    },
  ).select(" -password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "email and fullName is updated!!!"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalfilePath = req.file?.path;
  if (!avatarLocalfilePath) {
    throw new ApiError(404, "avatarlocalpath is not found!!!");
  }

  const avatar = await uploadOnCloudinary(avatarLocalfilePath);
  if (!avatar) {
    throw new ApiError(400, "Avatar is required!!!");
  }

  // console.log("avatar ",avatar);

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar?.url,
      },
    },
    {
      new: true,
    },
  ).select(" -password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "user avatar is updated successfully!!!"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalfilePath = req.file?.path;
  if (!coverImageLocalfilePath) {
    throw new ApiError(400, "coverImageLocalfilePath is not found!!!");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalfilePath);
  if (!coverImage) {
    throw new ApiError(400, "coverImage is required!!!");
  }

  // console.log("avatar ",avatar);

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage?.url || "",
      },
    },
    {
      new: true,
    },
  ).select(" -password -refreshToken");

  return res
    .status(200)
    .json(
      new ApiResponse(200, user, "user coverImage is updated successfully!!!"),
    );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const username = req.params;
  console.log(username);
  if (!username?.trim()) {
    throw new ApiError(400, "username is required!!!");
  }

  //if username is given then use aggregation pipeline

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },

    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCound: {
          $size: "$subscribers",
        },
        channelsSubscribersCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: {
              $in: [req.user?._id, "$subscribers.subscriber"],
            },
            then: true,
            else: false,
          },
        },
      },
    },

    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCound: 1,
        channelsSubscribersCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);


  if(!channel?.length){
    throw new ApiError(404,"channel doesnot exist!!")
  }

  return res
  .status(200)
  .json(
    new ApiResponse(200,channel[0],'user channel data fetched successfully!!!')
  )
});





const getWatchHistory = asyncHandler(async(req,res)=>{

  const user = await User.aggregate([
    {
      $match:{
        _id:new mongoose.Types.ObjectId(req,user._id)
      }
    },
    {
      $lookup:{
        from:"videos",
        localField:"watchHistory",
        foreignField:"_id",
        as:"watchHistory",

        pipeline:[
          {
            $lookup:{
              from:'users',
              localfield:"owner",
              foreignField:"_id",
              as:"owner",
              pipeline:[
                {
                  $project:{
                    fullName:1,
                    username:1,
                    avatar:1,

                  }
                }
              ]
            }
          },
          {
            $addFields:{
              owner:{
                $first:"$owner"
              }
            }
          }
        ]
      }
    }
  ])


  return res
  .status(200)
  .json(
    new ApiResponse(200,user[0].watchHistory,"watchHistory is fetched successfully...")
  )

})



module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateUserDetail,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
