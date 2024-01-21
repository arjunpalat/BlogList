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

blogsRouter.delete("/:id", async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id);
  response.status(204).end();
});

blogsRouter.put("/:id", async (request, response) => {
  const updatedBlog = request.body;
  const result = await Blog.findByIdAndUpdate(request.params.id, updatedBlog, { new: true });
  response.status(200).json(result);
});

module.exports = blogsRouter;
