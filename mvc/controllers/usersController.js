const Joi = require("joi");
const { usersModel } = require("../models");

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
      if (user.length) res.status(200).json(user[0]);
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
  const { firstname, lastname, email, city, language } = req.body;
  let validationErrors = null;

  usersModel
    .validateEmail(email)
    .then((result) => {
      if (result[0]) return Promise.reject("DUPLICATE_EMAIL");

      validationErrors = Joi.object({
        email: Joi.string().email().max(255).required(),
        firstname: Joi.string().max(255).required(),
        lastname: Joi.string().max(255).required(),
        city: Joi.string().max(255),
        language: Joi.string().max(255),
      }).validate(
        { firstname, lastname, email, city, language },
        { abortEarly: false }
      ).error;
      if (validationErrors) return Promise.reject("INVALID_DATA");

      return usersModel.insertUser(firstname, lastname, email, city, language);
    })
    .then((newUserId) =>
      res
        .status(201)
        .json({ id: newUserId, firstname, lastname, email, city, language })
    )
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

  let { firstname, lastname, email, city, language } = req.body;
  let existingUser, validationErrors;

  usersModel
    .getUserById(userId)
    .then((user) => {
      if (!user.length) return Promise.reject("RECORD_NOT_FOUND");
      existingUser = user[0];
      return usersModel.validateEmail(email);
    })
    .then((result) => {
      if (result[0] && result[0].id !== parseInt(userId))
        return Promise.reject("DUPLICATE_EMAIL");

      validationErrors = Joi.object({
        email: Joi.string().email().max(255),
        firstname: Joi.string().max(255),
        lastname: Joi.string().max(255),
        city: Joi.string().max(255),
        language: Joi.string().max(255),
      }).validate(
        { firstname, lastname, email, city, language },
        { abortEarly: false }
      ).error;
      if (validationErrors) return Promise.reject("INVALID_DATA");

      return usersModel.updateUser(req.body, userId);
    })
    .then((user) => {
      if (user === 1) res.status(200).json({ ...existingUser, ...req.body });
    })
    .catch((err) => {
      console.error(err);
      if (err === "DUPLICATE_EMAIL")
        res.status(409).send("Email already in use by other user");
      else if (err === "INVALID_DATA")
        res.status(422).json({ validationErrors });
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
