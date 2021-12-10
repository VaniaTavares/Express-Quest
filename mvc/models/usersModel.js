const connection = require("../db-config");
const db = connection.promise();

connection.connect((err) => {
  if (err) {
    console.error("error connecting: " + err.stack);
  } else {
    console.log("connected as id " + connection.threadId);
  }
});

const getUsers = ({ filters: { language } }) => {
  let sql = "SELECT * FROM users";
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
    .query("SELECT * FROM users WHERE id = ?", [id])
    .then(([results]) => results)
    .catch((err) => {
      console.log(err);
      return err;
    });
};

const insertUser = (firstname, lastname, email, city, language) => {
  return db
    .query(
      "INSERT INTO users (firstname, lastname, email, city, language ) VALUES (?, ?, ?, ?, ?);",
      [firstname, lastname, email, city, language]
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

module.exports = {
  getUsers,
  getUserById,
  insertUser,
  validateEmail,
  updateUser,
  deleteUser,
};
