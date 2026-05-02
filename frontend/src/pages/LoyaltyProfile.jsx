import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLoyaltyProfile } from '../features/loyalty/loyaltySlice';
import { 
  FaTrophy, 
  FaStar, 
  FaCoins, 
  FaGift, 
  FaChartLine,
  FaRocket,
  FaMedal,
  FaGem,
  FaAward,
  FaArrowUp,
  FaCalendarAlt
} from 'react-icons/fa';

const LoyaltyProfile = () => {
  const dispatch = useDispatch();
  const { profile, loading } = useSelector((state) => state.loyalty);

  useEffect(() => {
    dispatch(fetchLoyaltyProfile());
  }, [dispatch]);

  const getTierDetails = (tier) => {
    const tiers = {
      'Bronze': {
        icon: '🥉',
        color: '#cd7f32',
        bgColor: '#fdf4e6',
        nextTier: 'Silver',
        pointsNeeded: 1000,
        benefits: ['1x points on all purchases', 'Birthday bonus points', 'Welcome gift']
      },
      'Silver': {
        icon: '🥈',
        color: '#c0c0c0',
        bgColor: '#f0f0f0',
        nextTier: 'Gold',
        pointsNeeded: 5000,
        benefits: ['1.5x points on all purchases', 'Birthday bonus points', 'Early access to sales', 'Monthly exclusive offers']
      },
      'Gold': {
        icon: '🥇',
        color: '#ffd700',
        bgColor: '#fff9e6',
        nextTier: 'Platinum',
        pointsNeeded: 10000,
        benefits: ['2x points on all purchases', 'Birthday bonus + gift', 'Priority support', 'Free shipping', 'Exclusive events']
      },
      'Platinum': {
        icon: '💎',
        color: '#e5e4e2',
        bgColor: '#f5f5f5',
        nextTier: 'Diamond',
        pointsNeeded: 20000,
        benefits: ['3x points on all purchases', 'Luxury birthday gift', 'VIP concierge', 'Free express shipping', 'Personal manager', 'Invite-only events']
      }
    };
    return tiers[tier] || tiers['Bronze'];
  };

  const currentTier = profile?.currentTier || 'Bronze';
  const tierDetails = getTierDetails(currentTier);
  const totalPoints = profile?.totalPoints || 0;
  const availablePoints = profile?.availablePoints || 0;
  const pointsToNext = Math.max(0, tierDetails.pointsNeeded - totalPoints);
  const progressPercent = Math.min((totalPoints / tierDetails.pointsNeeded) * 100, 100);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your loyalty profile...</p>
      </div>
    );
  }

  return (
    <div className="loyalty-container">
      <div className="loyalty-header">
        <h1>
          <FaTrophy className="header-icon" />
          My Loyalty Profile
        </h1>
        <p>Track your rewards journey</p>
      </div>

      {/* Tier Card */}
      <div className="tier-card" style={{ background: `linear-gradient(135deg, ${tierDetails.bgColor}, white)` }}>
        <div className="tier-badge-large">
          <span className="tier-icon-large">{tierDetails.icon}</span>
          <div className="tier-info">
            <span className="tier-label">Current Tier</span>
            <h2 className="tier-name" style={{ color: tierDetails.color }}>{currentTier}</h2>
          </div>
        </div>
        
        <div className="points-stats">
          <div className="stat-item">
            <FaCoins className="stat-icon-blue" />
            <div>
              <h3>{totalPoints.toLocaleString()}</h3>
              <p>Total Points Earned</p>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <FaGift className="stat-icon-green" />
            <div>
              <h3>{availablePoints.toLocaleString()}</h3>
              <p>Available Points</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress to Next Tier */}
      {currentTier !== 'Platinum' && (
        <div className="progress-card">
          <div className="progress-header">
            <FaRocket className="progress-icon" />
            <div>
              <h3>Journey to {tierDetails.nextTier} Tier</h3>
              <p>{pointsToNext.toLocaleString()} points away</p>
            </div>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}>
              <span className="progress-percent">{Math.round(progressPercent)}%</span>
            </div>
          </div>
          <div className="progress-tiers">
            <span className={currentTier === 'Bronze' ? 'active-tier' : ''}>🥉 Bronze</span>
            <span className="progress-line"></span>
            <span className={currentTier === 'Silver' ? 'active-tier' : ''}>🥈 Silver</span>
            <span className="progress-line"></span>
            <span className={currentTier === 'Gold' ? 'active-tier' : ''}>🥇 Gold</span>
            <span className="progress-line"></span>
            <span className={currentTier === 'Platinum' ? 'active-tier' : ''}>💎 Platinum</span>
          </div>
        </div>
      )}

      {/* Benefits Section */}
      <div className="benefits-card">
        <h3>
          <FaStar className="benefits-icon" />
          {currentTier} Tier Benefits
        </h3>
        <div className="benefits-grid">
          {tierDetails.benefits.map((benefit, index) => (
            <div key={index} className="benefit-item">
              <FaAward className="benefit-check" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Rewards */}
      <div className="next-rewards-card">
        <h3>
          <FaMedal className="rewards-icon" />
          Next Milestone Rewards
        </h3>
        <div className="milestones">
          <div className={`milestone ${totalPoints >= 500 ? 'completed' : ''}`}>
            <div className="milestone-icon">🎁</div>
            <div className="milestone-info">
              <strong>500 Points</strong>
              <span>Exclusive Discount Coupon</span>
            </div>
            {totalPoints >= 500 && <FaAward className="completed-badge" />}
          </div>
          <div className={`milestone ${totalPoints >= 1000 ? 'completed' : ''}`}>
            <div className="milestone-icon">🎉</div>
            <div className="milestone-info">
              <strong>1000 Points</strong>
              <span>Free Product + Silver Tier</span>
            </div>
            {totalPoints >= 1000 && <FaAward className="completed-badge" />}
          </div>
          <div className={`milestone ${totalPoints >= 5000 ? 'completed' : ''}`}>
            <div className="milestone-icon">👑</div>
            <div className="milestone-info">
              <strong>5000 Points</strong>
              <span>Gold Tier + VIP Access</span>
            </div>
            {totalPoints >= 5000 && <FaAward className="completed-badge" />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyProfile;