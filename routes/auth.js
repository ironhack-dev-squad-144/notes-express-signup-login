// routes/auth.js

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const passport = require("passport");
const ensureLogin = require("connect-ensure-login");
// Shortcut for:
// const checkLogin = require("../middlewares").checkLogin;
const { checkLogin } = require("../middlewares");

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
  if (
    password.length < 7 ||
    !password.match(/[0-9]/) ||
    !password.match(/[A-Z]/)
  ) {
    res.render("auth/signup", {
      errorMessage:
        "The password has to be at least 7 characters with some digits and uppercase letters"
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
  // Example on how to use `req.flash`. It can be used on different requests!!
  // req.flash("carrot", "orange")
  // console.log("A", req.flash("carrot")) // => [ 'orange' ]
  // console.log("B", req.flash("carrot")) // => []
  res.render("auth/login", {
    errorMessage: req.flash("error")
  });
});

// // The route without Passport
// router.post("/login", (req, res, next) => {
//   const theUsername = req.body.username;
//   const thePassword = req.body.password;

//   if (theUsername === "" || thePassword === "") {
//     res.render("auth/login", {
//       errorMessage: "Please enter both, username and password to sign up."
//     });
//     return;
//   }

//   User.findOne({ username: theUsername })
//     .then(user => {
//       if (!user) {
//         res.render("auth/login", {
//           errorMessage: "The username doesn't exist."
//         });
//         return;
//       }
//       if (bcrypt.compareSync(thePassword, user.password)) {
//         // Save the login in the session!
//         req.session.currentUser = user;
//         res.redirect("/");
//       } else {
//         res.render("auth/login", {
//           errorMessage: "Incorrect password"
//         });
//       }
//     })
//     .catch(error => {
//       next(error);
//     });
// });

// Login route with Passport: use the local strategy and redirect to "/" in case of success
router.post(
  "/login",
  // Execute the LocalStrategy in app.js
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
    passReqToCallback: true
  })
);

router.get("/logout", (req, res, next) => {
  req.session.destroy(err => {
    // can't access session here
    res.redirect("/login");
  });
});

// ---- Profile page ----
// To go to the profile page, we have to be connected, otherwise we are redirected to "/login"

// // Solution 1
// router.get("/profile", (req, res, next) => {
//   // With Passport, information about the connected user is saved inside `req.user` (and not `req.session.currentUser`)
//   if (req.user) {
//     console.log("TCL:", req.user);
//     res.render("profile", { user: req.user });
//   } else {
//     res.redirect("/login");
//   }
// });

// // Solution 2: protect the route with a middleware from a package
// // ensureLogin.ensureLoggedIn("/login") => middleware that redirects the user to "/login" when not connected
// router.get(
//   "/profile",
//   ensureLogin.ensureLoggedIn("/login"),
//   (req, res, next) => {
//     res.render("profile", { user: req.user });
//   }
// );

// Solution 3: protect the route with a custom middlleware
router.get("/profile", checkLogin, (req, res, next) => {
  res.render("profile", { user: req.user });
});


router.get("/auth/slack", passport.authenticate("slack"));
router.get("/auth/slack/callback", passport.authenticate("slack", {
  successRedirect: "/profile",
  failureRedirect: "/"
}));


module.exports = router;
