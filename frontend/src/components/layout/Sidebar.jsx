import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import {
  LayoutDashboard, Users, Store, Gift, CreditCard, BarChart3,
  Star, LogOut, ShoppingBag, Repeat, Tag, FileText, Trophy
} from 'lucide-react';
import toast from 'react-hot-toast';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/brands', label: 'Brands', icon: Store },
  { to: '/admin/transactions', label: 'Transactions', icon: CreditCard },
  { to: '/admin/redemptions', label: 'Redemptions', icon: Repeat },
  { to: '/admin/profiles', label: 'Loyalty Profiles', icon: Star },
];

const brandLinks = [
  { to: '/brand', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/brand/campaigns', label: 'Campaigns', icon: BarChart3 },
  { to: '/brand/rewards', label: 'Rewards', icon: Gift },
  { to: '/brand/tiers', label: 'Tier Levels', icon: Trophy },
  { to: '/brand/rules', label: 'Earning Rules', icon: Tag },
  { to: '/brand/redemptions', label: 'Redemptions', icon: Repeat },
  { to: '/brand/transactions', label: 'Transactions', icon: FileText },
];

const customerLinks = [
  { to: '/customer', label: 'My Profile', icon: Star },
  { to: '/customer/earn', label: 'Earn Points', icon: ShoppingBag },
  { to: '/customer/rewards', label: 'Browse Rewards', icon: Gift },
  { to: '/customer/transactions', label: 'Transactions', icon: CreditCard },
  { to: '/customer/redemptions', label: 'My Redemptions', icon: Repeat },
];

function roleLinks(role) {
  if (role === 'admin') return adminLinks;
  if (role === 'brand_manager') return brandLinks;
  return customerLinks;
}

export default function Sidebar() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const links = roleLinks(user?.role);
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  async function handleLogout() {
    await dispatch(logout());
    toast.success('Logged out');
    navigate('/login');
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>LoyaltyOS</h2>
        <span>{user?.role?.replace('_', ' ')}</span>
      </div>

      <nav className="sidebar-nav">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin' || to === '/brand' || to === '/customer'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <Icon /> {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-badge">
          <div className="user-badge-avatar">{initials}</div>
          <div className="user-badge-info">
            <div className="user-badge-name">{user?.name}</div>
            <div className="user-badge-role">{user?.role?.replace('_', ' ')}</div>
          </div>
        </div>
        <button className="nav-link" onClick={handleLogout} style={{ color: 'var(--error)' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}
