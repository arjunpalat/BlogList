const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Blog = require("../models/blog");
const helper = require("./test_helper");

beforeEach(async () => {
  await Blog.deleteMany({});
  for (const blog of helper.blogs) {
    const blogObject = new Blog(blog);
    await blogObject.save();
  }
});

test("all notes are returned ", async () => {
  const response = await api.get("/api/blogs");
  expect(response.body).toHaveLength(helper.blogs.length);
});

test("blogs have unique identifier property as id", async () => {
  const response = await api.get("/api/blogs");
  expect(response.body[0].id).toBeDefined();
});

test("a valid blog can be added", async () => {
  const newBlog = {
    author: "#Test Author#",
    title: "#Test Title#",
    url: "#Test URL#",
    likes: 0,
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const blogs = (await Blog.find({})).map((blog) => blog.toJSON());
  expect(blogs).toHaveLength(helper.blogs.length + 1);
  const titles = blogs.map((blog) => blog.title);
  expect(titles).toContain("#Test Title#");
});

test("adding a new blog without likes property defaults it to zero likes", async () => {
  const blogWithoutLikes = {
    author: "#Test Author#",
    title: "#Test Title#",
    url: "#Test URL#",
  };

  const response = await api.post("/api/blogs").send(blogWithoutLikes);
  expect(response.body.likes).toBe(0);
});

test("adding a new blog without title property will not be accepted", async () => {
  const blogWithoutTitle = {
    author: "#Test Author#",
    url: "#Test URL#",
    likes: 2,
  };

  await api.post("/api/blogs").send(blogWithoutTitle).expect(400);
});

test("adding a new blog without url property will not be accepted", async () => {
  const blogWithoutUrl = {
    author: "#Test Author#",
    title: "#Test Title#",
    likes: 2,
  };

  await api.post("/api/blogs").send(blogWithoutUrl).expect(400);
});

afterAll(async () => {
  await mongoose.connection.close();
});
