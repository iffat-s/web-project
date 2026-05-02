import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactions } from '../features/loyalty/loyaltySlice';
import { 
  FaSearch, 
  FaDownload, 
  FaFilter, 
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaChartLine
} from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const TransactionHistory = () => {
  const dispatch = useDispatch();
  const { transactions, loading } = useSelector((state) => state.loyalty);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);

  const getFilteredTransactions = () => {
    let filtered = [...transactions];
    
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filter !== 'all') {
      filtered = filtered.filter(tx => tx.type === filter);
    }

    if (dateRange !== 'all') {
      const days = parseInt(dateRange);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      filtered = filtered.filter(tx => new Date(tx.createdAt) > cutoff);
    }
    
    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();
  
  const totalEarned = filteredTransactions
    .filter(t => t.type === 'earned')
    .reduce((sum, t) => sum + t.points, 0);
    
  const totalRedeemed = filteredTransactions
    .filter(t => t.type === 'redeemed')
    .reduce((sum, t) => sum + Math.abs(t.points), 0);

  // Chart data
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toLocaleDateString();
  }).reverse();

  const chartData = {
    labels: last7Days,
    datasets: [
      {
        label: 'Points Earned',
        data: last7Days.map(date => {
          return filteredTransactions
            .filter(t => t.type === 'earned' && new Date(t.createdAt).toLocaleDateString() === date)
            .reduce((sum, t) => sum + t.points, 0);
        }),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Points Redeemed',
        data: last7Days.map(date => {
          return filteredTransactions
            .filter(t => t.type === 'redeemed' && new Date(t.createdAt).toLocaleDateString() === date)
            .reduce((sum, t) => sum + Math.abs(t.points), 0);
        }),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#e2e8f0',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const exportToCSV = () => {
    const csvHeaders = ['Date', 'Type', 'Points', 'Description'];
    const csvRows = filteredTransactions.map(t => [
      new Date(t.createdAt).toLocaleDateString(),
      t.type,
      t.points,
      t.description
    ]);
    
    const csvContent = [csvHeaders, ...csvRows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading transaction history...</p>
      </div>
    );
  }

  return (
    <div className="transaction-container">
      <div className="transaction-header">
        <div>
          <h1>
            <FaChartLine className="header-icon" />
            Transaction History
          </h1>
          <p>Track all your points activity</p>
        </div>
        <button onClick={exportToCSV} className="export-btn-modern">
          <FaDownload />
          Export Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="transaction-stats">
        <div className="stat-card-earned">
          <div className="stat-icon-wrapper">
            <FaArrowUp />
          </div>
          <div>
            <h3>+{totalEarned.toLocaleString()}</h3>
            <p>Total Points Earned</p>
          </div>
        </div>
        <div className="stat-card-redeemed">
          <div className="stat-icon-wrapper">
            <FaArrowDown />
          </div>
          <div>
            <h3>{totalRedeemed.toLocaleString()}</h3>
            <p>Total Points Redeemed</p>
          </div>
        </div>
        <div className="stat-card-balance">
          <div className="stat-icon-wrapper">
            <FaCalendarAlt />
          </div>
          <div>
            <h3>{filteredTransactions.length}</h3>
            <p>Total Transactions</p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      {filteredTransactions.length > 0 && (
        <div className="chart-container">
          <h3>Points Activity (Last 7 Days)</h3>
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

      {/* Filters */}
      <div className="filters-container">
        <div className="search-box-modern">
          <FaSearch />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group-modern">
          <FaFilter />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="earned">Points Earned</option>
            <option value="redeemed">Points Redeemed</option>
          </select>
        </div>

        <div className="filter-group-modern">
          <FaCalendarAlt />
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="all">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="transactions-table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Points</th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx, index) => (
              <tr key={index} className="transaction-row">
                <td>
                  <div className="transaction-date">
                    <FaCalendarAlt />
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td>
                  <span className={`transaction-badge ${tx.type}`}>
                    {tx.type === 'earned' ? '✨ Earned' : '🎁 Redeemed'}
                  </span>
                </td>
                <td className={tx.points > 0 ? 'points-positive' : 'points-negative'}>
                  {tx.points > 0 ? `+${tx.points}` : tx.points}
                </td>
                <td>{tx.description || 'Transaction'}</td>
                <td>
                  <span className="status-badge completed">Completed</span>
                </td>
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-transactions">
                  <div className="empty-state-transaction">
                    <FaSearch size={40} />
                    <p>No transactions found</p>
                    <small>Try adjusting your filters</small>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;