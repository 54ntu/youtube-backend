- [here is the link for database design](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)
<h2>Backend in Node.js</h2>
<hr>
<h1>important Notes regard delete old images or old file from the cloudinary when we are updating them</h1>
<p>To delete files when we are trying to update file . Cloudinary gives public_id when we upload files into the cloudinary. By using that public_id we can easily delete the old files from the cloudinary as well as upload the new files.</p>
<p>TO do that we need this configuration</p>
<h2>while defining schema i.e. in models: </h2>
<p> we need to define "public_id" field where id will be assigned which is obtained from the cloudinary.</p>

```javascript

const videoSchema = new mongoose.Schema(
  {
    videoFile: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },

    thumbnail: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    duration: {
      type: Number, //time will be given by the cloudinary
      required: true,
    },

    views: {
      type: Number,
      default: 0,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);



videoSchema.plugin(aggregatePaginate);

const Video = mongoose.model('Video',videoSchema);
module.exports = {Video};

```


<h2>We need cloudinary configuration :</h2>

```javascript

const deleteOnCloudinary = async(public_id)=>{
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    console.log("error on deleting files ", error);
    
  }

}



```

<h2>controller will be written like this: </h2>

```javascript
const updateVideo = asyncHandler(async (req, res) => {
  //TODO: update video details like title, description, thumbnail
  const { videoId } = req.params;
  const {title, description} = req.body;

  //fetching the thumbnail local file path from req.files
  const thumbnailLocalPath = req.file?.path

  if(!(isValidObjectId(videoId))){
    throw new ApiError(400, "videoId is not valid")

  }

  if(!(title && description)){
    throw new ApiError(400, "title and descriptions are  required")
  }


  //find the video by its ID
  const video = await Video.findById(videoId);

  //checking the video
  if(!video){
    throw new ApiError(404, "video not found...")
  }


  //checking if the user and owner is same
  if(video.owner.toString() !== req.user?._id.toString()){
    throw new ApiError(400,"you are not authorized to update video")
  }


  //fetch the public id of old thumbnail to delete
  const oldThumbnailPublicId = video.thumbnail.public_id;

  if(!thumbnailLocalPath){
    throw new ApiError(400,"thumbnail local file path is required")
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  // console.log(thumbnail);

  if(!thumbnail){
    throw new ApiError(400,"thumbnail is required")
  }

  const updatedVideoFile = await Video.findByIdAndUpdate(
    videoId,
    {
      $set:{
        title,
        description,
        thumbnail:{
          public_id:thumbnail.public_id,
          url:thumbnail.url
        }
      }
    },
    {
      new:true
    }
   
  );

  if (!updatedVideoFile) {
    throw new ApiError(500, "error on updating video file");
  }

  if (updatedVideoFile) {
    await deleteOnCloudinary(oldThumbnailPublicId);
  }


  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideoFile, "data updated successfully"));



});

```

<hr>
<p>Here I am trying to build backend apis for the given database design. I will implement professional way to maintain folder & file structure in Node.js project</p>

<p>This one is one of the best project where all the concepts like CRUD and aggregation pipeline concepts will be implemented.</p>
<h3>Important points :</h3>
<p>BSON Data and Json data : BSON data is machine-readable but json data is human readable. Both store the data into the key value pair. BSON data provides support for more datatypes than JSON data </p>

```javascript

//JSON data
{
  "name": "Alice",
  "age": 30,
  "isStudent": false,
  "courses": ["Math", "Science"]
}


//bson data

{
  "name": "Alice",
  "age": 30,
  "isStudent": false,
  "courses": ["Math", "Science"],
  "birthday": new Date("1992-03-15"),
  "profilePic": <binary data>
}


```

# mongoose aggregate paginate-v2
<p>It is important to know where to use aggregate paginate. Because, it has some special functionality. Whenever we need to handle large datasets like displaying list of videos, list of users, lists of products, aggregate paginate makes effiecient retrieval of the data. It allows us to write aggregate queries</p>
<p>When we have small datasets to fetch and display then we donot need to use this aggregate paginate.</p>
<hr>
<h3>Example Scenarios where to use aggregate paginate and where not to use : </h3>
<h4>Scenario 1: Video Listing</h4>
<ul>
  <li>Use Pagination: When displaying a list of videos in a web application, use aggregate pagination to fetch and display videos page by page.</li>
</ul>

```javascript

const getPaginatedVideos = async (page, limit) => {
    const aggregateQuery = Video.aggregate([
        { $match: { isPublished: true } },
        { $sort: { createdAt: -1 } }
    ]);

    const options = {
        page: page,
        limit: limit
    };

    return await Video.aggregatePaginate(aggregateQuery, options);
};

```

<h4>Scenario 2: Video Detail Page</h4>
<ul>
  <li>Do Not Use Pagination: When fetching a single video by its ID to display its details.</li>
</ul>

```javascript

const getVideoById = async (videoId) => {
    return await Video.findById(videoId);
};

```

<h4>Scenario 3: Admin Dashboard with Filtering and Sorting</h4>
<ul>
<li>Use Pagination: When displaying a list of users, products, or any other entities with filtering and sorting options in an admin dashboard.</li>
</ul>

```javascript

const getPaginatedUsers = async (page, limit, filter, sort) => {
    const aggregateQuery = User.aggregate([
        { $match: filter },
        { $sort: sort }
    ]);

    const options = {
        page: page,
        limit: limit
    };

    return await User.aggregatePaginate(aggregateQuery, options);
};

```
<h3>Conclusion</h3>

<p>
  Use mongoose-aggregate-paginate-v2 when you need to handle large datasets efficiently, especially in user interfaces where users interact with lists of items. Avoid using it for operations that involve single document retrieval or when the dataset is small enough that performance is not a concern. By following these guidelines, you can ensure that you use pagination effectively and only where it provides clear benefits.
</p>

<hr>
<h2>AccessToken and Refresh Token Notes</h2>
<p>Generally we can work with only using the AccessToken. But we can also work by generating both accessToken and RefreshToken. <b>AccessToken</b> is considered as short lived Token whereas <b>RefreshToken</b> is considered as long lived token. which means AccessToken remains for short duration and RefreshToken remains longer than AccessToken. We store this refreshToken into the database and also send it to the user through response. </p>
<h3>How does this refreshToken helps????</h3>
<p>Generally, when the accessToken is expired or user Logout , but the user has that refreshToken  if that user hit the certain api endpoint with the refreshToken then the user can logged in</p>
<h3>while setting the token into the cookies, generally that token can be manipulated from the client side i.e. frontend. so we defined options before setting that token into the cookies. In that case, that token can be manipulated from the server side only.</h3>

```javascript

const options={
httpOnly:true,
secure:true
}

res.status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",refreshToken,options)
.json(
//here send the json data with status code, data and message
)

```

<hr>

# How can we logout user

<p>if we destroy session id or token from the database and clear the token from the cookies then we can easily logout the user</p>

```javascript


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
    .clearCookie("refreshToken",options)
    .json(
      new ApiResponse(200,{},"user logged out successfully!!!")
    )
});


```




