const connection = require("../db-config");
const db = connection.promise();

const getUserByEmail = (email) => {
  return db
    .query("SELECT hashedPassword FROM users WHERE email= ?;", [email])
    .then(([results]) => results)
    .catch((err) => {
      console.log(err);
      return err;
    });
};

module.exports = {
  getUserByEmail,
};
