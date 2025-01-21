const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/firestoreDB');
const admin = require('firebase-admin');

// const db = admin.firestore();
const usersCollection = db.collection('users');


// Register a new user
// const registerUser = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     // Check if the user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     // Create a new user
//     const newUser = new User({
//       name,
//       email,
//       password,
//       role: role || 'user', // Default role is 'user' if not provided
//     });
//     await newUser.save();

//     res.status(201).json({ message: 'User registered successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if the user already exists
    const userSnapshot = await usersCollection.where('email', '==', email).get();
    if (!userSnapshot.empty) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = {
      name,
      email,
      password: hashedPassword,
      role: role || 'user', // Default role is 'user' if not provided
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await usersCollection.add(newUser);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user
// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Find the user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Check the password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     // Generate a JWT token
//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     res.status(200).json({ token, role: user.role });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const userSnapshot = await usersCollection.where('email', '==', email).get();
    if (userSnapshot.empty) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userSnapshot.docs[0].data();
    const userId = userSnapshot.docs[0].id;

    // Check the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: userId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { registerUser, loginUser };
