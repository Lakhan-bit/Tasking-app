import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import TaskManager from './TaskManager';
import AdminPanel from './AdminPanel';

const Dashboard = () => {
  const { auth } = useContext(AuthContext);

  if (!auth) {
    return <p>You are not logged in!</p>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      {auth?.role === 'admin' ? <AdminPanel /> : <TaskManager />}
    </div>
  );
};

export default Dashboard;
