import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { auth, setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth from state and localStorage
    setAuth(null);
    localStorage.removeItem('auth');
    navigate('/login');
  };

  return (
    <nav style={styles.navbar}>
      <h2 style={styles.brand}>Task Manager</h2>
      <div style={styles.navLinks}>
        {auth ? (
          <>
            <Link to="/dashboard" style={styles.link}>
              Dashboard
            </Link>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>
              Login
            </Link>
            <Link to="/register" style={styles.link}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: '#282c34',
    color: '#fff',
  },
  brand: {
    margin: 0,
  },
  navLinks: {
    display: 'flex',
    gap: '15px',
  },
  link: {
    textDecoration: 'none',
    color: '#61dafb',
  },
  logoutButton: {
    backgroundColor: '#61dafb',
    border: 'none',
    padding: '5px 10px',
    color: '#282c34',
    cursor: 'pointer',
  },
};

export default Navbar;
