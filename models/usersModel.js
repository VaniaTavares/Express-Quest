const connection = require("../db-config");
const db = connection.promise();

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
    .then(([results]) => results)
    .catch((err) => {
      console.log(err);
      return err;
    });
};

const insertUser = (
  firstname,
  lastname,
  email,
  city,
  language,
  hashedPassword
) => {
  return db
    .query(
      "INSERT INTO `users`(firstname, lastname, email, city, language, hashedPassword) VALUES (?, ?, ?, ?, ?, ?);",
      [firstname, lastname, email, city, language, hashedPassword]
    )
    .then(([{ insertId }]) => insertId)
    .catch((err) => {
      console.log(err);
      return err;
    });
};

const validateEmail = (email) => {
  return db
    .query("SELECT id, email FROM users WHERE email=?", [email])
    .then(([results]) => results)
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

const getUserByEmail = (email) => {
  return db
    .query(
      "SELECT firstname, lastname, city, language, hashedPassword FROM users WHERE email= ?;",
      [email]
    )
    .then(([results]) => results)
    .catch((err) => {
      console.log(err);
      return err;
    });
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
  getUserByEmail,
};
