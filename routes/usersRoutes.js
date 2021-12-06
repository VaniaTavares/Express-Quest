const express = require("express");
const { usersController } = require("../controllers");

const usersRouter = express.Router();

usersRouter.get("/", usersController.getUsersController);

usersRouter.get("/:id", usersController.getUserByIdController);

usersRouter.post("/", usersController.insertNewUserController);

usersRouter.put("/:id", usersController.updateUserController);

usersRouter.delete("/:id", usersController.deleteUserController);

usersRouter.post(
  "/api/auth/checkCredentials",
  usersController.userAuthenticationController
);

module.exports = usersRouter;
