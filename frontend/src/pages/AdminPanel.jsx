import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUsers, deleteUser } from '../features/auth/authSlice';
import { FaEdit, FaTrash, FaUsers, FaTags, FaChartBar } from 'react-icons/fa';

const AdminPanel = () => {
  const dispatch = useDispatch();
  const { users, token } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await dispatch(deleteUser(userId));
    }
  };

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>
      
      <div className="admin-tabs">
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
          <FaUsers /> User Management
        </button>
        <button className={activeTab === 'rewards' ? 'active' : ''} onClick={() => setActiveTab('rewards')}>
          <FaTags /> Reward Management
        </button>
        <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>
          <FaChartBar /> Analytics
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="users-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td><span className={`role-badge role-${user.role}`}>{user.role}</span></td>
                  <td>
                    <button className="action-btn edit-btn"><FaEdit /></button>
                    <button className="action-btn delete-btn" onClick={() => handleDeleteUser(user.id)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'rewards' && (
        <div className="rewards-management">
          <p>Reward management coming soon...</p>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="analytics">
          <p>Analytics dashboard coming soon...</p>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;