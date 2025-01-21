const Task = require('../models/Task');
const db = require('../config/firestoreDB');
const admin = require('firebase-admin');

const tasksCollection = db.collection('tasks');

// Create a new task
// const createTask = async (req, res) => {
//   try {
//     const { title, description, status, date } = req.body;

//     const task = new Task({
//       userId: req.user.id,
//       title,
//       description,
//       status,
//       date,
//     });

//     await task.save();
//     res.status(201).json({ message: 'Task created successfully', task });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

const createTask = async (req, res) => {
  try {
    const { title, description, status, date } = req.body;

    const newTask = {
      userId: req.user.id,
      title,
      description,
      status,
      date: date || admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const taskRef = await tasksCollection.add(newTask);
    res.status(201).json({ message: 'Task created successfully', taskId: taskRef.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Get tasks
// const getTasks = async (req, res) => {
//   try {
//     if (req.user.role === 'admin') {
//       const tasks = await Task.find().populate('userId', 'name email');
//       return res.status(200).json(tasks);
//     }

//     const tasks = await Task.find({ userId: req.user.id });
//     res.status(200).json(tasks);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

const getTasks = async (req, res) => {
  try {
    let tasksSnapshot;

    if (req.user.role === 'admin') {
      tasksSnapshot = await tasksCollection.get();
    } else {
      tasksSnapshot = await tasksCollection.where('userId', '==', req.user.id).get();
    }

    const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Fetch tasks for a specific user (admin functionality)
// const getUserTasks = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     // Fetch tasks based on the userId
//     const tasks = await Task.find({ userId: userId });

//     if (!tasks.length) {
//       return res.status(404).json({ message: 'No tasks found for this user' });
//     }

//     res.status(200).json(tasks);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

const getUserTasks = async (req, res) => {
  try {
    const { userId } = req.params;

    const tasksSnapshot = await tasksCollection.where('userId', '==', userId).get();

    if (tasksSnapshot.empty) {
      return res.status(404).json({ message: 'No tasks found for this user' });
    }

    const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a task
// const updateTask = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, description, status, date } = req.body;

//     const task = await Task.findById(id);

//     if (!task) {
//       return res.status(404).json({ message: 'Task not found' });
//     }

//     // Allow only the owner or admin to update the task
//     if (task.userId.toString() !== req.user.id && req.user.role !== 'admin') {
//       return res.status(403).json({ message: 'Access Denied' });
//     }

//     task.title = title || task.title;
//     task.description = description || task.description;
//     task.status = status || task.status;
//     task.date = date || task.date;

//     await task.save();
//     res.status(200).json({ message: 'Task updated successfully', task });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, date } = req.body;

    const taskRef = tasksCollection.doc(id);
    const taskSnapshot = await taskRef.get();

    if (!taskSnapshot.exists) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const task = taskSnapshot.data();

    // Allow only the owner or admin to update the task
    if (task.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access Denied' });
    }

    await taskRef.update({
      title: title || task.title,
      description: description || task.description,
      status: status || task.status,
      date: date || task.date,
    });

    res.status(200).json({ message: 'Task updated successfully',user:req.user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a task
// const deleteTask = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const task = await Task.findByIdAndDelete(id);
//     if (!task) {
//       return res.status(404).json({ message: 'Task not found' });
//     }

//     res.status(200).json({ message: 'Task deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const taskRef = tasksCollection.doc(id);
    const taskSnapshot = await taskRef.get();

    if (!taskSnapshot.exists) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await taskRef.delete();
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask, getUserTasks };
