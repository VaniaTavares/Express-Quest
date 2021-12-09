const { sign, verify } = require("jsonwebtoken");

const JWT_KEY = process.env.JWT_KEY;

const createTokens = (user) => {
  const accessToken = sign({ username: user.name, id: user.id }, JWT_KEY, {
    algorithm: "HS256",
  });
  return accessToken;
};

const validateToken = async (req, res, next) => {
  console.log(req.cookies);
  const accessToken = req.cookies.accessToken;
  if (!accessToken)
    return res.status(400).json({ error: "User not authenticated" });
  try {
    const validToken = verify(accessToken, JWT_KEY);
    if (validToken) {
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
