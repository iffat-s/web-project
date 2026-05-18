// // Sidebar.jsx
import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import useBrand from '../../hooks/useBrand';
import {
  LayoutDashboard, Users, Store, Gift, CreditCard, BarChart3,
  Star, LogOut, ShoppingBag, Repeat, Tag, FileText, Trophy, AlertCircle, Menu, X
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
  const [open, setOpen] = useState(false);
  const { user } = useSelector((s) => s.auth);
  const { brand, loading: brandLoading } = useBrand();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const links = roleLinks(user?.role);
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  const isBrandManager = user?.role === 'brand_manager';
  const hasBrand = !brandLoading && brand;

  async function handleLogout() {
    await dispatch(logout());
    toast.success('Logged out');
    navigate('/login');
  }

  // Close sidebar on navigation (mobile)
  const closeSidebar = () => setOpen(false);
  // Automatically close when route changes on mobile
  useState(() => {
    closeSidebar();
  }, [location.pathname]);

  return (
    <>
      {/* Hamburger button (visible only on mobile) */}
      <button className="sidebar-toggle" onClick={() => setOpen(true)} aria-label="Open menu">
        <Menu size={24} />
      </button>

      {/* Overlay */}
      <div className={`sidebar-overlay ${open ? 'visible' : ''}`} onClick={closeSidebar} />

      {/* Sidebar drawer */}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <button className="sidebar-close" onClick={closeSidebar} aria-label="Close menu">
          <X size={20} />
        </button>

        <div className="sidebar-logo">
          <h2>Loyalty & Rewards Platform</h2>
          <span>{user?.role?.replace('_', ' ')}</span>
        </div>

        {isBrandManager && !hasBrand && (
          <div className="no-brand-warning">
            <AlertCircle size={14} />
            <div>
              <strong>No Brand</strong>
              <p>Awaiting admin to assign</p>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {links.map(({ to, label, icon: Icon }) => {
            const isDisabled = isBrandManager && !hasBrand && to !== '/brand';
            return (
              <NavLink
                key={to}
                to={to}
                end={to === '/admin' || to === '/brand' || to === '/customer'}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}${isDisabled ? ' disabled' : ''}`}
                style={isDisabled ? { pointerEvents: 'none', opacity: 0.5 } : {}}
                onClick={closeSidebar}
              >
                <Icon size={18} /> {label}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-badge">
            <div className="user-badge-avatar">{initials}</div>
            <div className="user-badge-info">
              <div className="user-badge-name">{user?.name}</div>
              <div className="user-badge-role">{user?.role?.replace('_', ' ')}</div>
            </div>
          </div>
          <button className="nav-link logout-btn" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}