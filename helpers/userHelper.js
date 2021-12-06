const crypto = require("crypto");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;

const calculateToken = (userEmail = "") => {
  return crypto
    .createHash("md5")
    .update(userEmail + PRIVATE_KEY)
    .digest("hex");
};

console.log(calculateToken("vntavares56@gmail.com"));
console.log(calculateToken("pcp22@gmail.com"));
console.log(calculateToken("fjlt@gmail.com"));

module.exports = { calculateToken };
