const Task = require('../models/Task');

// Create a new task
const createTask = async (req, res) => {
  try {
    const { title, description, status, date } = req.body;

    const task = new Task({
      userId: req.user.id,
      title,
      description,
      status,
      date,
    });

    await task.save();
    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get tasks
const getTasks = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const tasks = await Task.find().populate('userId', 'name email');
      return res.status(200).json(tasks);
    }

    const tasks = await Task.find({ userId: req.user.id });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Fetch tasks for a specific user (admin functionality)
const getUserTasks = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch tasks based on the userId
    const tasks = await Task.find({ userId: userId });

    if (!tasks.length) {
      return res.status(404).json({ message: 'No tasks found for this user' });
    }

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, date } = req.body;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Allow only the owner or admin to update the task
    if (task.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access Denied' });
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.date = date || task.date;

    await task.save();
    res.status(200).json({ message: 'Task updated successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask, getUserTasks };
