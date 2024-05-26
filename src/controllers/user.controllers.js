const { asyncHandler } = require("../utils/asyncHandler");

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

    const {username,email,fullName,password} = req.body
    console.log(username);

    


});

module.exports = { registerUser };
