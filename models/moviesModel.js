const connection = require("../db-config");
const db = connection.promise();

connection.connect((err) => {
  if (err) {
    console.error("error connecting: " + err.stack);
  } else {
    console.log("connected as id " + connection.threadId);
  }
});

const validateMovies = (body, required = true) => {
  let { title, director, year, color, duration } = body;
  let numericYear = parseInt(year);
  let errors = [];

  if (color === true) color = 1;
  else if (color === false) color = 0;

  if (required && !title)
    errors.push({ field: `title`, message: "This field is required" });
  else if (title && title.length >= 255)
    errors.push({
      field: `title`,
      message: "Should contain less than 255 alpha-numeric characters",
    });

  if (required && !director)
    errors.push({ field: `director`, message: "This field is required" });
  else if (director && director.length >= 255)
    errors.push({
      field: `director`,
      message: "Should contain less than 255 alpha-numeric characters",
    });
  if (required && !year)
    errors.push({ field: `year`, message: "This field is required" });
  else if (year && (isNaN(year) || numericYear <= 1887))
    errors.push({
      field: `year`,
      message:
        "This field needs to be a string with numeric value bigger than 1887",
    });
  if (required && !duration)
    errors.push({ field: `duration`, message: "This field is required" });
  else if (duration && (isNaN(duration) || duration <= 0))
    errors.push({
      field: `duration`,
      message:
        "This field needs to be a string with numeric value bigger than 0",
    });
  if ((required && !color) || color > 1)
    errors.push({
      field: "color",
      message: `Required with value of true or false or (1 or 0)`,
    });
  return errors;
};
/*const findMovies = async ({ filters: { color, max_duration } }, userId) => {
  let sql = "SELECT id, title, director, year, color, duration FROM movies ";
  const sqlFilter = [];

  if (color) {
    sql += "WHERE color = ? ";
    sqlFilter.push(color);
  }
  if (max_duration) {
    if (color) sql += "AND duration <= ? ";
    else sql += "WHERE duration <= ? ";
    sqlFilter.push(max_duration);
  }

  if (userId) {
    if (color || max_duration) sql += "AND user_id = ?;";
    else sql += " WHERE user_id = ?;";
    sqlFilter.push(userId);
  }

  try {
    const rawResults = await db.query(sql, sqlFilter);
    const [results] = rawResults;
    return results;
  } catch (error) {
    console.log(error);
    return error;
  }
};
*/

const findMovies = ({ filters: { color, max_duration } }, userId) => {
  let sql = "SELECT id, title, director, year, color, duration FROM movies ";
  const sqlFilter = [];

  if (color) {
    sql += "WHERE color = ? ";
    sqlFilter.push(color);
  }
  if (max_duration) {
    if (color) sql += "AND duration <= ? ";
    else sql += "WHERE duration <= ? ";
    sqlFilter.push(max_duration);
  }

  if (userId) {
    if (color || max_duration) sql += "AND user_id = ?;";
    else sql += "WHERE user_id = ?;";
    sqlFilter.push(userId);
  }
  return db.query(sql, sqlFilter).then(([results]) => results);
};

const findMovieById = async (movieId) => {
  try {
    const rawResults = await db.query(
      "SELECT title, director, year, color, duration FROM movies WHERE id = ?",
      [movieId]
    );
    const [results] = rawResults;
    return results;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const insertNewMovie = async (body, user_id) => {
  try {
    const rawResult = await db.query("INSERT INTO movies SET ?;", [
      body,
      user_id,
    ]);
    const [{ insertId }] = rawResult;
    return insertId;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const updateMovie = async (body, id) => {
  try {
    let [results] = await db.query("UPDATE movies SET ? WHERE id=?;", [
      body,
      id,
    ]);
    return results.changedRows;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const deleteMovieById = async (id) => {
  try {
    let [results] = await db.query("DELETE FROM movies WHERE id = ?", [id]);
    return results;
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = {
  findMovies,
  findMovieById,
  insertNewMovie,
  updateMovie,
  deleteMovieById,
  validateMovies,
};
