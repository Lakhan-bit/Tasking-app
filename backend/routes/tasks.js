const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getUserTasks,
} = require('../controllers/taskController');
const router = express.Router();

// Create a new task (User only)
router.post('/', authenticate, authorize(['user', 'admin']), createTask);

// Get tasks for a specific user (User only) or all tasks (Admin only)
router.get('/', authenticate, getTasks);

router.get('/:userId', authenticate, getUserTasks);

// Update a task by ID (User can update their tasks; Admin can update any task)
router.patch('/:id', authenticate, authorize(['user', 'admin']), updateTask);

// Delete a task by ID (Admin only)
router.delete('/:id', authenticate, authorize(['admin']), deleteTask);

module.exports = router;
