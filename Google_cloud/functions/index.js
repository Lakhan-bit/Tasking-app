/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */



// The Firebase Admin SDK to access Firestore.
const functions = require('firebase-functions');
const admin = require('firebase-admin'); 
const jwt = require('jsonwebtoken');
admin.initializeApp();
const db = admin.firestore();

const authenticate = (token) => {
  
  

  try {
    const decoded = jwt.verify(token, 'reymi_lakhan');
    const user = decoded; 
    return user;
  } catch (error) {
    return {success:false, message: 'Invalid token.' };
  }
};


exports.RegisterUsers = functions.https.onRequest(async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if the user already exists
    const usersCollection = db.collection('users');
    const userSnapshot = await usersCollection.where('email', '==', email).get();
    if (!userSnapshot.empty) {
      return res.status(400).json({success:false, message: 'User already exists' });
    }


    // Create a new user
    const newUser = {
      name,
      email,
      password: password,
      role: role || 'user',
    };
    await usersCollection.add(newUser);

    res.status(201).json({ success:true, message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({success:false, message: 'Server error', error: error.message });
  }
});

exports.loginUser = functions.https.onRequest(async(req,res)=>{
  try {
    const { email, password } = req.body;

    // Find the user by email
    const usersCollection = db.collection('users');
    const userSnapshot = await usersCollection.where('email', '==', email).get();
    if (userSnapshot.empty) {
      return res.status(404).json({succes:true, message: 'User not found' });
    }

    const user = userSnapshot.docs[0].data();
    const userId = userSnapshot.docs[0].id;
    const userPass = user?.password;
    console.log('userId...',userId);
    // console.log('userSnapshot',userSnapshot);
    // console.log('usersCollection',usersCollection);
    // Check the password
    if(password !== userPass){
      return res.status(401).json({succes:false, message: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: userId, role: user.role },
      'reymi_lakhan',
      { expiresIn: '1h' }
    );

    res.status(200).json({succes:'login success',token, role: user.role });
  } catch (error) {
    res.status(500).json({succes:false, message: 'Server error', error: error.message });
  }
});

exports.getUserProfile = functions.https.onRequest(async(req,res)=>{
  try {
    const token = req.headers.authorization?.split(' ')[1]; 
    if (!token) {
      return {success:false, message: 'Access Denied. No token provided.' };
    }
    const responseUser = authenticate(token);
    const usersCollection = db.collection('users');
    const userDoc = await usersCollection.doc(responseUser?.id).get();
    if (!userDoc.exists) {
      return res.status(404).json({success:false, message: 'User not found' });
    }

    const user = userDoc.data();
    delete user.password; // Exclude the password field
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({success:false, message: 'Server error', error: error.message });
  }
})

exports.updateUserProfile = functions.https.onRequest(async(req,res)=>{
  try {

    const { name, email, password } = req.body;
    const token = req.headers.authorization?.split(' ')[1]; 
    if (!token) {
      return {success:false, message: 'Access Denied. No token provided.' };
    }
    const responseUser = authenticate(token);
    const usersCollection = db.collection('users');
    const userRef = usersCollection.doc(responseUser?.id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({success:false, message: 'User not found' });
    }

    const updatedData = {};
    if (name) updatedData.name = name;
    if (email) updatedData.email = email;
    if (password) updatedData.password = password;

    await userRef.update(updatedData);
    const updatedUser = (await userRef.get()).data();
    delete updatedUser.password; // Exclude the password field

    res.status(200).json({success:true, message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

exports.getAllUsers = functions.https.onRequest(async(req,res)=>{
  try {
    const token = req.headers.authorization?.split(' ')[1]; 
    if (!token) {
      return {success:false, message: 'Access Denied. No token provided.' };
    }
    const responseUser = authenticate(token);
    const usersCollection = db.collection('users');
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
});

exports.deleteUser = functions.https.onRequest(async(req,res)=>{
  try {
    const id = req.query.uid;
    const token = req.headers.authorization?.split(' ')[1]; 
    if (!token) {
      return {success:false, message: 'Access Denied. No token provided.' };
    }
    const responseUser = authenticate(token);
    const usersCollection = db.collection('users');
    const tasksCollection = db.collection('tasks');

    const userRef = usersCollection.doc(id);
    const userDoc = await userRef.get();

    console.log('id..',id)

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
});

exports.createTask = functions.https.onRequest(async(req,res)=>{
  try {
    const { title, description, status, date } = req.body;
    const token = req.headers.authorization?.split(' ')[1]; 
    if (!token) {
      return {success:false, message: 'Access Denied. No token provided.' };
    }
    const responseUser = authenticate(token);
    const tasksCollection = db.collection('tasks');

    const newTask = {
      userId: responseUser?.id,
      title,
      description,
      status,
      date: date ,
    };

    const taskRef = await tasksCollection.add(newTask);
    res.status(201).json({ message: 'Task created successfully', taskId: taskRef.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

exports.getTasks = functions.https.onRequest(async(req,res)=>{
  try {
    let tasksSnapshot;
    const token = req.headers.authorization?.split(' ')[1]; 
    if (!token) {
      return {success:false, message: 'Access Denied. No token provided.' };
    }
    const responseUser = authenticate(token);
    const tasksCollection = db.collection('tasks');

    if (responseUser?.role === 'admin') {
      tasksSnapshot = await tasksCollection.get();
    } else {
      tasksSnapshot = await tasksCollection.where('userId', '==', responseUser?.id).get();
    }

    const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

exports.getUserTasks = functions.https.onRequest(async(req,res)=>{
  try {
    const userId = req.query.uid;
    const token = req.headers.authorization?.split(' ')[1]; 
    if (!token) {
      return {success:false, message: 'Access Denied. No token provided.' };
    }
    const responseUser = authenticate(token);
    const tasksCollection = db.collection('tasks');

    const tasksSnapshot = await tasksCollection.where('userId', '==', userId).get();

    if (tasksSnapshot.empty) {
      return res.status(404).json({ message: 'No tasks found for this user' });
    }

    const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

exports.updateTask = functions.https.onRequest(async(req,res)=>{
  try {
    const { title, description, status, date } = req.body;

    const id = req.query.uid;
    const token = req.headers.authorization?.split(' ')[1]; 
    if (!token) {
      return {success:false, message: 'Access Denied. No token provided.' };
    }
    const responseUser = authenticate(token);
    const tasksCollection = db.collection('tasks');

    const taskRef = tasksCollection.doc(id);
    const taskSnapshot = await taskRef.get();

    if (!taskSnapshot.exists) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const task = taskSnapshot.data();

    // Allow only the owner or admin to update the task
    if (task.userId !== responseUser?.id && responseUser?.role !== 'admin') {
      return res.status(403).json({ message: 'Access Denied' });
    }

    await taskRef.update({
      title: title || task.title,
      description: description || task.description,
      status: status || task.status,
      date: date || task.date,
    });

    res.status(200).json({ message: 'Task updated successfully',user:responseUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

exports.deleteTask = functions.https.onRequest(async(req,res)=>{
  try {
    const id = req.query.uid;
    const token = req.headers.authorization?.split(' ')[1]; 
    if (!token) {
      return {success:false, message: 'Access Denied. No token provided.' };
    }
    const responseUser = authenticate(token);
    const tasksCollection = db.collection('tasks');

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
})
