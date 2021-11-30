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
  let errors = [];

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
      message:
        "This field needs to be a string with numeric value bigger than 1887",
    });
  if (duration && duration <= 0)
    errors.push({
      field: `duration`,
      message: "This field needs to be bigger than 0",
    });
  if (color && color > 1)
    errors.push({
      field: "color",
      message: `Required with value of true or false (1 or 0)`,
    });

  if (errors.length) res.status(422).json({ validationErrors: errors });
  else {
    db.query("SELECT * FROM movies WHERE id = ?", [movieId])
      .then(([selectedResult]) => {
        if (!selectedResult) return Promise.reject("NO_MOVIE");
        return db.query("UPDATE movies SET ? WHERE id = ?", [
          req.body,
          movieId,
        ]);
      })
      .then((updatedResult) => console.log(updatedResult, selectedResult))
      .catch((err) => {
        console.log(err);
        if (err === "NO_MOVIE")
          res
            .status(404)
            .send(`Movie id ${movieId} is not valid. Movie not found!`);
        else res.status(500).send("Error!");
      });
  }
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
