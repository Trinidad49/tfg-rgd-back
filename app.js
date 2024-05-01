const express = require("express");
const fs = require("fs");
const bcrypt = require("bcrypt");
var cors = require("cors");
const {usersCollection,surveysCollection} = require("./dbConfig");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3080;

// Middleware to parse JSON bodies
app.use(cors())
app.use(express.json());

// Register endpoint
app.post("/register", async (req, res) => {
  const data = {
    email: req.body.email,
    password: req.body.password
}

  //Check if entry exists in db
  const existingEmail = await usersCollection.findOne({ email: data.email });

  if (existingEmail) return res.status(400).json({ message: "Email already registered" });

  // Hash the password
  const hashedPassword = await bcrypt.hash(data.password, 10);
  data.password = hashedPassword; // Replace the original password with the hashed one
  const userdata = await usersCollection.insertMany(data);
  res.status(200).json({ message: "User registered successfully" });
});

// Login endpoint
app.post("/login", async (req, res) => {
  const data = {
    email: req.body.email,
    password: req.body.password
}

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
  res.status(200).json({ message: "Login successful", id:user._id });
});

app.get('/surveys', async (req, res) => {
  console.log("Get survey")
  try {
    const userID = req.headers.userid; // Assuming user ID is available in request object
    const surveys = await surveysCollection.find({ userID });
    res.json(surveys);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST a new survey for the user
app.post('/surveys', async (req, res) => {
  try { // Assuming user ID is available in request object

    const { userID,title, questions } = req.body;
    console.log(title,userID)
    console.log(req.body)

    // Create a new survey document
    const newSurvey = {
      userID,
      title,
      question: [questions],
      createdAt: new Date()
    };
    
    console.log(newSurvey)


    // Insert the new survey into the collection
    await surveysCollection.insertMany(newSurvey);

    res.status(201).json({ message: 'Survey created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});