import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AppNavbar from './Components/AppNavbar/AppNavbar';
import Blogs from './pages/Blogs/Blogs';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import AdminView from './Components/AdminView/AdminView';
import Home from './pages/Home/Home';
import UserContext from './context/UserContext';
import { UserProvider } from './context/UserContext';

function App() {
  const { user, login } = useContext(UserContext);

  // Check if there's a token and set user context on page load (if not already set)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = parseJwt(token);
      login({ email: decoded.email, isAdmin: decoded.isAdmin === true });
    }
  }, [login]);

  // Helper function to parse JWT token
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join(''));
      return JSON.parse(jsonPayload);
    } catch (err) {
      return {};
    }
  };

  // Protected Route for Admin
  const ProtectedRoute = ({ children }) => {
    if (user?.isAdmin) {
      return children;
    } else {
      return <Navigate to="/blogs" />; // Redirect to blogs if not an admin
    }
  };

  return (
    <>
      <UserProvider>
        <AppNavbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/posts" element={<Blogs />} />
          <Route path="/" element={<Home />} />

          {/* Protected Admin Route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminView />
              </ProtectedRoute>
            }
          />

          {/* Optional: 404 fallback route */}
          <Route path="*" element={<Navigate to="/blogs" />} />
        </Routes>
      </UserProvider>
    </>
  );
}

export default App;
