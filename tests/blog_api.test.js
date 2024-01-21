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

describe("when database contains some blogs", () => {
  test("all blogs are returned ", async () => {
    const response = await api.get("/api/blogs");
    expect(response.body).toHaveLength(helper.blogs.length);
  });

  test("blogs have unique identifier property as id", async () => {
    const response = await api.get("/api/blogs");
    expect(response.body[0].id).toBeDefined();
  });
});

describe("adding a new blog", () => {
  test("succeeds if it has valid data", async () => {
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

  test("without likes property defaults it to zero likes", async () => {
    const blogWithoutLikes = {
      author: "#Test Author#",
      title: "#Test Title#",
      url: "#Test URL#",
    };

    const response = await api.post("/api/blogs").send(blogWithoutLikes);
    expect(response.body.likes).toBe(0);
  });

  test("fails with status 400 if title is absent", async () => {
    const blogWithoutTitle = {
      author: "#Test Author#",
      url: "#Test URL#",
      likes: 2,
    };

    await api.post("/api/blogs").send(blogWithoutTitle).expect(400);
  });

  test("fails with status 400 if url is absent", async () => {
    const blogWithoutUrl = {
      author: "#Test Author#",
      title: "#Test Title#",
      likes: 2,
    };

    await api.post("/api/blogs").send(blogWithoutUrl).expect(400);
  });
});

describe("deleting a blog", () => {
  test("succeeds with status 204 if id is valid", async () => {
    const initialBlogs = await helper.blogsInDB();
    const blogToDelete = initialBlogs[0];

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

    const finalBlogs = await helper.blogsInDB();

    expect(finalBlogs).toHaveLength(initialBlogs.length - 1);
    const titles = finalBlogs.map((blog) => blog.title);
    expect(titles).not.toContain(blogToDelete.title);
  });
});

describe("updating likes of a blog", () => {
  test("succeeds with status 200 if id is valid", async () => {
    const initialBlogs = await helper.blogsInDB();
    const blogToUpdate = initialBlogs[0];

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ ...blogToUpdate, likes: blogToUpdate.likes + 1 })
      .expect(200);

    expect(response.body.likes).toBe(blogToUpdate.likes + 1);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
