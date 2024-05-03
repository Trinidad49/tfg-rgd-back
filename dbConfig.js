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

const answerSchema = new mongoose.Schema({
    text: String,
  });

const questionSchema = new mongoose.Schema({
    text: String,
    type: {
      type: String,
      enum: ['text', 'multipleChoice', 'checkbox']
    },
    answers: [answerSchema],
    mandatory: Boolean
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
    type: [questionSchema],
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Answerschema = new mongoose.Schema({
  surveyID: {
    type: String,
    required: true
  },
  answers: [{
    text: {
      type: String,
      required: true
    },
    answer: {
      type: String
    }
  }]
});

// collection part
const usersCollection = new mongoose.model("users", Loginschema);
const surveysCollection = new mongoose.model("surveys", Surveyschema);
const answersCollection = new mongoose.model("answers", Answerschema)

module.exports = { usersCollection, surveysCollection, answersCollection, mongoose};
