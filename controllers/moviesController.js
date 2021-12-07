const { moviesModel, usersModel } = require("../models");

const allMoviesController = async (req, res) => {
  console.log("Cookies: ", req.cookies);

  // Cookies that have been signed
  console.log("Signed Cookies: ", req.signedCookies);
  try {
    if (req.cookies.user_token) {
      let user = await usersModel.getUserByTokenAsync(req.cookies.user_token);
      if (!user) res.status(401).send("Unauthorized");
      req.body.id = user.id;
    }
    const { max_duration, color } = req.query;

    let movies = await moviesModel.findMovies(
      {
        filters: { max_duration, color },
      },
      req.body.id
    );

    if (movies.length > 0) res.status(200).json(movies);
    else if (movies.length === 0)
      res.status(404).send("No movies found with those specifications");
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal issues");
  }
};

const movieByIdController = async (req, res) => {
  const movieId = req.params.id;
  let movie = await moviesModel.findMovieById(movieId);
  if (movie.length > 0) res.status(200).json(movie[0]);
  else if (movie.length === 0)
    res.status(404).send("No movies found with that id");
  else res.status(500).send("Error retrieving movies");
};

const newMovieController = async (req, res) => {
  let errors;
  errors = moviesModel.validateMovies(req.body);
  if (errors && errors.length)
    res.status(422).json({ validationErrors: errors });
  else {
    let user = await usersModel.getUserByTokenAsync(req.cookies.user_token);
    if (!user) res.status(401).send("Unauthorized!");
    req.body.user_id = user.id;

    let insertId = await moviesModel.insertNewMovie(req.body);
    delete req.body.user_id;
    if (insertId) res.status(201).json({ id: insertId, ...req.body });
    else res.status(500).send("Error saving the movie");
  }
};

const updateMovieController = async (req, res) => {
  const movieId = req.params.id;
  let errors;
  let existingMovie;

  let movie = await moviesModel.findMovieById(movieId);
  if (movie.length > 0) {
    existingMovie = movie[0];

    errors = moviesModel.validateMovies(req.body, false);

    if (errors.length) res.status(422).json({ validationErrors: errors });
    else {
      let movieToUpdate = await moviesModel.updateMovie(req.body, movieId);
      if (movieToUpdate === 1)
        res.status(200).json({ ...existingMovie, ...req.body });
      else res.status(500).send("Error updating movie");
    }
  } else if (movie.length === 0)
    res.status(404).send("No movies found with that id");
  else res.status(500).send("Error retrieving movies");
};

const deleteMovieByIdController = async (req, res) => {
  const movieId = req.params.id;

  let deletedMovie = await moviesModel.deleteMovieById(movieId);

  if (deletedMovie.affectedRows === 1)
    res.status(200).send("🎉 Movie deleted!");
  else if (deletedMovie.affectedRows === 0)
    res.status(404).send(`Movie with id ${movieId} not found.`);
  else res.status(500).send("😱 Error deleting movie");
};
module.exports = {
  allMoviesController,
  movieByIdController,
  newMovieController,
  updateMovieController,
  deleteMovieByIdController,
};
