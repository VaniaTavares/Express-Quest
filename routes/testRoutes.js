const express = require("express");
const testRouter = express.Router();
const { testController } = require("../controllers");
const { testHelper } = require("../helpers");

testRouter.get("/", testController.getAllTests);

testRouter.post("/register", testController.newTest);

testRouter.post("/login", testController.testLogin);

testRouter.get("/profile", testHelper.validateToken, (req, res) => {
  const username = req.username;
  res.json({ Welcome: username });
});

module.exports = testRouter;
