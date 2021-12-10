const express = require("express");
const authRouter = express.Router();

const { authController } = require("../controllers");

authRouter.post("/sessions", authController.userAuthenticationController);

module.exports = authRouter;
