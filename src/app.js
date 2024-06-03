const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { router } = require("./routes/user.routes");
const { videoRouter } = require("./routes/video.routes");
const { tweetRouter } = require("./routes/tweet.routes");
const { subscriptionRouter } = require("./routes/subscription.routes");
const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true })); // to read the data from url
app.use(express.static("public")); // this middleware helps to handle the image file
app.use(cookieParser()); // we can access the cookies data from the browser

//main route to the router

app.use("/api/v1", router);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscription", subscriptionRouter);

module.exports = { app };
