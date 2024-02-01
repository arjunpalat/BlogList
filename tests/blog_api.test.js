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
    const newUser = {
      username: "tester",
      name: "Tester",
      password: "tester123",
    };

    await api.post("/api/users").send(newUser);

    const response = await api
      .post("/api/login")
      .send({ username: newUser.username, password: newUser.password });

    const token = response.body.token;

    const newBlog = {
      author: "#Test Author#",
      title: "#Test Title#",
      url: "#Test URL#",
      likes: 0,
    };

    await api
      .post("/api/blogs")
      .send(newBlog)
      .set({ Authorization: `Bearer ${token}` })
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogs = (await Blog.find({})).map((blog) => blog.toJSON());
    expect(blogs).toHaveLength(helper.blogs.length + 1);
    const titles = blogs.map((blog) => blog.title);
    expect(titles).toContain("#Test Title#");
  });

  test("without likes property defaults it to zero likes", async () => {
    const newUser = {
      username: "tester",
      name: "Tester",
      password: "tester123",
    };

    await api.post("/api/users").send(newUser);

    const response1 = await api
      .post("/api/login")
      .send({ username: newUser.username, password: newUser.password });

    const token = response1.body.token;
    const blogWithoutLikes = {
      author: "#Test Author#",
      title: "#Test Title#",
      url: "#Test URL#",
    };

    const response = await api
      .post("/api/blogs")
      .set({ Authorization: `Bearer ${token}` })
      .send(blogWithoutLikes);
    expect(response.body.likes).toBe(0);
  });

  test("fails with status 400 if title is absent", async () => {
    const newUser = {
      username: "tester",
      name: "Tester",
      password: "tester123",
    };

    await api.post("/api/users").send(newUser);

    const response = await api
      .post("/api/login")
      .send({ username: newUser.username, password: newUser.password });

    const token = response.body.token;

    const blogWithoutTitle = {
      author: "#Test Author#",
      url: "#Test URL#",
      likes: 2,
    };

    await api
      .post("/api/blogs")
      .set({ Authorization: `Bearer ${token}` })
      .send(blogWithoutTitle)
      .expect(400);
  });

  test("fails with status 400 if url is absent", async () => {

    const newUser = {
      username: "tester",
      name: "Tester",
      password: "tester123",
    };

    await api.post("/api/users").send(newUser);

    const response = await api
      .post("/api/login")
      .send({ username: newUser.username, password: newUser.password });

    const token = response.body.token;

    const blogWithoutUrl = {
      author: "#Test Author#",
      title: "#Test Title#",
      likes: 2,
    };

    await api
      .post("/api/blogs")
      .set({ Authorization: `Bearer ${token}` })
      .send(blogWithoutUrl)
      .expect(400);
  });
});

/* describe("deleting a blog", () => {
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
 */
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
