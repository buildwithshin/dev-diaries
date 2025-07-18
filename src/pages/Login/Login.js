import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../../context/UserContext';
import Swal from 'sweetalert2';
import { Form, Button, Alert } from 'react-bootstrap';
import './Login.css';

export default function Login({ onClose }) {
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('https://dev-diaries-api.onrender.com/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Login failed');

      const token = data.access;
      localStorage.setItem('token', token);

      const decoded = parseJwt(token);

      login({
        email: decoded.email || formData.email,
        isAdmin: decoded.isAdmin === true
      });

      Swal.fire({
        title: 'Success!',
        text: 'Logged in!',
        icon: 'success',
      }).then(() => {
        if (decoded.isAdmin) {
          navigate('/posts'); // Navigate to admin dashboard if admin
        } else {
          navigate('/posts');
        }
      });

      onClose(); // Close modal after successful login
    } catch (err) {
      setError(err.message);
      Swal.fire({
        title: 'Error!',
        text: err.message,
        icon: 'error',
      });
    }
  };

  return (
    <div>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="form-input-unique"
          />
        </Form.Group>
        <Form.Group className="mb-4">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="form-input-unique"
          />
        </Form.Group>
        <Button type="submit" className="submit-btn-unique">
          Sign In
        </Button>
      </Form>
    </div>
  );
}
