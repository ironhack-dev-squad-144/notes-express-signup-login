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
  let { username, password, confirmPassword } = req.body;
  const salt = bcrypt.genSaltSync(bcryptSalt);
  const hashPass = bcrypt.hashSync(password, salt);

  if (username === "" || password === "") {
    res.render("auth/signup", {
      errorMessage: "Please enter a username and a password"
    });
    return; // To stop the function
  }

  // Check if the user typed the same password twice
  if (password !== confirmPassword) {
    res.render("auth/signup", {
      errorMessage: "You've entered 2 different passwords"
    });
    return; // To stop the function
  }

  // Check if the password is strong enough:
  // - Lenght >= 7 
  // - Has to contain a digit
  // - Has to contain a uppercase letter
  if (password.length < 7 || !password.match(/[0-9]/) || !password.match(/[A-Z]/)) {
    res.render("auth/signup", {
      errorMessage: "The password has to be at least 7 characters with some digits and uppercase letters"
    });
    return; // To stop the function
  }

  User.findOne({ username: username }).then(user => {
    // If we found a user, it means the username is already taken
    if (user) {
      res.render("auth/signup", {
        errorMessage: "The username is already taken"
      });
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

router.get("/login", (req, res, next) => {
  res.render("auth/login");
});

router.post("/login", (req, res, next) => {
  const theUsername = req.body.username;
  const thePassword = req.body.password;

  if (theUsername === "" || thePassword === "") {
    res.render("auth/login", {
      errorMessage: "Please enter both, username and password to sign up."
    });
    return;
  }

  User.findOne({ username: theUsername })
    .then(user => {
      if (!user) {
        res.render("auth/login", {
          errorMessage: "The username doesn't exist."
        });
        return;
      }
      if (bcrypt.compareSync(thePassword, user.password)) {
        // Save the login in the session!
        req.session.currentUser = user;
        res.redirect("/");
      } else {
        res.render("auth/login", {
          errorMessage: "Incorrect password"
        });
      }
    })
    .catch(error => {
      next(error);
    });
});

router.get("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    // can't access session here
    res.redirect("/login");
  });
});

// To go to the profile page, we have to be connected, otherwise we are redirected to "/login"
router.get("/profile", (req, res, next) => {
  if (req.session.currentUser) {
    console.log("TCL:", req.session.currentUser);
    res.render("profile", { user: req.session.currentUser });
  } else {
    res.redirect("/login");
  }
});

module.exports = router;
