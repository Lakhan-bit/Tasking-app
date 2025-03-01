import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './AdminPanel.css';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [noTasks,setNoTasks] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', status:'' });
  const [editingTask, setEditingTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [usersToDelete,setUsersToDelete] = useState({});

  const token = localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')).token : null;
  // console.log("token...",token);
  
  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('http://127.0.0.1:5001/tasking-app-937a3/us-central1/getAllUsers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(data);
      console.log("users..",data)
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTasks = async (userId) => {
    try {
      const { data } = await axios.get(`http://127.0.0.1:5001/tasking-app-937a3/us-central1/getUserTasks?uid=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(data);
      setSelectedUser(userId);
      setNoTasks(false)
      
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setNoTasks(true);
      setTasks(null);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`http://127.0.0.1:5001/tasking-app-937a3/us-central1/deleteTask?uid=${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks(selectedUser);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const checkboxHandler = (e) => {
    const { name, checked } = e.target;
  
    setUsersToDelete((prev) => {
      if (checked) {
        return { ...prev, [name]: name };
      } else {
        const updatedUsers = { ...prev };
        delete updatedUsers[name];
        return updatedUsers;
      }
    });
  };

  const handleInputChange = (e) => {
    setTaskForm({ ...taskForm, [e.target.name]: e.target.value });
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setTaskForm({ title: '', description: '', status:'' });
  };

  const handleEdit = (task) => {
    setTaskForm({ title: task?.title, description: task?.description, status:task?.status });
    setEditingTask(task);
    console.log('fakeee',task);
    
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await axios.patch(
          `http://127.0.0.1:5001/tasking-app-937a3/us-central1/updateTask?uid=${editingTask.id}`,
          { ...taskForm, date: selectedDate },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        console.log("editing task is null");
        
      }
      fetchTasks(selectedUser);
      setTaskForm({ title: '', description: '', status:'' });
      setEditingTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const deleteHandler = async(userId)=>{
    // console.log("usersToDelete", usersToDelete);
    
    // console.log("usersToDelete", usersArray);
    try {
      await axios.delete(`http://127.0.0.1:5001/tasking-app-937a3/us-central1/deleteUser?uid=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsersToDelete((prev) => {
        const updatedUsers = { ...prev };
        delete updatedUsers[userId];
        return updatedUsers;
      });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  const deleteUsers = async () => {
    const usersArray = Object.keys(usersToDelete);
    console.log('usersToDelete',usersToDelete)
    if (usersArray.length === 0) {
      console.log("Users not selected");
      return;
    }
  
    try {
      await Promise.all(usersArray.map(user => deleteHandler(user)));
      console.log("Users deleted");
    } catch (error) {
      console.error("Error deleting users:", error);
    }
  };
  

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="admin-panel">
      <h2 className="admin-title">Admin Panel</h2>
      <h3 className="admin-section-title">Users</h3>
      <button onClick={deleteUsers}>Delete</button>
      {users?.map((user) => (
        <div key={user?.id} className="user-item">
          <p className="user-info">
            {user?.name} ({user?.email})
          </p>
          <button onClick={() => fetchTasks(user?.id)} className="btn view-tasks">
            View Tasks
          </button>
          <input type="checkbox" onClick={checkboxHandler} name={user?.id}/>
        </div>
      ))}
      <h3 className="admin-section-title">Tasks</h3>
      {tasks?.map((task) => (
        <div key={task.id} className="task-item">
          <h4 className="task-title">{task?.title}</h4>
          <p className="task-desc">{task?.description}</p>
          <button onClick={() => handleEdit(task)} className="btn edit-task">
            Edit
          </button>
          <button
            onClick={() => handleDeleteTask(task?.id)}
            className="btn delete-task"
          >
            Delete Task
          </button>
        </div>
      ))}
      {noTasks && <div className="no-tasks">No tasks</div>}
      {editingTask && (
        <div className="edit-task-form">
          <Calendar onClickDay={handleDateClick} value={selectedDate} />
          <h3 className="edit-task-date">
            Tasks for {selectedDate?.toDateString()}
          </h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="Task Title"
              value={taskForm.title}
              onChange={handleInputChange}
            />
            <textarea
              name="description"
              className="form-textarea"
              placeholder="Task Description"
              value={taskForm.description}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="status"
              className="form-input"
              placeholder="Task Status"
              value={taskForm.status}
              onChange={handleInputChange}
            />
            <button type="submit" className="btn submit-task">
              Update Task
            </button>
          </form>
        </div>
      )}
    </div>

  );
};

export default AdminPanel;
