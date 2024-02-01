const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user");
  response.json(blogs);
});

blogsRouter.post("/", async (request, response) => {
  const user = await User.findById(request.user);

  if (!request.body.title || !request.body.url) {
    return response.status(400).json("Invalid request!");
  }

  const blog = new Blog({
    ...request.body,
    likes: request.body.likes || 0,
    user: user._id,
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();
  response.status(201).json(savedBlog);
});

blogsRouter.delete("/:id", async (request, response) => {
  const blog = await Blog.findById(request.params.id);
  if (!blog) {
    response.status(400).json({
      error: "The requested blog does not exist",
    });
  }
  if (blog.user.toString() === request.user.toString()) {
    await Blog.findByIdAndDelete(request.params.id);
    return response.status(204).end();
  }

  response.status(401).json({
    error: "Access denied",
  });
});

blogsRouter.put("/:id", async (request, response) => {
  const updatedBlog = request.body;
  const result = await Blog.findByIdAndUpdate(request.params.id, updatedBlog, {
    new: true,
  });
  response.status(200).json(result);
});

module.exports = blogsRouter;
