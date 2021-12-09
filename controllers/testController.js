const { testModel } = require("../models");
const { testHelper } = require("../helpers");

const getAllTests = async (req, res) => {
  try {
    const tests = await getTestUsers;
    if (!tests.length) throw new Error("NO_RECORD_FOUND");
  } catch (err) {
    if ("NO_RECORD_FOUND") res.status(404).send("No info found");
    else res.status(500).send("Internal Issues");
  }
};

const newTest = async (req, res) => {
  let validationErrors, user;
  try {
    validationErrors = testModel.validateTest(req.body);

    if (validationErrors) res.status(422).json({ validationErrors });
    else {
      user = await testModel.getTestByEmail(req.body.email);
      if (user) res.status(409).send("There's an user with that email.");
      else {
        let result = await testModel.createTest(req.body);
        res.status(201).json(result);
      }
    }
  } catch (err) {
    res.status(500).send("Internal Issues!");
  }
};

const testLogin = async (req, res) => {
  let user;
  try {
    const { email, password } = req.body;
    user = await testModel.getTestByEmail(email);
    if (!user) res.status(400).send("User doesn't exist!");
    else {
      const matched = await testModel.verifyPassword(password, user);
      if (!matched) res.status(401).send("Invalid credentials");
      else {
        const accessToken = testHelper.createTokens(user);
        res.cookie("accessToken", accessToken, {
          maxAge: 1296000000,
          httpOnly: true,
        });
        res.status(200).json("login");
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Issues");
  }
};

module.exports = {
  getAllTests,
  newTest,
  testLogin,
};
