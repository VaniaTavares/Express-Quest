const express = require("express");
const { moviesController } = require("../controllers");

const moviesRouter = express.Router();

moviesRouter.get("/", moviesController.allMoviesController);

moviesRouter.get("/:id", moviesController.movieByIdController);

moviesRouter.post("/", moviesController.newMovieController);

moviesRouter.put("/:id", moviesController.updateMovieController);

moviesRouter.delete("/:id", moviesController.deleteMovieByIdController);

module.exports = moviesRouter;
