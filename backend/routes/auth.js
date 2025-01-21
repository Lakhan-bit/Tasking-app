const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const firecheck = require('../config/firestoreDB');
const router = express.Router();

// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);

// router.post('/checkfirestore',firecheck);

module.exports = router;
