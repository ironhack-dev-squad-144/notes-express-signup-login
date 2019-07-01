const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// A user has 5 different fields
// - _id: Schema.Types.ObjectId (generated automatically)
// - username
// - password
// - createdAt: Date (generated automatically thanks to `timestamps: true`)
// - updatedAt: Date (generated automatically thanks to `timestamps: true`)
const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    password: String
  },
  {
    timestamps: true // optio
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;









