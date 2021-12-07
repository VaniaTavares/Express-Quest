// initial file

const connection = require("./db-config");
const express = require("express");

const movieRouter = express.Router();

movieRouter.use(express.json());

connection.connect((err) => {
  if (err) {
    console.error("error connecting: " + err.stack);
  } else {
    console.log(
      "connected to database with threadId :  " + connection.threadId
    );
  }
});

movieRouter.get("/", (req, res) => {
  let sql = "SELECT * FROM movies";
  const sqlFilter = [];

  if (
    (req.query.color && req.query.max_duration) ||
    (req.query.max_duration && req.query.color)
  ) {
    sql += " WHERE color = ? AND duration <= ?";
    sqlFilter.push(req.query.color);
    sqlFilter.push(req.query.max_duration);
  } else if (req.query.color) {
    sql += " WHERE color = ?";
    sqlFilter.push(req.query.color);
  } else if (req.query.max_duration) {
    sql += " WHERE duration <= ?";
    sqlFilter.push(req.query.max_duration);
  }

  console.log(sqlFilter);

  connection.query(sql, sqlFilter, (err, result) => {
    if (err) {
      res.status(500).send("Error retrieving data from database");
    } else {
      if (result.length > 0) {
        res.status(200).json(result);
      } else {
        res.status(200).json([]);
      }
    }
  });
});

movieRouter.get("/:id", (req, res) => {
  connection.query(
    "SELECT * FROM movies WHERE id = ?",
    [req.params.id],
    (err, result) => {
      if (err) {
        res.status(500).send("Error retrieving data from database");
      } else {
        if (result.length > 0) {
          res.status(200).json(result[0]);
        } else {
          res.status(404).send("No movies found.");
        }
      }
    }
  );
});

movieRouter.post("/", (req, res) => {
  const { title, director, year, color, duration } = req.body;
  let numericYear = parseInt(year);
  const db = connection.promise();
  let errors = [];

  if (!title)
    errors.push({ field: `title`, message: "This field is required" });
  else if (title.length >= 255)
    errors.push({
      field: `title`,
      message: "Should contain less than 255 alpha-numeric characters",
    });
  if (!director)
    errors.push({ field: `director`, message: "This field is required" });
  else if (director.length >= 255)
    errors.push({
      field: `director`,
      message: "Should contain less than 255 alpha-numeric characters",
    });
  if (!year) errors.push({ field: `year`, message: "This field is required" });
  else if (isNaN(year) || numericYear <= 1887)
    errors.push({
      field: `year`,
      message:
        "This field needs to be a string with numeric value bigger than 1887",
    });
  if (!duration)
    errors.push({ field: `duration`, message: "This field is required" });
  else if (duration <= 0)
    errors.push({
      field: `duration`,
      message: "This field needs to be bigger than 0",
    });
  if (!color || color > 1)
    errors.push({
      field: "color",
      message: `Required with value of true or false (1 or 0)`,
    });

  if (errors.length) res.status(422).json({ validationErrors: errors });
  else {
    db.query(
      "INSERT INTO movies(title, director, year, color, duration) VALUES (?, ?, ?, ?, ?)",
      [title, director, year, color, duration]
    )
      .then(([{ insertId }]) => {
        res
          .status(201)
          .json({ id: insertId, title, director, year, color, duration });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error saving the movie");
      });
  }
});

/*movieRouter.put("/:id", (req, res) => {
	const movieId = req.params.id;
	const updatedMovie = req.body;

	connection.query(
		"update movies set ? where id= ?",
		[updatedMovie, movieId],
		(err, result) => {
			if (err) {
				res.status(500).send("Error!");
			} else {
				res.send("Movie updated");
			}
		}
	);
});
*/

movieRouter.put("/:id", (req, res) => {
  const { title, director, year, color, duration } = req.body;
  let numericYear = parseInt(year);
  const movieId = req.params.id;

  const db = connection.promise();
  let existingMovie = null;
  let errors = [];

  db.query("SELECT * FROM movies WHERE id = ?", [movieId])
    .then(([selectedResult]) => {
      if (!selectedResult[0]) return Promise.reject("NO_MOVIE");
      existingMovie = selectedResult[0];
      if (title && title.length >= 255)
        errors.push({
          field: `title`,
          message: "Should contain less than 255 alpha-numeric characters",
        });
      if (director && director.length >= 255)
        errors.push({
          field: `director`,
          message: "Should contain less than 255 alpha-numeric characters",
        });
      if (year && (isNaN(year) || numericYear <= 1887))
        errors.push({
          field: `year`,
          message: "This field needs to be a number bigger than 1887",
        });
      if (duration && duration <= 0)
        errors.push({
          field: `duration`,
          message: "This field needs to be a number bigger than 0",
        });
      if (color && color > 1)
        errors.push({
          field: "color",
          message: `Required with value of true or false (1 or 0)`,
        });

      if (errors.length) return Promise.reject("INVALID_DATA");

      return db.query("UPDATE movies SET ? WHERE id=?;", [req.body, movieId]);
    })
    .then(() => res.status(200).json({ ...existingMovie, ...req.body }))
    .catch((err) => {
      console.log(err);
      if (err === "NO_MOVIE")
        res
          .status(404)
          .send(`Movie id ${movieId} is not valid. Movie not found!`);
      else if (err === "INVALID_DATA")
        res.status(422).json({ validationErrors: errors });
      else res.status(500).send("Error!");
    });
});

movieRouter.delete("/:id", (req, res) => {
  const movieId = req.params.id;
  connection.query(
    "DELETE FROM movies WHERE id = ?",
    [movieId],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("😱 Error deleting movie");
      } else {
        res.status(200).send("🎉 Movie deleted!");
      }
    }
  );
});

module.exports = movieRouter;

//// PROMISE VERSION WITH TOKENS

/*
const allMoviesController = (req, res) => {
  usersModel
    .getUserByToken(req.cookies.user_token)
    .then((user) => {
      if (req.cookies.user_token && !user)
        return Promise.reject("INVALID_TOKEN");
      else if (req.cookies.user_token) return user.id;
      else return;
    })
    .then((id) => {
      req.body.id = id;
      const { max_duration, color } = req.query;

      return moviesModel.findMovies(
        {
          filters: { max_duration, color },
        },
        req.body.id
      );
    })
    .then((movies) => {
      if (movies && movies.length > 0) res.status(200).json(movies);
      else return Promise.reject("NO_RECORD_FOUND");
    })
    .catch((err) => {
      console.log(err);
      if (err === "INVALID_TOKEN") res.status(401).send("Unauthorized");
      else if (err === "NO_RECORD_FOUND")
        res.status(404).send("No movies found with those specifications");
      else res.status(500).send("Internal issues");
    });
};
*/

const newMovieController = (req, res) => {
  let errors;
  errors = moviesModel.validateMovies(req.body);
  if (errors && errors.length)
    res.status(422).json({ validationErrors: errors });
  else {
    usersModel
      .getUserByToken(req.cookies.user_token)
      .then((user) => {
        if (!user) return Promise.reject("INVALID_TOKEN");
        return user;
      })
      .then((user) => {
        req.body.user_id = user.id;
        return moviesModel.insertNewMovie(req.body);
      })
      .then((insertId) => {
        delete req.body.user_id;
        if (insertId) res.status(201).json({ id: insertId, ...req.body });
        else return Promise.reject("ERROR");
      })
      .catch((err) => {
        console.log(err);
        if (err === "INVALID_TOKEN") res.status(401).send("Unauthorized!");
        res.status(500).send("Error saving the movie");
      });
  }
};
