const blogsRouter = require("express").Router();
const Blog = require("../models/blog");

blogsRouter.get("/", (request, response) => {
  Blog.find({}).then((blogs) => {
    response.json(blogs);
  });
});

blogsRouter.post("/", (request, response) => {
  if (!request.body.title || !request.body.url) {
    return response.status(400).json("Invalid request!");
  }
  
  const blog = { ...request.body, likes: request.body.likes || 0 };
  const blogObject = new Blog(blog);

  blogObject.save().then((result) => {
    response.status(201).json(result);
  });
});

module.exports = blogsRouter;
