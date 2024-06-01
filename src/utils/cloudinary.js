const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const uploadOnCloudinary = async (localfilePath) => {
  console.log('localfilePath we are getting is : ', localfilePath)
  try {
    if (!localfilePath) return null;

    const response = await cloudinary.uploader.upload(localfilePath, {
      resource_type: "auto",
    });

    // console.log(
    //   "file has uploaded successfully into cloudinary....",
    //   response.url,
    // );
    fs.unlinkSync(localfilePath);
    return response;

  } catch (error) {
    console.log("error while uploading data into the cloudinary : ", error);
    console.log("localfilepath we are getting is : ", localfilePath);
    fs.unlinkSync(localfilePath); //when something went wrong or due to some error, we will be unable to upload the data into the cloudinary....at that time we just remove that file from the
    return null; // local storage using file system (fs)
  }
};


const deleteOnCloudinary = async (public_id, resource_type = "image") => {
  try {
    await cloudinary.uploader.destroy(public_id,{
      resource_type:`${resource_type}`
    });
  } catch (error) {
    console.log("error on deleting files ", error);
  }
};


module.exports = { uploadOnCloudinary, deleteOnCloudinary };
