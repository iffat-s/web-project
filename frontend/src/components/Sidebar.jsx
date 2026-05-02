import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaTags, 
  FaHistory, 
  FaStar, 
  FaTrophy,
  FaCog,
  FaUsers,
  FaChartLine
} from 'react-icons/fa';

const Sidebar = ({ userRole }) => {
  const menuItems = [
    { path: '/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard', roles: ['admin', 'brand_manager', 'customer'] },
    { path: '/rewards', icon: <FaTags />, label: 'Rewards Catalog', roles: ['customer'] },
    { path: '/my-rewards', icon: <FaStar />, label: 'My Rewards', roles: ['customer'] },
    { path: '/transactions', icon: <FaHistory />, label: 'Transactions', roles: ['customer'] },
    { path: '/loyalty-profile', icon: <FaTrophy />, label: 'My Tier', roles: ['customer'] },
    { path: '/admin/users', icon: <FaUsers />, label: 'User Management', roles: ['admin'] },
    { path: '/admin/rewards', icon: <FaTags />, label: 'Manage Rewards', roles: ['admin', 'brand_manager'] },
    { path: '/admin/campaigns', icon: <FaCog />, label: 'Campaigns', roles: ['admin', 'brand_manager'] },
    { path: '/admin/analytics', icon: <FaChartLine />, label: 'Analytics', roles: ['admin', 'brand_manager'] },
  ];

  const filteredItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <aside className="sidebar-modern">
      <div className="sidebar-header">
        <h3>Menu</h3>
      </div>
      <ul className="sidebar-menu-modern">
        {filteredItems.map((item, index) => (
          <li key={index}>
            <NavLink 
              to={item.path} 
              className={({ isActive }) => 
                isActive ? 'sidebar-link-modern active' : 'sidebar-link-modern'
              }
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
              {item.path === '/dashboard' && (
                <span className="sidebar-badge">Home</span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;