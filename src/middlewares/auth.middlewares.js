const { User } = require("../models/user.models");
const { ApiError } = require("../utils/ApiError");
const { asyncHandler } = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    // console.log(token);
    if (!token) {
      throw new ApiError(401, "unauthorized access");
    }
  
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    // console.log("decodedToken contain : ", decodedToken);
  
    if (!(decodedToken)) {
      throw new ApiError(401, "invalid token!!!!");
    }
  //   console.log(decodedToken);
  
    
    req.user = decodedToken;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid access token")
    
  }
});

module.exports = { verifyJWT };
