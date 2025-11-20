import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/UserCard.css';
import user_logo from '../assets/profile-user.png';
import 'bootstrap-icons/font/bootstrap-icons.css'; 

function UserCard() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId') || 'Not logged in';

  const handleInsightsClick = () => {
    navigate('/insights'); 
  };

  return (
    <div className="user_card">
      <img src={user_logo} className="user_logo" alt="User Logo" />
      <div className="user-id-container">
        <p className="user-id">User ID: {userId}</p>
      </div>

      <div className="insights-button-container">
        <button className="insights-button" onClick={handleInsightsClick}>
          <i className="bi bi-lightbulb-fill"></i> Insights
        </button>
      </div>
    </div>
  );
}

export default UserCard;