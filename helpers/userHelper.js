const { response } = require("express");
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;

const calculateToken = (userEmail = "", userId) => {
  return jwt.sign({ email: userEmail, user_id: userId }, PRIVATE_KEY);
};

const validateUserToken = async (req, res, next) => {
  let userToken = req.cookie.user_token;
  if (!accessToken)
    return res.status(400).json({ error: "User not authenticated" });
  try {
    let match = jwt.verify(userToken, PRIVATE_KEY);
    if (match) {
      let { email, user_id } = jwt_decode(userToken);
      console.log(email, user_id);
      req.email = email;
      req.user_id = user_id;
      req.authenticate = true;
      return next();
    }
  } catch (err) {
    console.log(err);
    return response.status(400).send("Invalid!");
  }
};
module.exports = { calculateToken, validateUserToken };
