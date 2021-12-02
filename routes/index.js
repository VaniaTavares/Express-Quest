const moviesRouter = require("./moviesRoutes");
const usersRouter = require("./usersRoutes");

const setupRoutes = (app) => {
  app.use("/api/movies", moviesRouter);
  app.use("/api/users", usersRouter);
};

module.exports = { setupRoutes };
