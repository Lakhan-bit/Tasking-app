const User = require('../models/User');
const Task = require('../models/Task');
const bcrypt = require('bcryptjs');
const db = require('../config/firestoreDB');
const admin = require('firebase-admin');

const tasksCollection = db.collection('tasks');
const usersCollection = db.collection('users');

// Get user profile
// const getUserProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select('-password');
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     res.status(200).json(user);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

const getUserProfile = async (req, res) => {
  try {
    const userDoc = await usersCollection.doc(req.user.id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userDoc.data();
    delete user.password; // Exclude the password field
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
// const updateUserProfile = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     const user = await User.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     if (name) user.name = name;
//     if (email) user.email = email;
//     if (password) {
//       const salt = await bcrypt.genSalt(10);
//       user.password = await bcrypt.hash(password, salt);
//     }

//     await user.save();
//     res.status(200).json({ message: 'Profile updated successfully', user });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

const updateUserProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userRef = usersCollection.doc(req.user.id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedData = {};
    if (name) updatedData.name = name;
    if (email) updatedData.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatedData.password = await bcrypt.hash(password, salt);
    }

    await userRef.update(updatedData);
    const updatedUser = (await userRef.get()).data();
    delete updatedUser.password; // Exclude the password field

    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all users (Admin only)
// const getAllUsers = async (req, res) => {
//   try {
//     const users = await User.find().select('-password');
//     res.status(200).json(users);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

const getAllUsers = async (req, res) => {
  try {
    const usersSnapshot = await usersCollection.get();
    const users = usersSnapshot.docs.map(doc => {
      const user = doc.data();
      delete user.password; // Exclude the password field
      return { id: doc.id, ...user };
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a user (Admin only)
// const deleteUser = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const user = await User.findByIdAndDelete(id);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }


//     // Remove their tasks
//     await Task.deleteMany({ userId: id });

//     res.status(200).json({ message: 'User deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const userRef = usersCollection.doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete the user
    await userRef.delete();

    // Delete their tasks
    const tasksSnapshot = await tasksCollection.where('userId', '==', id).get();
    const batch = db.batch();
    tasksSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    res.status(200).json({ message: 'User and their tasks deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getUserProfile, updateUserProfile, getAllUsers, deleteUser };
