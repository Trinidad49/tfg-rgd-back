const express = require("express");
const fs = require("fs");
const bcrypt = require("bcrypt");
var cors = require("cors");
const { usersCollection, surveysCollection, mongoose, answersCollection } = require("./dbConfig");
const jwt = require("jsonwebtoken");
const { Console } = require("console");

const app = express();
const PORT = 3080;

// Middleware to parse JSON bodies
app.use(cors());
app.use(express.json());

// Register
app.post("/register", async (req, res) => {
  console.log("Creating account")
  const data = {
    email: req.body.email,
    password: req.body.password,
  };

  //Check if entry exists in db
  const existingEmail = await usersCollection.findOne({ email: data.email });

  if (existingEmail)
    return res.status(400).json({ message: "Email already registered" });

  // Hash the password
  const hashedPassword = await bcrypt.hash(data.password, 10);
  data.password = hashedPassword; // Replace the original password with the hashed one
  const userdata = await usersCollection.insertMany(data);
  res.status(200).json({ message: "User registered successfully" });
});

// Login
app.post("/login", async (req, res) => {
  console.log("Loggin in")
  const data = {
    email: req.body.email,
    password: req.body.password,
  };

  // Check if user exists in the database
  const user = await usersCollection.findOne({ email: data.email });

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // Compare the provided password with the hashed password stored in the database
  const passwordMatch = await bcrypt.compare(data.password, user.password);

  if (!passwordMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // If authentication successful, return success message or token
  res.status(200).json({ message: "Login successful", id: user._id });
});

app.get("/survey", async (req, res) => {
  console.log("Get survey");
  try {
    const _id = new mongoose.Types.ObjectId(req.headers.surveyid);
    const survey = await surveysCollection.find({ _id });
    res.json(survey);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/surveys", async (req, res) => {
  console.log("Get user surveys");
  try {
    const userID = req.headers.userid;
    const surveys = await surveysCollection.find({ userID });
    res.json(surveys);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST a new survey for the user
app.post("/surveys", async (req, res) => {
  try {
    const { userID, title, questions, _id } = req.body;

    const formattedQuestions = [];

    // Iterate over the received questions array and format each question
    questions.forEach((question) => {
      const formattedAnswers = question.answers.map((answer) => ({
        text: answer,
      }));
      const formattedQuestion = {
        text: question.text,
        type: question.type,
        answers: formattedAnswers,
        mandatory: question.mandatory,
      };
      formattedQuestions.push(formattedQuestion);
    });

    // Insert or update the survey into the collection
    if (_id) {
      await surveysCollection.updateOne(
        { _id: _id },
        {
          $set: {
            title: title,
            questions: formattedQuestions,
          },
        }
      );
      console.log("Survey updated");
      res.status(200).json({ message: "Survey updated successfully" });
    } else {
      // Create a new survey document
      const newSurvey = {
        userID,
        title,
        questions: formattedQuestions,
        createdAt: new Date(),
      };
      const response = await surveysCollection.insertMany(newSurvey);
      console.log("Survey created");
      res
        .status(201)
        .json({ _id: response[0]._id, message: "Survey created successfully" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

//Delete a survey
app.delete("/surveys", async (req, res) => {
  console.log("Delete survey")
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({ message: "Survey ID is required" });
    }

    // Delete the survey from the collection
    const result = await surveysCollection.deleteOne({ _id: _id });

    if (result.deletedCount === 1) {
      console.log("Survey deleted");
      return res.status(200).json({ message: "Survey deleted successfully" });
    } else {
      return res.status(404).json({ message: "Survey not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.post('/answer', async (req, res) => {
  console.log("Saving answer")
  try {
    const { surveyID, questions } = req.body;


    const newAnswer = {
      surveyID,
      answers:questions,
    };

    const response = await answersCollection.insertMany(newAnswer)

    res.status(201).json(response);
  } catch (error) {
    console.error('Error saving answers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get("/answers", async (req, res) => {
  console.log("Get answers for survey");
  try {
    const surveyID = req.headers.surveyid;
    const answers = await answersCollection.find({ surveyID });
    res.json(answers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
