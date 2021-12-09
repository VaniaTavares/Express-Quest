const moviesRouter = require("./moviesRoutes");
const usersRouter = require("./usersRoutes");
const authRouter = require("./authorizationRoutes");
const testRouter = require("./testRoutes");

const setupRoutes = (app) => {
  app.use("/api/movies", moviesRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/tests", testRouter);
};

module.exports = { setupRoutes };
