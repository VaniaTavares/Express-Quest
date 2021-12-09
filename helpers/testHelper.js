const { sign, verify } = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");

const JWT_KEY = process.env.JWT_KEY;

const createTokens = (user) => {
  const accessToken = sign({ username: user.name, id: user.id }, JWT_KEY, {
    algorithm: "HS256",
  });
  return accessToken;
};

const validateToken = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  if (!accessToken)
    return res.status(400).json({ error: "User not authenticated" });
  try {
    const validToken = verify(accessToken, JWT_KEY);
    if (validToken) {
      let { username, id } = jwt_decode(accessToken);

      console.log(id, username);
      req.username = username;
      req.id = id;
      req.authenticated = true;
      return next();
    }
  } catch (err) {
    return res.status(400).json({ error: "Invalid" });
  }
};
module.exports = {
  createTokens,
  validateToken,
};
