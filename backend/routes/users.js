const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser,
} = require('../controllers/userController');
const router = express.Router();

// Get user profile (User only)
router.get('/profile', authenticate, authorize(['user', 'admin']), getUserProfile);

// Update user profile (User only)
router.patch('/profile', authenticate, authorize(['user', 'admin']), updateUserProfile);

// Get all users (Admin only)
router.get('/', authenticate, authorize(['admin']), getAllUsers);

// Delete a user (Admin only)
router.delete('/:id', authenticate, authorize(['admin']), deleteUser);

module.exports = router;
