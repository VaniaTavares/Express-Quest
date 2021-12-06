const { authModel, usersModel } = require("../models");
const { userHelper } = require("../helpers");

const userAuthenticationController = (req, res) => {
  const { email, password } = req.body;
  let id;

  if (email && password) {
    authModel
      .getUserByEmail(email)
      .then(([users]) => {
        if (!users) return Promise.reject("NO_MATCH");
        id = users.id;
        return usersModel.verifyPassword(password, users.hashedPassword);
      })
      .then((passwordIsCorrect) => {
        if (!passwordIsCorrect) return Promise.reject("NO_MATCH");

        const token = userHelper.calculateToken(email);
        usersModel.updateUser({ token: token }, id);
        res.cookie("user_token", token);
        res.send();
      })
      .catch((err) => {
        console.log(err);
        if (err === "NO_MATCH") res.status(401).send("Invalid credentials!");
        else res.status(500).send("Server issues");
      });
  } else {
    res.status(401).send("Invalid credentials!");
  }
};

module.exports = { userAuthenticationController };
