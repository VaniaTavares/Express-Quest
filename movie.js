const connection = require("./db-config");
const express = require("express");

const movieRouter = express.Router({ mergeParams: true });

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

	connection.query(
		"INSERT INTO movies(title, director, year, color, duration) VALUES (?, ?, ?, ?, ?)",
		[title, director, year, color, duration],
		(err, result) => {
			if (err) {
				res.status(500).send("Error saving the movie");
			} else {
				console.log(result);
				const id = result.insertId;
				const createdUser = { id, title, director, year, color, duration };
				res.status(201).json(createdUser);
			}
		}
	);
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
	const movieId = req.params.id;

	connection.query(
		"SELECT * FROM movies WHERE id = ?",
		[movieId],
		(err, selectedResult) => {
			if (err) {
				res.status(500).send("Error!");
			} else {
				const dbresult = selectedResult[0];
				if (dbresult) {
					connection.query(
						"UPDATE movies SET ? WHERE id = ?",
						[req.body, movieId],
						(err) => {
							if (err) {
								res.status(500).send("Error on retrieval");
							} else {
								const updatedMovie = { ...dbresult, ...req.body };
								res.json(updatedMovie);
							}
						}
					);
				} else {
					res
						.status(404)
						.send(`Movie id ${movieId} is not valid. Movie not found!`);
				}
			}
		}
	);
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
