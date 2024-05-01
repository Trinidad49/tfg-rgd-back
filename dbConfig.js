const mongoose = require("mongoose");
const connect = mongoose.connect("mongodb://0.0.0.0:27017/TFG");

// Check database connected or not
connect
  .then(() => {
    console.log("Database Connected Successfully");
  })
  .catch(() => {
    console.log("Database cannot be Connected");
  });

// Create Schema
const Loginschema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const Surveyschema = new mongoose.Schema({
  userID: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true
  },
  questions: {
    type: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// collection part
const usersCollection = new mongoose.model("users", Loginschema);
const surveysCollection = new mongoose.model("surveys", Surveyschema);

module.exports = { usersCollection, surveysCollection };
