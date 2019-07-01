// routes/auth.js

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt"); // NEW
const bcryptSalt = 10; // NEW

// To display the signup form
router.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

// To handle the signup form submission
router.post("/signup", (req, res, next) => {
  let { username, password } = req.body;
  const salt = bcrypt.genSaltSync(bcryptSalt);
  const hashPass = bcrypt.hashSync(password, salt);

  if (username === "" || password === "") {
    res.render("auth/signup", { errorMessage: "Please enter a username and a password" });
    return // To stop the function
  }

  User.findOne({ username: username }).then(user => {
    // If we found a user, it means the username is already taken
    if (user) {
      res.render("auth/signup", { errorMessage: "The username is already taken" });
    } else {
      User.create({
        username,
        password: hashPass
      })
        .then(() => {
          res.redirect("/");
        })
        .catch(error => {
          next(error);
        });
    }
  });
});

module.exports = router;
