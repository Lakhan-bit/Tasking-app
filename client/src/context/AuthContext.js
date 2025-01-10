import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null); // Store token and role

  const login = (token, role) => {
    setAuth({ token, role });
    localStorage.setItem('auth', JSON.stringify({ token, role }));
  };

  const logout = () => {
    setAuth(null);
    localStorage.removeItem('auth');
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
