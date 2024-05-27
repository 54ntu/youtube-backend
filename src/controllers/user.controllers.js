const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { User } = require("../models/user.models");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const { hashPassword, comparePassword } = require("../utils/authcontrollers");
const jwt = require("jsonwebtoken");

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

module.exports = {
  registerUser,
  loginUser,
};
