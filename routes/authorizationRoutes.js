const express = require("express");
const authRouter = express.Router();

const { authController } = require("../controllers");

authRouter.post(
  "/checkCredentials",
  authController.userAuthenticationController
);

module.exports = authRouter;
