const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { User } = require("../models/user.models");
const {uploadOnCloudinary} = require("../utils/cloudinary")
const {hashPassword} = require("../utils/authcontrollers")

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
  console.log(username);
  if (!(username && email && fullName && password)) {
    throw new ApiError(400, "all fields are required!!!");
  }

  //user already exists - email or username

  const userExist = await User.findOne({
    $or: [{ email }, { username }],
  });

  if(userExist){
    throw new ApiError(409, "username or email already exist!!!!");
  }

//   console.log(req.files);

  console.log( req.files?.avatar[0]?.path)
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if(!avatarLocalPath){
    throw new ApiError(400,"avatar file is required!!!!!");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  console.log("avatarLocalPath : ", avatar);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  console.log("coverImage response from cloudinary is : ", coverImage)

  if(!avatar){
    throw new ApiError(400,"avatar file is required!!!!")
  }

  //password hashing 
  const hashedPassword = await hashPassword(password);
//   console.log('hashpassword : ', hashedPassword);


  const user = await User.create({
    username,
    email,
    fullName,
    password:hashedPassword,
    avatar:avatar.url,
    coverImage: coverImage?.url || "",
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if(!createdUser){
    throw new ApiError(500,"error while registering user data")
  }

  //resturn response
  return res.status(201).json(
    new ApiResponse(200,createdUser,"user created successfully..")
  )


});

module.exports = { registerUser };
