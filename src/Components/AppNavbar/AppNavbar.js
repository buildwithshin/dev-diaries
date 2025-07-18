import React, { useContext, useState, useEffect } from 'react';
import { Navbar, Nav, Container, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import UserContext from '../../context/UserContext';
import Login from '../../pages/Login/Login';
import Register from '../../pages/Register/Register'; // Import Register form
import './AppNavbar.css';

const AppNavbar = () => {
  const { user, logout } = useContext(UserContext); // Access user context
  const navigate = useNavigate();

  // State to handle modal visibility
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token'); // Clear token from localStorage
    navigate('/'); // Redirect to home page
  };

  // Handle page refresh by checking if the token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = parseJwt(token);
      // Optionally, you can add more logic to update your user state based on the token if necessary.
    }
  }, []);

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

  return (
    <Navbar expand="lg" bg="black" variant="dark" className="custom-navbar">
      <Container>
        <Navbar.Brand as={Link} to="/" className="custom-logo"></Navbar.Brand>
        <Navbar.Toggle aria-controls="custom-navbar-nav" />
        <Navbar.Collapse id="custom-navbar-nav">
          <Nav className="ms-auto custom-nav-links">
            <Nav.Link as={Link} to="/" className="custom-nav-link">Home</Nav.Link>

            {/* Conditional Rendering */}
            {user && user.email ? (
              // When user is logged in, show Home, Blogs, and Logout
              <>
                <Nav.Link as={Link} to="/posts" className="custom-nav-link">Blogs</Nav.Link>
                <Nav.Link onClick={handleLogout} className="custom-nav-link">Logout</Nav.Link>
              </>
            ) : (
              // When user is not logged in, show Login and Register
              <>
                <Nav.Link className="custom-nav-link" onClick={() => setShowLoginModal(true)}>
                  Login
                </Nav.Link>
                <Nav.Link className="custom-nav-link" onClick={() => setShowRegisterModal(true)}>
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>

      {/* Modal to show Login Form */}
      <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Sign In</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Login onClose={() => setShowLoginModal(false)} /> {/* Passing onClose to close the modal */}
        </Modal.Body>
      </Modal>

      {/* Modal to show Register Form */}
      <Modal show={showRegisterModal} onHide={() => setShowRegisterModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Register onClose={() => setShowRegisterModal(false)} /> {/* Passing onClose to close the modal */}
        </Modal.Body>
      </Modal>
    </Navbar>
  );
};

export default AppNavbar;
