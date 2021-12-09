const { moviesModel, usersModel } = require("../models");

const allMoviesController = async (req, res) => {
  console.log("Cookies: ", req.cookies);

  // Cookies that have been signed
  console.log("Signed Cookies: ", req.signedCookies);
  try {
    if (req.cookies.user_token) {
      let user = await usersModel.getUserByTokenAsync(req.cookies.user_token);
      if (!user) throw new Error("INVALID_CREDENTIALS");
      req.body.id = user.id;
    }
    const { max_duration, color } = req.query;

    let movies = await moviesModel.findMovies(
      {
        filters: { max_duration, color },
      },
      req.body.id
    );

    if (movies.length === 0) throw new Error("NO_RECORD_FOUND");

    res.status(200).json(movies);
  } catch (err) {
    console.log(err);
    if ("INVALID_CREDENTIALS") res.status(401).send("Unauthorized");
    else if (NO_RECORD_FOUND)
      res.status(404).send("No movies found with those specifications");
    res.status(500).send("Internal issues");
  }
};

const movieByIdController = async (req, res) => {
  try {
    const movieId = req.params.id;
    console.log(movieId);
    let movie = await moviesModel.findMovieById(movieId);
    if (movie.length > 0) res.status(200).json(movie[0]);
    else if (movie.length === 0) throw new Error("NO_RECORD_FOUND");
  } catch (err) {
    console.log(err);
    if ("NO_RECORD_FOUND") res.status(404).send("No movies found with that id");
    else res.status(500).send("Error retrieving movies");
  }
};

const newMovieController = async (req, res) => {
  let errors;
  try {
    errors = moviesModel.validateMovies(req.body);
    if (errors && errors.length) throw new Error("INVALID_DATA");

    let user = await usersModel.getUserByTokenAsync(req.cookies.user_token);
    if (!user) throw new Error("NO_USER_FOUND");
    req.body.user_id = user.id;

    let insertId = await moviesModel.insertNewMovie(req.body);
    delete req.body.user_id;
    if (insertId) res.status(201).json({ id: insertId, ...req.body });
  } catch (err) {
    console.log(err);
    if ("NO_USER_FOUND") res.status(401).send("Unauthorized!");
    else if ("INVALID_DATA") res.status(422).json({ validationErrors: errors });
    else res.status(500).send("Error saving the movie");
  }
};

const updateMovieController = async (req, res) => {
  const movieId = req.params.id;
  let errors;
  let existingMovie;

  try {
    let movie = await moviesModel.findMovieById(movieId);
    if (movie.length === 0) throw new Error("NO_RECORD_FOUND");
    existingMovie = movie[0];

    errors = moviesModel.validateMovies(req.body, false);

    if (errors.length) throw new Error("INVALID_DATA");

    let movieToUpdate = await moviesModel.updateMovie(req.body, movieId);
    if (movieToUpdate === 1)
      res.status(200).json({ ...existingMovie, ...req.body });
  } catch (err) {
    console.log(err);
    if ("NO_RECORD_FOUND") res.status(404).send("No movies found with that id");
    else if ("INVALID_DATA") res.status(422).json({ validationErrors: errors });
    else res.status(500).send("Error updating movies");
  }
};

const deleteMovieByIdController = async (req, res) => {
  const movieId = req.params.id;
  try {
    let deletedMovie = await moviesModel.deleteMovieById(movieId);
    if (deletedMovie.affectedRows === 0) throw new Error("NO_RECORD_FOUND");
    res.status(200).send("🎉 Movie deleted!");
  } catch (err) {
    if ("NO_RECORD_FOUND")
      res.status(404).send(`Movie with id ${movieId} not found.`);
    else res.status(500).send("😱 Error deleting movie");
  }
};
module.exports = {
  allMoviesController,
  movieByIdController,
  newMovieController,
  updateMovieController,
  deleteMovieByIdController,
};
