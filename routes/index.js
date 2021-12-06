<<<<<<< HEAD
const moviesRouter = require("./moviesRoutes");
const usersRouter = require("./usersRoutes");
const authRouter = require("./authorizationRoutes");

const setupRoutes = (app) => {
  app.use("/api/movies", moviesRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/auth", authRouter);
};

module.exports = { setupRoutes };
=======
const moviesRouter = require('./movies');
const usersRouter = require('./users');
const authRouter = require('./auth');

const setupRoutes = (app) => {
  app.use('/api/movies', moviesRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/auth', authRouter);
};

module.exports = {
  setupRoutes,
};
>>>>>>> 5f3044e19e1fbde5670c8108bc991f6ab74c49e3
