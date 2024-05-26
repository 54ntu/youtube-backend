const mongoose = require("mongoose");
const { DB_NAME } = require("../constants");

const connectdb = async () => {
  try {
    const connectInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`,
    );
    console.log('database connected successfully...');
    console.log("host name: ",connectInstance.connection.host)
  } catch (error) {
    console.log("error connecting database ", error);
    process.exit(1);
  }
};

module.exports = {connectdb}