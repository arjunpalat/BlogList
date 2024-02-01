const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("blogs");
  response.json(users);
});

usersRouter.post("/", async (request, response) => {
  if (!request.body) {
    return response.status(400).json({ Error: "User details not provided" });
  }
  const { username, password, name } = request.body;

  if (!username || !password) {
    return response
      .status(400)
      .json({ Error: "Username or password not provided" });
  }

  if (password.length < 8) {
    return response
      .status(400)
      .json({ Error: "Password must be of minimum 8 characters" });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();
  response.status(201).json(savedUser);
});

module.exports = usersRouter;
