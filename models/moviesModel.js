const connection = require("../db-config");
const db = connection.promise();

connection.connect((err) => {
  if (err) {
    console.error("error connecting: " + err.stack);
  } else {
    console.log("connected as id " + connection.threadId);
  }
});

const findMovies = async ({ filters: { color, max_duration } }, userId) => {
  let sql = "SELECT id, title, director, year, color, duration FROM movies";
  const sqlFilter = [];

  if (color) {
    sql += " WHERE color = ?;";
    sqlFilter.push(color);
  }
  if (max_duration) {
    if (color) sql += " AND duration <= ?;";
    else sql += " WHERE duration <= ?;";
    sqlFilter.push(max_duration);
  }

  if (userId) {
    if (color || max_duration) sql += " AND user_id = ?;";
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

const insertNewMovie = async (body) => {
  try {
    const rawResult = await db.query("INSERT INTO movies SET ?;", body);
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
};
