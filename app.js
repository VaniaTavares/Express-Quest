const connection = require("./db-config");
// Import expres
const express = require("express");
const movieRouter = require("./movie");

// We store all express methods in a variable called app
const app = express();
app.use("/api/movies", movieRouter);

// If an environment variable named PORT exists, we take it in order to let the user change the port without chaning the source code. Otherwise we give a default value of 3000
const port = process.env.PORT || 3000;

app.use(express.json());

connection.connect((err) => {
	if (err) {
		console.error("error connecting: " + err.stack);
	} else {
		console.log(
			"connected to database with threadId :  " + connection.threadId
		);
	}
});

/*connection.query("SELECT * FROM movies", (err, results) => {
	// Do something when mysql is done executing the query
	console.log(err, results);
});*/

/*app.get("/api/users", (req, res, next) => {
	connection.query("SELECT * FROM users", (err, result) => {
		if (err) {
			res.status(500).send("Error retrieving data from database");
		} else {
			res.json(result);
			next();
		}
	});
});*/

app.get("/api/users/:id", (req, res) => {
	const userId = req.params.id;

	connection.query(
		"SELECT * FROM users WHERE id = ?",
		[userId],
		(err, results) => {
			if (err) {
				res.status(500).send("Error retrieving a user from database");
			} else {
				if (results.length > 0) {
					res.json(results[0]);
				} else {
					res.status(404).send("User not found");
				}
			}
		}
	);
});

app.get("/api/users", (req, res) => {
	let sql = "SELECT * FROM users";
	const sqlValues = [];

	if (req.query.language) {
		sql += " WHERE language = ?";
		sqlValues.push(req.query.language);
	}

	connection.query(sql, sqlValues, (err, results) => {
		if (err) {
			res.status(500).send("Error retrieving a user from database");
		} else {
			if (results.length > 0) {
				res.json(results);
			} else {
				res.status(404).send("User not found");
			}
		}
	});
});

app.post("/api/users", (req, res) => {
	const { firstname, lastname, email } = req.body;
	connection.query(
		"INSERT INTO USERS(FIRSTNAME, LASTNAME, EMAIL) VALUES (?, ?, ?)",
		[firstname, lastname, email],
		(err, result) => {
			if (err) {
				res.status(500).send("Error saving user");
			} else {
				console.log(result);
				const id = result.insertId;
				const createdUser = { id, firstname, lastname, email };
				res.status(201).json(createdUser);
			}
		}
	);
});

app.put("/api/users/:id", (req, res) => {
	const userId = req.params.id;
	const userPropsToUpdate = req.body;

	connection.query(
		"UPDATE users set ? where id= ?",
		[userPropsToUpdate, userId],
		(err, result) => {
			if (err) {
				res.status(500).send("Failed to update");
			} else {
				connection.query(
					"SELECT * FROM users WHERE id = ?",
					[req.params.id],
					(err, result) => {
						if (err) {
							res.status(500).send("Retrieval issue");
						} else {
							res.status(200).json(result);
						}
					}
				);
			}
		}
	);
});

app.delete("/api/users/:id", (req, res) => {
	const userId = req.params.id;
	connection.query(
		"DELETE FROM users WHERE id = ?",
		[userId],
		(err, results) => {
			if (err) {
				res.status(500).send("Bad request");
			} else {
				res.send("User deleted from database");
			}
		}
	);
});

// We listen to incoming request on the port defined above
app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
