const express = require("express");
const { setupRoutes } = require("./routes");
const { usersController } = require("./controllers");
const app = express();

app.use(express.json());

setupRoutes(app);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
