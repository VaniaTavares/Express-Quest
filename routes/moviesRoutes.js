const express = require("express");
const { moviesController } = require("../controllers");
const { userHelper } = require("../helpers");

const moviesRouter = express.Router();

moviesRouter.get(
  "/",
  userHelper.validateUserToken,
  moviesController.allMoviesController
);

moviesRouter.get("/:id", moviesController.movieByIdController);

moviesRouter.post(
  "/",
  userHelper.validateUserToken,
  moviesController.newMovieController
);

moviesRouter.put("/:id", moviesController.updateMovieController);

moviesRouter.delete("/:id", moviesController.deleteMovieByIdController);

module.exports = moviesRouter;
