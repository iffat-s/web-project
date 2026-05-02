import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

const Unauthorized = () => {
  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <FaExclamationTriangle size={60} color="#ef4444" />
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        <Link to="/dashboard" className="back-btn">Go Back to Dashboard</Link>
      </div>
    </div>
  );
};

export default Unauthorized;