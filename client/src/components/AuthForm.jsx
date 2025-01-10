import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './AuthForm.css';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isLogin
        ? 'http://localhost:5000/api/auth/login'
        : 'http://localhost:5000/api/auth/register';
      const { data } = await axios.post(url, formData);

      if (isLogin) {
        login(data.token, data.role); 
        console.log("is login..",isLogin);
        
        navigate('/dashboard');
      } else {
        alert('Registration successful. Please log in.');
        setIsLogin(true);
      }
    } catch (error) {
      console.error(error.response.data.message);
      alert(error.response.data.message);
    }
  };

  return (
    <div className="auth-form">
      <h2 className="auth-title">{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit} className="form">
        {!isLogin && (
          <input
            type="text"
            name="name"
            className="form-input"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
          />
        )}
        <input
          type="email"
          name="email"
          className="form-input"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          className="form-input"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />
        <button type="submit" className="btn submit-auth">
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>
      <button
        onClick={() => setIsLogin(!isLogin)}
        className="btn switch-auth"
      >
        {isLogin ? 'Switch to Register' : 'Switch to Login'}
      </button>
    </div>

  );
};

export default AuthForm;
