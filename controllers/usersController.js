const { usersModel } = require("../models");
const { userHelper } = require("../helpers");

const getUsersController = (req, res) => {
  const { language } = req.query;

  usersModel
    .getUsers({ filters: { language } })
    .then((users) => {
      if (users.length > 0) res.status(200).json(users);
      else return Promise.reject("NO_USER");
    })
    .catch((error) => {
      console.log(error);
      if (error === "NO_USER")
        res.status(404).send("No users with those specifications");
      else res.status(500).send("Error in information retrieval");
    });
};

const getUserByIdController = (req, res) => {
  const userId = req.params.id;
  usersModel
    .getUserById(userId)
    .then((user) => {
      if (user) res.status(200).json(user);
      else return Promise.reject("NO_USER");
    })
    .catch((err) => {
      console.log(err);
      if (err === "NO_USER")
        res.status(404).send("No user with the requested id");
      else res.status(500).send("Error in information retrieval");
    });
};

const insertNewUserController = (req, res) => {
  let validationErrors, newUser;

  usersModel
    .validateEmail(req.body.email)
    .then((result) => {
      if (result) return Promise.reject("DUPLICATE_EMAIL");
      validationErrors = usersModel.validateUser(req.body);
      if (validationErrors) return Promise.reject("INVALID_DATA");

      return usersModel.insertUser(req.body);
    })
    .then((newUserId) => {
      newUser = newUserId;
      return userHelper.calculateToken(req.body.email, newUser.id);
    })
    .then((token) => {
      res.cookie("user_token", token, {
        maxAge: 1296000000,
        httpOnly: true,
      });
      res.status(201).json(newUser);
    })
    .catch((err) => {
      console.error(err);
      if (err === "DUPLICATE_EMAIL")
        res.status(409).json({ message: "This email is already in use." });
      else if (err === "INVALID_DATA")
        res.status(422).json({ validationErrors });
      else res.status(500).send("Error saving the user");
    });
};

const updateUserController = (req, res) => {
  const userId = req.params.id;
  let newEmail = req.body.email;

  let existingUser, validationErrors;

  Promise.all([
    usersModel.getUserById(userId),
    usersModel.validateEmail(newEmail),
  ])
    .then(([user, otherUserWithEmail]) => {
      existingUser = user;
      if (!existingUser) return Promise.reject("RECORD_NOT_FOUND");
      if (otherUserWithEmail && otherUserWithEmail.id !== parseInt(userId))
        return Promise.reject("DUPLICATE_EMAIL");
      validationErrors = usersModel.validateUser(req.body, false);
      if (validationErrors) return Promise.reject("INVALID_DATA");

      if (newEmail) return userHelper.calculateToken(newEmail, userId);
      else return userHelper.calculateToken(existingUser.email, userId);
    })
    .then(() => {
      return usersModel.updateUser(req.body, userId);
    })
    .then((user) => {
      delete req.body.password;
      if (user === 1) res.status(200).json({ ...existingUser, ...req.body });
      else return Promise.reject("NO_UPDATE");
    })
    .catch((err) => {
      console.error(err);
      if (err === "DUPLICATE_EMAIL")
        res.status(409).send("Email already in use by other user");
      else if (err === "INVALID_DATA")
        res.status(422).json({ validationErrors });
      else if (err === "NO_UPDATE") res.status(400).send("No new info");
      else if (err === "RECORD_NOT_FOUND")
        res.status(404).send(`User with id ${userId} not found.`);
      else res.status(500).send("Error updating a user");
    });
};

const deleteUserController = (req, res) => {
  const targetId = req.params.id;
  usersModel
    .deleteUser(targetId)
    .then((result) => {
      console.log(result.affectedRows);
      if (result.affectedRows === 1) res.status(200).send("🎉 User deleted!");
      else return Promise.reject("RECORD_NOT_FOUND");
    })
    .catch((err) => {
      console.log(err);
      if (err === "RECORD_NOT_FOUND") res.status(404).send("User not found.");
      else res.status(500).send("Error deleting an user");
    });
};

module.exports = {
  getUsersController,
  getUserByIdController,
  insertNewUserController,
  updateUserController,
  deleteUserController,
};
