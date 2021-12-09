const connection = require("../db-config");
const db = connection.promise();
const Joi = require("joi");
const bcrypt = require("bcrypt");
const { userHelper } = require("../helpers");

// validations
const validateTest = (data, forCreation = true) => {
  const presence = forCreation ? "required" : "optional";
  return Joi.object({
    email: Joi.string().email().max(255).presence(presence),
    password: Joi.string().alphanum().min(8).max(50).presence(presence),
    name: Joi.string().max(255).presence(presence),
  }).validate(data, { abortEarly: false }).error;
};

const getTestByEmail = async (email) => {
  try {
    const rawResults = await db.query(
      "SELECT id, name, email, hashedPassword FROM registrations WHERE email = ?",
      [email]
    );
    const [results] = rawResults;
    return results[0];
  } catch (err) {
    console.log(err);
    return err;
  }
};

// passwords
const hashPassword = async (password, saltRounds) => {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
  } catch (err) {
    console.log(err);
    return err;
  }
};

const verifyPassword = async (password, user) => {
  try {
    return await bcrypt.compare(password, user.hashedPassword);
  } catch (err) {
    console.log(err);
    return err;
  }
};

// queries
const getTestUsers = async () => {
  let sql = "SELECT id, firstname, lastname, email FROM registrations ";
  try {
    const rawResults = await db.query(sql);
    let [results] = rawResults[0];
    return results;
  } catch (err) {
    console.log(err);
    return err;
  }
};

const createTest = async ({ password, email, ...data }) => {
  try {
    const hashedPassword = await hashPassword(password, 10);
    const token = userHelper.calculateToken(email);

    const rawResults = await db.query("INSERT INTO `registrations` SET ?;", {
      hashedPassword,
      email,
      ...data,
      token,
    });
    const [{ insertId }] = rawResults;
    return { id: insertId, email, ...data };
  } catch (err) {
    console.log(err);
    return err;
  }
};

module.exports = {
  validateTest,
  getTestUsers,
  getTestByEmail,
  createTest,
  verifyPassword,
};
