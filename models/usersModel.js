const connection = require("../db-config");
const db = connection.promise();
const Joi = require("joi");

const argon2 = require("argon2");

connection.connect((err) => {
  if (err) {
    console.error("error connecting: " + err.stack);
  } else {
    console.log("connected as id " + connection.threadId);
  }
});

const hashingOptions = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 5,
  parallelism: 1,
};

const hashPassword = (plainPassword) => {
  return argon2.hash(plainPassword, hashingOptions);
};

const verifyPassword = (plainPassword, hashedPassword) => {
  return argon2.verify(hashedPassword, plainPassword, hashingOptions);
};

const validateUser = (data, forCreation = true) => {
  const presence = forCreation ? "required" : "optional";
  return Joi.object({
    email: Joi.string().email().max(255).presence(presence),
    password: Joi.string().alphanum().min(8).max(50).presence(presence),
    firstname: Joi.string().max(255).presence(presence),
    lastname: Joi.string().max(255).presence(presence),
    city: Joi.string().allow(null, "").max(255),
    language: Joi.string().allow(null, "").max(255),
  }).validate(data, { abortEarly: false }).error;
};

const getUsers = ({ filters: { language } }) => {
  let sql = "SELECT id, firstname, lastname, email, city, language FROM users";
  const sqlValues = [];
  if (language) {
    sql += " WHERE language = ?";
    sqlValues.push(language);
  }

  return db
    .query(sql, sqlValues)
    .then(([results]) => results)
    .catch((err) => {
      console.log(err);
      return err;
    });
};

const getUserById = (id) => {
  return db
    .query(
      "SELECT firstname, lastname, email, city, language FROM users WHERE id = ?",
      [id]
    )
    .then(([results]) => results[0])
    .catch((err) => {
      console.log(err);
      return err;
    });
};

const insertUser = ({
  firstname,
  lastname,
  city,
  language,
  email,
  password,
  token,
}) => {
  let hashedPassword;
  return hashPassword(password)
    .then((treatedPassword) => {
      hashedPassword = treatedPassword;
      return db.query("INSERT INTO `users` SET ?;", {
        firstname,
        lastname,
        city,
        language,
        email,
        hashedPassword,
        token,
      });
    })
    .then(([{ insertId }]) => {
      return {
        id: insertId,
        firstname,
        lastname,
        email,
        city,
        language,
      };
    })
    .catch((err) => {
      console.log(err);
      return err;
    });
};

const validateEmail = (email) => {
  return db
    .query("SELECT id, email FROM users WHERE email=?", [email])
    .then(([results]) => results[0])
    .catch((err) => {
      console.log(err);
      return err;
    });
};

const updateUser = (body, id) => {
  return db
    .query("UPDATE users SET ? WHERE id = ?", [body, id])
    .then(([results]) => results.changedRows)
    .catch((err) => {
      console.log(err);
      return err;
    });
};

const deleteUser = (id) => {
  return db
    .query("DELETE FROM users WHERE id = ?", [id])
    .then(([results]) => results)
    .catch((err) => {
      console.log(err);
      return err;
    });
};

const getUserByToken = (token) => {
  return db
    .query("SELECT id, token FROM users WHERE token = ?", [token])
    .then(([results]) => results[0])
    .catch((err) => {
      console.log(err);
      return err;
    });
};

const getUserByTokenAsync = async (token) => {
  try {
    let [results] = await db.query(
      "SELECT id, token FROM users WHERE token = ?",
      [token]
    );
    return results[0];
  } catch (err) {
    console.log(err);
    return err;
  }
};

module.exports = {
  getUsers,
  getUserById,
  insertUser,
  validateEmail,
  updateUser,
  deleteUser,
  hashPassword,
  verifyPassword,
  validateUser,
  getUserByToken,
  getUserByTokenAsync,
};
