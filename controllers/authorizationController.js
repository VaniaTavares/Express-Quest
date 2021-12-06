const { authModel, usersModel } = require("../models");

const userAuthenticationController = async (req, res) => {
  const { email, password } = req.body;

  let retrieveHashedPassword;

  if (email && password) {
    authModel
      .getUserByEmail(email)
      .then((users) => {
        if (users.length === 0) return Promise.reject("NO_MATCH");
        retrieveHashedPassword = users[0].hashedPassword;

        return usersModel.verifyPassword(password, retrieveHashedPassword);
      })
      .then((passwordIsCorrect) => {
        if (!passwordIsCorrect) return Promise.reject("NO_MATCH");
        res
          .status(200)
          .send(
            "there is a user with the same email and a matching password in DB"
          );
      })
      .catch((err) => {
        if (err === "NO_MATCH") res.status(401).send("Invalid credentials!");
        else res.status(500).send("Server issues");
      });
  } else {
    res.status(401).send("Invalid credentials!");
  }
};

module.exports = { userAuthenticationController };
