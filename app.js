const { MONGODB_URI } = require("./utils/config");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const blogsRouter = require("./controllers/blogs");

mongoose.connect(MONGODB_URI).then(() => {
  console.log("Successfully connected!");
});

app.use(cors());
app.use(express.json());
app.use("/api/blogs", blogsRouter);

module.exports = app;
