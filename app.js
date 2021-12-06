<<<<<<< HEAD
const express = require("express");
const { setupRoutes } = require("./routes");
const { usersController } = require("./controllers");
const app = express();

app.use(express.json());

setupRoutes(app);

const port = process.env.PORT || 3000;
=======
const { setupRoutes } = require('./routes');
const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());

setupRoutes(app);
>>>>>>> 5f3044e19e1fbde5670c8108bc991f6ab74c49e3

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
