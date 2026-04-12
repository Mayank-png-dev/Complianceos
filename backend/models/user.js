const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  firmName: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: String,
  plan: {
    type: String,
    default: "free",
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);