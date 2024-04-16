const express = require("express");
const fs = require("fs");
const bcrypt = require("bcrypt");
var cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3080;

const usersFilePath = "./users.json";

// Middleware to parse JSON bodies
app.use(cors())
app.use(express.json());

// Register endpoint
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  // Read existing users from the file
  const usersData = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));

  // Check if email is already taken
  const userExists = usersData.find((user) => user.email === email);
  if (userExists) {
    return res.status(400).json({ message: "Email already registered" });
  }

  // Hash the password
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }

    // Save new user data
    const newUser = { email, password: hash };
    usersData.push(newUser);
    fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));

    res.status(200).json({ message: "User registered successfully" });
  });
});

// Login endpoint
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  console.log("Login Attempt: ", email,password)

  // Read existing users from the file
  const usersData = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));

  // Find user by email
  const user = usersData.find((user) => user.email === email);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Compare passwords
  bcrypt.compare(password, user.password, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (!result) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ email: user.email }, "secret", { expiresIn: "1h" });
    res.status(200).json({ message: "Login successful", token });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});