import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './TaskManager.css';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [taskForm, setTaskForm] = useState({ title: '', description: '', status:'' });
  const [editingTask, setEditingTask] = useState(null);
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const token = localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')).token : null;
  // console.log('token..',token);
  
  const fetchTasks = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(data);
      console.log("tasks...",data);
      
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Fetch profile
  const fetchProfile = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(data);
      console.log('profile...',data);
      
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Update profile
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(
        'http://localhost:5000/api/users/profile',
        profile,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEditingProfile(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
    console.log('data to send..',profile);
    
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setTaskForm({ title: '', description: '', status:'' });
    setEditingTask(null);
  };

  const handleInputChange = (e) => {
    setTaskForm({ ...taskForm, [e.target.name]: e.target.value });
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await axios.patch(
          `http://localhost:5000/api/tasks/${editingTask._id}`,
          { ...taskForm, date: selectedDate },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          'http://localhost:5000/api/tasks',
          { ...taskForm, date: selectedDate },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      fetchTasks();
      setTaskForm({ title: '', description: '', status:'' });
      setEditingTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleEdit = (task) => {
    setTaskForm({ title: task?.title, description: task?.description, status:task?.status });
    setEditingTask(task);
    console.log('fakeee',task);
    
  };

  // const handleDelete = async (taskId) => {
  //   try {
  //     await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     fetchTasks();
  //   } catch (error) {
  //     console.error('Error deleting task:', error);
  //   }
  //   console.log("id..",taskId);
    
  // };

  useEffect(() => {
    fetchTasks();
    fetchProfile();
  }, []);

  const tasksForSelectedDate = tasks?.filter(
    (task) => new Date(task?.date).toDateString() === selectedDate.toDateString()
  );

  return (
    <div className="task-manager">
      <h2 className="task-title">Your Tasks</h2>
      <Calendar onClickDay={handleDateClick} value={selectedDate} />
      <h3 className="task-date">Tasks for {selectedDate?.toDateString()}</h3>
      {tasksForSelectedDate?.map((task) => (
        <div key={task?._id} className="task-item">
          <h4 className="task-name">{task?.title}</h4>
          <p className="task-desc">{task?.description}</p>
          <button onClick={() => handleEdit(task)} className="btn edit-task">
            Edit
          </button>
        </div>
      ))}
      <form onSubmit={handleSubmit} className="task-form">
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
          {editingTask ? 'Update Task' : 'Add Task'}
        </button>
      </form>

      <hr className="divider" />

      <h2 className="profile-title">Your Profile</h2>
      {isEditingProfile ? (
        <form onSubmit={handleProfileUpdate} className="profile-form">
          <input
            type="text"
            name="name"
            className="form-input"
            placeholder="Name"
            value={profile.name}
            onChange={handleProfileChange}
          />
          <input
            type="email"
            name="email"
            className="form-input"
            placeholder="Email"
            value={profile.email}
            onChange={handleProfileChange}
          />
          <input
            type="text"
            name="password"
            className="form-input"
            placeholder="New Password"
            onChange={handleProfileChange}
          />
          <button type="submit" className="btn save-profile">
            Save
          </button>
          <button
            type="button"
            onClick={() => setIsEditingProfile(false)}
            className="btn cancel-edit"
          >
            Cancel
          </button>
        </form>
      ) : (
        <div className="profile-info">
          <p className="profile-name">Name: {profile?.name}</p>
          <p className="profile-email">Email: {profile?.email}</p>
          <button
            onClick={() => setIsEditingProfile(true)}
            className="btn edit-profile"
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>

  );
};

export default TaskManager;
