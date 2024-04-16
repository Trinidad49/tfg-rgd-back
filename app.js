const express = require("express");
const fs = require("fs");
const bcrypt = require("bcrypt");
var cors = require("cors");
const jwt = require("jsonwebtoken");

//For conection with db
const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "tfg",
  password: "admin",
  port: 5432,
});


const app = express();
const PORT = 3080;

// Middleware to parse JSON bodies
app.use(cors())
app.use(express.json());

// Register endpoint
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  //Check if entry exists in db
  const result = (await pool.query("SELECT * FROM users WHERE email = $1", [email]));

  if (result.rows.length > 0) return res.status(400).json({ message: "Email already registered" });

  // Hash the password
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
    // Save new user data
    pool.query('INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *', [email, hash], (error, result) => {
      if (error) {
        console.error('Error executing query', error);
        return;
      }
      res.status(200).json({ message: "User registered successfully" });
    });
  });
});

// Login endpoint
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("Login Attempt: ", email,password)

  // Find user by email
  try {
    const result = (await pool.query("SELECT * FROM users WHERE email = $1", [email])).rows[0];
    // Compare passwords
    bcrypt.compare(password, result.password, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Internal Server Error" });
      }
      if (!result) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      // Generate JWT token
      const token = jwt.sign({ email: email }, "secret", { expiresIn: "1h" });
      res.status(200).json({ message: "Login successful", token });
    })

  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }

});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});