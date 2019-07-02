const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// A user has 6 different fields
// - _id: Schema.Types.ObjectId (generated automatically)
// - username
// - slackID
// - profilePicture
// - password
// - createdAt: Date (generated automatically thanks to `timestamps: true`)
// - updatedAt: Date (generated automatically thanks to `timestamps: true`)
const userSchema = new Schema(
  {
    username: { type: String },
    slackID: String,
    profilePicture: String,
    password: String
  },
  {
    timestamps: true // option
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;









