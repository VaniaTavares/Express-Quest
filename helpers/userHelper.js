const jwt = require("jsonwebtoken");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;

const calculateToken = (userEmail = "", userId) => {
  return jwt.sign({ email: userEmail, user_id: userId }, PRIVATE_KEY, {
    expiresIn: "1296000000",
  });
};

const validateUserToken = async (req, res, next) => {
  let { user_token } = req.cookies;
  if (!user_token)
    return res.status(401).json({ error: "User not authenticated" });

  try {
    let match = jwt.verify(user_token, PRIVATE_KEY);

    if (!match) res.status(400).send("Invalid!");
    else {
      let { email, user_id } = match;

      req.email = email;
      req.user_id = user_id;
      req.authenticate = true;
      next();
      return;
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Issues");
  }
};

module.exports = { calculateToken, validateUserToken };
