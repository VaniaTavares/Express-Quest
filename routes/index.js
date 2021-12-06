const moviesRouter = require("./moviesRoutes");
const usersRouter = require("./usersRoutes");
const authRouter = require("./authorizationRoutes");

const setupRoutes = (app) => {
  app.use("/api/movies", moviesRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/auth", authRouter);
};

module.exports = { setupRoutes };
