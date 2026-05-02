import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  FaGift, 
  FaCalendarAlt, 
  FaTrophy, 
  FaStar, 
  FaRegSmile,
  FaShoppingBag,
  FaTicketAlt,
  FaCoffee,
  FaGem,
  FaArrowRight
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const MyRewards = () => {
  const { token } = useSelector((state) => state.auth);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchMyRewards = async () => {
      try {
        const response = await axios.get(`${API_URL}/redemptions/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRedemptions(response.data);
      } catch (error) {
        console.error('Error fetching rewards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyRewards();
  }, [token]);

  const getRewardIcon = (category) => {
    const icons = {
      'discount': <FaTicketAlt />,
      'product': <FaShoppingBag />,
      'voucher': <FaCoffee />,
      'premium': <FaGem />,
      default: <FaGift />
    };
    return icons[category] || icons.default;
  };

  const getRandomGradient = (index) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    ];
    return gradients[index % gradients.length];
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your rewards...</p>
      </div>
    );
  }

  return (
    <div className="my-rewards-container">
      {/* Header Section */}
      <div className="rewards-header">
        <div>
          <h1>
            <FaTrophy className="header-icon" />
            My Rewards Collection
          </h1>
          <p>Track and manage your redeemed rewards</p>
        </div>
        <div className="rewards-stats">
          <div className="stat-badge">
            <FaStar />
            <span>{redemptions.length} Rewards</span>
          </div>
        </div>
      </div>

      {redemptions.length === 0 ? (
        /* Empty State - Beautiful Design */
        <div className="empty-rewards-state">
          <div className="empty-state-animation">
            <div className="floating-gifts">
              <FaGift className="gift-1" />
              <FaGift className="gift-2" />
              <FaGift className="gift-3" />
            </div>
            <div className="empty-state-content">
              <FaRegSmile className="sad-icon" />
              <h2>No Rewards Yet!</h2>
              <p>Start earning points and redeem exciting rewards!</p>
              <div className="empty-state-features">
                <div className="feature">
                  <FaStar />
                  <span>Earn points from purchases</span>
                </div>
                <div className="feature">
                  <FaGift />
                  <span>Redeem amazing rewards</span>
                </div>
                <div className="feature">
                  <FaTrophy />
                  <span>Unlock exclusive tiers</span>
                </div>
              </div>
              <button 
                onClick={() => navigate('/rewards')} 
                className="browse-rewards-btn"
              >
                Browse Rewards
                <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Rewards Grid */
        <div className="rewards-grid-modern">
          {redemptions.map((redemption, index) => (
            <div 
              key={redemption.id} 
              className="reward-card-modern"
              style={{ background: getRandomGradient(index) }}
            >
              <div className="reward-card-inner">
                <div className="reward-card-front">
                  <div className="reward-icon-large">
                    {getRewardIcon(redemption.reward?.category)}
                  </div>
                  <h3>{redemption.reward?.name || 'Reward'}</h3>
                  <div className="reward-points-badge">
                    {redemption.pointsSpent} points
                  </div>
                </div>
                <div className="reward-card-back">
                  <div className="reward-code">
                    <span className="code-label">Redeemed on</span>
                    <div className="code-value">
                      <FaCalendarAlt />
                      {new Date(redemption.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="reward-status">
                    <span className="status-active">✓ Active</span>
                  </div>
                  <div className="reward-description">
                    {redemption.reward?.description || 'Enjoy your reward!'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips Section */}
      {redemptions.length > 0 && (
        <div className="rewards-tips">
          <h3>
            <FaStar className="tips-icon" />
            Pro Tips
          </h3>
          <div className="tips-grid">
            <div className="tip-card">
              <span>💡</span>
              <p>Share your rewards with friends and family!</p>
            </div>
            <div className="tip-card">
              <span>🎁</span>
              <p>Check back weekly for new exclusive rewards</p>
            </div>
            <div className="tip-card">
              <span>⚡</span>
              <p>Redeem points before they expire</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRewards;