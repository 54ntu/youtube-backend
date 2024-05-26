<h2>Backend in Node.js</h2>
<p>Here I am trying to build backend apis for the given database design. I will implement professional way to maintain folder & file structure in Node.js project</p>



<p>here is the link for database design [eraser.io](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)</p>

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

