const mongoose = require("mongoose");

const subcriptionSchema = new mongoose.Schema(
  {
    subscriber: {
      type: mongoose.Schema.Types.ObjectId, //one who subscribes channel
      ref: "User",
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId, //one who subscriber subscribed
      ref: "User",
    },
  },
  { timestamps: true },
);

const Subscription = mongoose.model("Subscription", subcriptionSchema);
module.exports = { Subscription };
