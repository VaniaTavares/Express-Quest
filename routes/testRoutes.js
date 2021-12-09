const express = require("express");
const testRouter = express.Router();
const { testController } = require("../controllers");

testRouter.get("/", testController.getAllTests);

testRouter.post("/register", testController.newTest);

testRouter.post("/login", testController.testLogin);

testRouter.get("/profile", (req, res) => {
  res.json("profile");
});

module.exports = testRouter;
