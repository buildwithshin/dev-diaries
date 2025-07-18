import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../../context/UserContext';
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify components
import 'react-toastify/dist/ReactToastify.css'; // Import styles
import './Home.css';

const Home = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const handleButtonClick = () => {
    if (user) {
      // Redirect to blogs if user is logged in
      navigate('/blogs');
    } else {
      // Show a danger notification using Toastify
      toast.error('You need to login/register to view the blogs.', {
        position: "top-right",
        autoClose: 5000,  
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <div className="home">
      <div className="home-content">
        <h2 className="home-title">Dev Diaries</h2>
        <p className="home-subtitle">A Journey Through Code</p>
        <button className="home-unique-button" onClick={handleButtonClick}>
          See All Blogs
        </button>
      </div>
      <footer className="home-footer">
        <p>All rights reserved 2025 | For educational purposes only</p>
      </footer>
      
      {/* Toastify container for displaying toasts */}
      <ToastContainer />
    </div>
  );
};

export default Home;
