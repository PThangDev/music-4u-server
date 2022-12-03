const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    const URI = process.env.MONGODB_ATLAS_URI;
    await mongoose.connect(URI, {});
    console.log("Connect MongoDB Atlas successfully!");
  } catch (error) {
    console.log("Connect DB has errors ", error);
  }
};
module.exports = connectDB;
