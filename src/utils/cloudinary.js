const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const uploadOnCloudinary = async (localfilepath) => {
  try {
    if (!localfilepath) return null;

    const response = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto",
    });

    console.log(
      "file has uploaded successfully into cloudinary....",
      response.url,
    );
    return response;
  } catch (error) {
    //when something went wrong or due to some error, we will be unable to upload the data into the cloudinary....at that time we just remove that file from the
    // local storage using file system (fs)

    fs.unlinkSync(localfilepath);
    return null;
  }
};

module.exports = { uploadOnCloudinary };
