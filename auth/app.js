// Importing required modules
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoSanitize = require('express-mongo-sanitize');
const cors = require('cors');
const cookieParser = require('cookie-parser');


// Creating an Express application instance
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173' ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


const PORT = 3000;

// Connect to MongoDB database
mongoose.connect('mongodb+srv://dbuser:changeme@time-machine.12gus0l.mongodb.net/?retryWrites=true&w=majority&appName=time-machine')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Define a schema for the User collection
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  tickers: [String]
});

// Create a User model based on the schema
const User = mongoose.model('User', userSchema);

// Middleware for JWT validation
const verifyToken = (req, res, next) => {
  // const header = req.headers['authorization'];
  // if (!header) {
  //   return res.status(401).json({ error: 'Unauthorized' });
  // }

  // const parts = header.split(' ');
  // if (parts.length !== 2 || !/^Bearer$/i.test(parts[0])) {
  //   console.log('verifyToken: malformed Authorization header:', authHeader);
  //   return res.status(401).json({ error: 'Unauthorized' });
  // }
  // const token = parts[1];
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, 'secret', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = decoded;
    next();
  });
};




// Route to register a new user
app.post('/api/register', async (req, res) => {
  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create a new user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      tickers: ["AAPL", "MSFT"]
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to authenticate and log in a user
app.post('/api/login', async (req, res) => {
  try {
    // Check if the email exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // Compare passwords
    const passwordMatch = await bcrypt.compare(req.body.password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ email: user.email }, 'secret');
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
  res.status(204).end();
});


// Protected route to get user details
app.get('/api/user', verifyToken, async (req, res) => {
  try {
    // Fetch user details using decoded token
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ username: user.username, email: user.email, tickers: user.tickers });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected route to add ticker from user schema
app.post('/api/addticker', verifyToken, async (req, res) => {
  try {
    // Check if the user exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (!existingUser) {
      return res.status(400).json({ error: 'Email does not exist' });
    }

    // Add ticker if it doesn't already exist in the list of tickers
    if (existingUser.tickers.indexOf(req.body.ticker) === -1) {
      existingUser.tickers.push(req.body.ticker);
    }

    // Update document with new info
    await existingUser.save();
    res.status(201).json({ message: 'Ticker added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected route to remove ticker from user schema
app.delete('/api/removeticker', verifyToken, async (req, res) => {
  try {
    // Check if the user exists
    const email = req.user.email;
    const ticker = req.body.ticker;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ error: 'Email does not exist' });
    }

    // Remove ticker if it exists in tickers list
    const index = existingUser.tickers.indexOf(ticker);
    if (index === -1) {
      return res.status(400).json({ error: 'Ticker not in your list' });
    }
    existingUser.tickers.splice(index, 1);

    // Update document with new info
    await existingUser.save();
    res.status(201).json({ message: 'Ticker removed successfully' });
  } catch (error) {
    console.log(err)
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the Time Machine User Authentication API!');
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});