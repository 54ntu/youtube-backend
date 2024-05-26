const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { router } = require('./routes/user.routes');
const app = express()



app.use(cors());
app.use(express.json({limit:"20kb"}));
app.use(express.urlencoded({extended:true})); // to read the data from url
app.use(express.static('public')) // this middleware helps to handle the image file
app.use(cookieParser()); // we can access the cookies data from the browser

//main route to the router
app.use("/api/v1",router);

module.exports={app};