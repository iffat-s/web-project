import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRewards, redeemReward } from '../features/rewards/rewardsSlice';
import { fetchLoyaltyProfile } from '../features/loyalty/loyaltySlice';
import { 
  FaSearch, 
  FaFilter, 
  FaSort, 
  FaExchangeAlt, 
  FaStar,
  FaFire,
  FaArrowRight,
  FaGift
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const RewardsCatalog = () => {
  const dispatch = useDispatch();
  const { items: rewards, loading } = useSelector((state) => state.rewards);
  const { profile } = useSelector((state) => state.loyalty);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('points');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    dispatch(fetchRewards());
    dispatch(fetchLoyaltyProfile());
  }, [dispatch]);

  const handleRedeem = (rewardId, pointsCost) => {
    if (profile?.availablePoints < pointsCost) {
      toast.error('Insufficient points! 💔');
      return;
    }
    dispatch(redeemReward(rewardId));
  };

  const getFilteredAndSortedRewards = () => {
    let filtered = [...rewards];

    if (searchTerm) {
      filtered = filtered.filter(reward =>
        reward.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reward.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (category) {
      filtered = filtered.filter(reward => reward.category === category);
    }

    if (sortBy === 'points') {
      filtered.sort((a, b) => (a.pointsCost || 0) - (b.pointsCost || 0));
    } else if (sortBy === 'points-desc') {
      filtered.sort((a, b) => (b.pointsCost || 0) - (a.pointsCost || 0));
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'popular') {
      // Simulate popular sort
      filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }

    return filtered;
  };

  const filteredRewards = getFilteredAndSortedRewards();
  const totalPages = Math.ceil(filteredRewards.length / itemsPerPage);
  const currentRewards = filteredRewards.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const categories = ['All', 'Discount', 'Product', 'Voucher', 'Premium'];
  
  // Featured rewards (first 3)
  const featuredRewards = rewards.slice(0, 3);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading amazing rewards...</p>
      </div>
    );
  }

  return (
    <div className="rewards-catalog-modern">
      {/* Hero Section */}
      <div className="rewards-hero">
        <div className="hero-content">
          <h1>
            <FaGift className="hero-icon" />
            Rewards Gallery
          </h1>
          <p>Redeem your points for exciting rewards</p>
          <div className="points-hero">
            <FaExchangeAlt />
            <span>{profile?.availablePoints || 0} Points Available</span>
          </div>
        </div>
      </div>

      {/* Featured Rewards */}
      {featuredRewards.length > 0 && (
        <div className="featured-section">
          <h2>
            <FaFire className="fire-icon" />
            Featured Rewards
          </h2>
          <div className="featured-grid">
            {featuredRewards.map((reward) => (
              <div key={reward.id} className="featured-card">
                <div className="featured-badge">HOT</div>
                <div className="featured-content">
                  <h3>{reward.name}</h3>
                  <p>{reward.description}</p>
                  <div className="featured-footer">
                    <span className="featured-points">{reward.pointsCost} pts</span>
                    <button 
                      onClick={() => handleRedeem(reward.id, reward.pointsCost)}
                      disabled={profile?.availablePoints < reward.pointsCost}
                      className="featured-btn"
                    >
                      Redeem Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="filters-modern">
        <div className="search-modern">
          <FaSearch />
          <input
            type="text"
            placeholder="Search rewards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-buttons">
          <FaFilter className="filter-icon" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat === 'All' ? '' : cat.toLowerCase())}
              className={`filter-chip ${(category === (cat === 'All' ? '' : cat.toLowerCase())) ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="sort-modern">
          <FaSort />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="points">Points: Low to High</option>
            <option value="points-desc">Points: High to Low</option>
            <option value="name">Name: A to Z</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="rewards-grid-modern">
        {currentRewards.map((reward) => (
          <div key={reward.id} className="reward-card-premium">
            <div className="reward-card-header">
              <div className="reward-icon-premium">
                <FaGift />
              </div>
              <div className="reward-points-premium">{reward.pointsCost} pts</div>
            </div>
            <div className="reward-card-body">
              <h3>{reward.name}</h3>
              <p>{reward.description}</p>
            </div>
            <div className="reward-card-footer">
              <button 
                onClick={() => handleRedeem(reward.id, reward.pointsCost)}
                disabled={profile?.availablePoints < reward.pointsCost}
                className="redeem-premium-btn"
              >
                {profile?.availablePoints >= reward.pointsCost ? (
                  <>
                    Redeem Now <FaArrowRight />
                  </>
                ) : (
                  'Insufficient Points'
                )}
              </button>
            </div>
            {profile?.availablePoints >= reward.pointsCost && (
              <div className="available-badge">
                <FaStar /> Available
              </div>
            )}
          </div>
        ))}
      </div>

      {currentRewards.length === 0 && (
        <div className="no-results">
          <FaSearch size={48} />
          <h3>No rewards found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-modern">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p-1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <div className="page-numbers">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={currentPage === i + 1 ? 'active' : ''}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default RewardsCatalog;