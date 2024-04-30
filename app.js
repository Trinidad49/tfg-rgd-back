const express = require("express");
const fs = require("fs");
const bcrypt = require("bcrypt");
var cors = require("cors");
const collection = require("./dbConfig");
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
  const existingEmail = await collection.findOne({ email: data.email });

  if (existingEmail) return res.status(400).json({ message: "Email already registered" });

  // Hash the password
  const hashedPassword = await bcrypt.hash(data.password, 10);
  data.password = hashedPassword; // Replace the original password with the hashed one
  const userdata = await collection.insertMany(data);
  res.status(200).json({ message: "User registered successfully" });
});

// Login endpoint
app.post("/login", async (req, res) => {
  const data = {
    email: req.body.email,
    password: req.body.password
}

  // Check if user exists in the database
  const user = await collection.findOne({ email: data.email });

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // Compare the provided password with the hashed password stored in the database
  const passwordMatch = await bcrypt.compare(data.password, user.password);

  if (!passwordMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // If authentication successful, return success message or token
  res.status(200).json({ message: "Login successful" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});