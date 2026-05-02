import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { fetchLoyaltyProfile, fetchTransactions } from '../features/loyalty/loyaltySlice';
import { useDispatch } from 'react-redux';
import { FaCoins, FaGift, FaChartLine, FaTrophy } from 'react-icons/fa';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { profile, transactions } = useSelector((state) => state.loyalty);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        dispatch(fetchLoyaltyProfile()),
        dispatch(fetchTransactions())
      ]);
      setLoading(false);
    };
    loadData();
  }, [dispatch]);

  const statsCards = [
    { title: 'Total Points', value: profile?.totalPoints || 0, icon: <FaCoins />, color: '#ffc107' },
    { title: 'Available Points', value: profile?.availablePoints || 0, icon: <FaGift />, color: '#28a745' },
    { title: 'Current Tier', value: profile?.currentTier || 'Bronze', icon: <FaTrophy />, color: '#6f42c1' },
    { title: 'Transactions', value: transactions?.length || 0, icon: <FaChartLine />, color: '#17a2b8' },
  ];

  const recentTransactions = transactions?.slice(0, 5) || [];

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <h1>Welcome back, {user?.name}!</h1>
      <p>Here's your loyalty summary</p>
      
      <div className="stats-grid">
        {statsCards.map((stat, index) => (
          <div key={index} className="stat-card" style={{ borderBottomColor: stat.color }}>
            <div className="stat-icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="recent-transactions">
        <h3>Recent Transactions</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Points</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map((tx, index) => (
              <tr key={index}>
                <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                <td><span className={`badge badge-${tx.type}`}>{tx.type}</span></td>
                <td className={tx.points > 0 ? 'positive' : 'negative'}>{tx.points}</td>
                <td>{tx.description}</td>
              </tr>
            ))}
            {recentTransactions.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>No transactions yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;