const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI is not defined in environment variables");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Mongo db connected successfully");
  })
  .catch((err) => {
    console.error("Mongo db connection error: ", err);
    process.exit(1);
  });

const connection = mongoose.connection;

connection.on("disconnected", () => {
  console.log("Mongo db disconnected");
});

module.exports = mongoose;