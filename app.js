require("dotenv").config();

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const favicon = require("serve-favicon");
const hbs = require("hbs");
const mongoose = require("mongoose");
const logger = require("morgan");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const passport = require("passport"); // For passport
const LocalStrategy = require("passport-local").Strategy; // For passport
const User = require("./models/User");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");

mongoose
  .connect("mongodb://localhost/notes-express-signup-login", {
    useNewUrlParser: true,
    useCreateIndex: true
  })
  .then(x => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
  })
  .catch(err => {
    console.error("Error connecting to mongo", err);
  });

const app_name = require("./package.json").name;
const debug = require("debug")(
  `${app_name}:${path.basename(__filename).split(".")[0]}`
);

const app = express();

// Middleware to enable sessions: defines a `req.session`
app.use(
  session({
    secret: "basic-auth-secret",
    cookie: { maxAge: 60000 }, // The cookie lives 60000ms = 1 minute
    store: new MongoStore({
      mongooseConnection: mongoose.connection, // Store the session in the databse
      ttl: 24 * 60 * 60 // 1 day
    }),
    resave: false,
    saveUninitialized: true
  })
);

// Middleware Setup
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express View engine setup

app.use(
  require("node-sass-middleware")({
    src: path.join(__dirname, "public"),
    dest: path.join(__dirname, "public"),
    sourceMap: true
  })
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public", "images", "favicon.ico")));

// --- Passport configuration ---
passport.serializeUser((user, cb) => {
  console.log("serializeUser", user);
  cb(null, user._id);
});
passport.deserializeUser((id, cb) => {
  console.log("deserializeUser", id);
  User.findById(id, (err, user) => {
    if (err) {
      return cb(err);
    }
    cb(null, user);
  });
});
app.use(flash()); // Tool to use flash errors
// Define a local strategy, that can be used to login with username and password
passport.use(
  // This is executed everytime we go to "POST /login" (because of the code inside auth.js)
  // username is the value of req.body.username (and the same with password)
  // done is a function with 3 parameters: error, user, options 
  new LocalStrategy((username, password, done) => {
    console.log("LocalStrategy", username, password);
    User.findOne({ username: username })
      .then(user => {
        // done(null, false, {...}) => There is no error, no user, and defines a req.flash("error") to "Incorrect username"
        if (!user) return done(null, false, { message: "Incorrect username" });
        if (!bcrypt.compareSync(password, user.password))
          return done(null, false, { message: "Incorrect password" });
        // done(null, false,user) => There is no error and we can login `user`
        return done(null, user);
      })
      .catch(err => done(err));
  })
);
app.use(passport.initialize());
app.use(passport.session());

// default value for title local
app.locals.title = "Express - Generated with IronGenerator";

app.use("/", require("./routes/index"));
app.use("/", require("./routes/auth"));

module.exports = app;
