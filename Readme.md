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

