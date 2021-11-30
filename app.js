const connection = require("./db-config");
// Import expres
const express = require("express");
const Joi = require("joi");

const movieRouter = require("./movie");

// We store all express methods in a variable called app
const app = express();
app.use("/api/movies", movieRouter);

const port = process.env.PORT || 3000;

connection.connect((err) => {
  if (err) {
    console.error("error connecting: " + err.stack);
  } else {
    console.log("connected as id " + connection.threadId);
  }
});

app.use(express.json());

app.get("/api/users", (req, res) => {
  let sql = "SELECT * FROM users";
  const sqlValues = [];
  if (req.query.language) {
    sql += " WHERE language = ?";
    sqlValues.push(req.query.language);
  }
  connection.query(sql, sqlValues, (err, results) => {
    if (err) {
      res.status(500).send("Error retrieving users from database");
    } else {
      res.json(results);
    }
  });
});

app.get("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  connection.query(
    "SELECT * FROM users WHERE id = ?",
    [userId],
    (err, results) => {
      if (err) {
        res.status(500).send("Error retrieving user from database");
      } else {
        if (results.length) res.json(results[0]);
        else res.status(404).send("User not found");
      }
    }
  );
});

/*
app.post("/api/users", (req, res) => {
  const { firstname, lastname, email } = req.body;

  const emailRegex = /[a-z0-9._]+@[a-z0-9-]+\.[a-z]{2,3}/;

  const errors = [];
  const db = connection.promise();

  const hardValidation = (arg) => {
  if(!arg) errors.push({ field: `${arg}`, message: "This field is required" });
  else if(arg === "email" && !emailRegex.test(email))
    errors.push({ field: "email", message: "Invalid email" });
    else if((arg === "firstname" || arg === "lastname") && arg.length >= 255) {
    errors.push({
      field: `${arg}`,
      message: "Should contain less than 255 characters",
    });
    }
  }

  hardValidation(firstname);
  hardValidation(laststname);
  hardValidation(email);

  db.query("SELECT email FROM users WHERE email=?;", [email]).then(
    ([result]) => {
      if (result[0]) {
        errors.push({
          field: "email",
          message: "There's an user with that email",
        });
      }
      if (
        errors.length &&
        errors.find((elt) => elt.message == "There's an user with that email")
      ) {
        res.status(409).json({ message: "This email is already used" });
      } else if (errors.length) {
        res.status(422).json({ validationErrors: errors });
      } else {
        db.query(
          "INSERT INTO users (firstname, lastname, email) VALUES (?, ?, ?)",
          [firstname, lastname, email]
        )
          .then(([{ insertId }]) => {
            res.status(201).json({ id: insertId, firstname, lastname, email });
          })
          .catch((err) => {
            console.error(err);
            res.status(500).send("Error saving the user");
          });
      }
    }
  );
});
*/

app.post("/api/users", (req, res) => {
  const db = connection.promise();
  const { firstname, lastname, email, city, language } = req.body;
  let validationErrors = null;

  db.query("SELECT email FROM users WHERE email=?", [email])
    .then(([result]) => {
      if (result[0]) return Promise.reject("DUPLICATE_EMAIL");
      validationErrors = Joi.object({
        email: Joi.string().email().max(255).required(),
        firstname: Joi.string().max(255).required(),
        lastname: Joi.string().max(255).required(),
        city: Joi.string().max(255),
        language: Joi.string().max(255),
      }).validate(
        { firstname, lastname, email, city, language },
        { abortEarly: false }
      ).error;
      if (validationErrors) return Promise.reject("INVALID_DATA");
      return db.query(
        "INSERT INTO users (firstname, lastname, email, city, language ) VALUES (?, ?, ?, ?, ?);",
        [firstname, lastname, email, city, language]
      );
    })
    .then(([{ insertId }]) => {
      res
        .status(201)
        .json({ id: insertId, firstname, lastname, email, city, language });
    })
    .catch((err) => {
      console.error(err);
      if (err === "DUPLICATE_EMAIL")
        res.status(409).json({ message: "This email is already in use." });
      else if (err === "INVALID_DATA")
        res.status(422).json({ validationErrors });
      else res.status(500).send("Error saving the user");
    });
});

app.put("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  const numericId = parseInt(userId);

  let { firstname, lastname, email, city, language } = req.body;
  let existingUser, validationErrors;

  const db = connection.promise();

  db.query("SELECT * FROM users WHERE id = ?", [userId])
    .then(([selectedResult]) => {
      if (!selectedResult[0]) return Promise.reject("RECORD_NOT_FOUND");
      existingUser = selectedResult[0];
      return db.query("SELECT id, email FROM users WHERE email=?;", [email]);
    })
    .then(([result]) => {
      if (result[0] && result[0].id !== numericId) {
        return Promise.reject("DUPLICATE_EMAIL");
      }
      validationErrors = Joi.object({
        email: Joi.string().email().max(255),
        firstname: Joi.string().max(255),
        lastname: Joi.string().max(255),
        city: Joi.string().max(255),
        language: Joi.string().max(255),
      }).validate(
        { firstname, lastname, email, city, language },
        { abortEarly: false }
      ).error;
      if (validationErrors) return Promise.reject("INVALID_DATA");
      return db.query("UPDATE users SET ? WHERE id = ?", [req.body, userId]);
    })
    .then(() => {
      res.status(200).json({ ...existingUser, ...req.body });
    })
    .catch((err) => {
      console.error(err);
      if (err === "DUPLICATE_EMAIL")
        res.status(409).send("Email already in use by other user");
      else if (err === "INVALID_DATA")
        res.status(422).json({ validationErrors });
      else if (err === "RECORD_NOT_FOUND")
        res.status(404).send(`User with id ${userId} not found.`);
      else res.status(500).send("Error updating a user");
    });
});

app.delete("/api/users/:id", (req, res) => {
  connection.query(
    "DELETE FROM users WHERE id = ?",
    [req.params.id],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error deleting an user");
      } else {
        if (result.affectedRows) res.status(200).send("🎉 User deleted!");
        else res.status(404).send("User not found.");
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
