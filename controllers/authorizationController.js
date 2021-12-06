const { authModel, usersModel } = require("../models");
const { calculateToken } = require("../helpers");

const userAuthenticationController = (req, res) => {
  const { email, password } = req.body;

  let hashedPassword;

  if (email && password) {
    authModel
      .getUserByEmail(email)
      .then(([users]) => {
        if (!users) return Promise.reject("NO_MATCH");
        hashedPassword = users.hashedPassword;

        return usersModel.verifyPassword(password, hashedPassword);
      })
      .then((passwordIsCorrect) => {
        if (!passwordIsCorrect) return Promise.reject("NO_MATCH");
        res.status(200).send(calculateToken(email));
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
