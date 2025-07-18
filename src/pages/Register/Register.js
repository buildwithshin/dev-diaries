import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import UserContext from '../../context/UserContext';
import Swal from 'sweetalert2';
import { Form, Button, Alert } from 'react-bootstrap';
import './Register.css'; // Add your CSS here

export default function Register({ onClose }) {
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const isValid =
      firstName.trim() !== '' &&
      lastName.trim() !== '' &&
      email.trim() !== '' &&
      password.trim() !== '' &&
      mobileNo.trim().length === 11 &&
      /^\d+$/.test(mobileNo);

    setIsActive(isValid);
  }, [firstName, lastName, email, password, mobileNo]);

  const checkEmailExists = (email) => {
    return fetch('https://dev-diaries-api.onrender.com/users/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
      .then((res) => res.json())
      .then((data) => data)
      .catch((err) => {
        console.error('Error checking email:', err);
        return false;
      });
  };

  const registerUser = (e) => {
    e.preventDefault();

    checkEmailExists(email).then((exists) => {
      if (exists) {
        Swal.fire({
          title: 'Error!',
          text: 'Email already registered. Please try a different one.',
          icon: 'error',
        });
        return;
      }

      fetch('https://dev-diaries-api.onrender.com/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          mobileNo,
          password,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.message === 'User registered successfully') {
            Swal.fire({
              title: 'Success!',
              text: 'Registration successful!',
              icon: 'success',
            }).then(() => {
              onClose(); // Close modal after success
              navigate('/');
            });
          } else {
            Swal.fire({
              title: 'Error!',
              text: data.message || 'Registration failed',
              icon: 'error',
            });
          }
        })
        .catch((err) => {
          Swal.fire({
            title: 'Error!',
            text: 'Server error. Please try again later.',
            icon: 'error',
          });
        });
    });
  };

  return (
    <div className="register-form">
      <Form onSubmit={registerUser}>

        <Form.Group className="mb-3">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Mobile Number</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter 11-digit mobile number"
            value={mobileNo}
            onChange={(e) => setMobileNo(e.target.value)}
            maxLength={11}
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Button type="submit" className="w-100" disabled={!isActive}>
          Register
        </Button>

        <div className="mt-3 text-center">
        </div>
      </Form>
    </div>
  );
}
