<<<<<<< HEAD
const { usersModel } = require("./models");

usersModel.hashPassword("myPlainPassword").then((hashedPassword) => {
  console.log(hashedPassword);
});

usersModel
  .verifyPassword(
    "myPlainPassword2",
    "$argon2id$v=19$m=65536,t=5,p=1$6F4WFjpSx9bSq9k4lp2fiQ$cjVgCHF/voka5bZI9YAainiaT+LkaQxfNN638b/h4fQ"
  )
  .then((passwordIsCorrect) => {
    console.log(passwordIsCorrect);
  });

const test =
  "$argon2id$v=19$m=65536,t=5,p=1$iHJqWtlHUuz/bEcAXKAG9A$jZiIRseSQ91KfhpcyK9PNJR62GtFOuDpOMh814OW5B4";
console.log(test.length);
=======
const User = require('./models/user');

/*
User.hashPassword('myPlainPassword').then((hashedPassword) => {
  console.log(hashedPassword);
});
*/

User.verifyPassword(
  'myPlainPassword',
  '$argon2id$v=19$m=65536,t=5,p=1$6F4WFjpSx9bSq9k4lp2fiQ$cjVgCHF/voka5bZI9YAainiaT+LkaQxfNN638b/h4fQ'
).then((passwordIsCorrect) => {
  console.log(passwordIsCorrect);
});
>>>>>>> 5f3044e19e1fbde5670c8108bc991f6ab74c49e3
