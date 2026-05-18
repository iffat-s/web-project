import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';

import AppLayout from './components/layout/AppLayout';
import PublicLanding from './pages/PublicLanding';
import { LoginPage, RegisterPage } from './pages/auth/AuthPages';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBrands from './pages/admin/AdminBrands';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminRedemptions from './pages/admin/AdminRedemptions';
import AdminProfiles from './pages/admin/AdminProfiles';

// Brand Manager
import BrandDashboard from './pages/brand/BrandDashboard';
import BrandCampaigns from './pages/brand/BrandCampaigns';
import BrandRewards from './pages/brand/BrandRewards';
import BrandTiers from './pages/brand/BrandTiers';
import BrandRules from './pages/brand/BrandRules';
import BrandRedemptions from './pages/brand/BrandRedemptions';
import BrandTransactions from './pages/brand/BrandTransactions';

// Customer
import CustomerProfile from './pages/customer/CustomerProfile';
import CustomerEarn from './pages/customer/CustomerEarn';
import CustomerRewards from './pages/customer/CustomerRewards';
import CustomerTransactions from './pages/customer/CustomerTransactions';
import CustomerRedemptions from './pages/customer/CustomerRedemptions';

function RequireAuth({ children, role }) {
  const { user } = useSelector(s => s.auth);
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    const home = user.role === 'admin' ? '/admin' : user.role === 'brand_manager' ? '/brand' : '/customer';
    return <Navigate to={home} replace />;
  }
  return children;
}

function DefaultRedirect() {
  const { user } = useSelector(s => s.auth);
  if (!user) return <PublicLanding />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'brand_manager') return <Navigate to="/brand" replace />;
  return <Navigate to="/customer" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { background: 'var(--bg2)', color: 'var(--text)', border: '1px solid var(--border)' },
        success: { iconTheme: { primary: 'var(--success)', secondary: 'var(--bg)' } },
        error: { iconTheme: { primary: 'var(--error)', secondary: 'var(--bg)' } },
      }} />
      <Routes>
        <Route path="/" element={<DefaultRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin */}
        <Route path="/admin" element={<RequireAuth role="admin"><AppLayout /></RequireAuth>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="brands" element={<AdminBrands />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="redemptions" element={<AdminRedemptions />} />
          <Route path="profiles" element={<AdminProfiles />} />
        </Route>

        {/* Brand Manager */}
        <Route path="/brand" element={<RequireAuth role="brand_manager"><AppLayout /></RequireAuth>}>
          <Route index element={<BrandDashboard />} />
          <Route path="campaigns" element={<BrandCampaigns />} />
          <Route path="rewards" element={<BrandRewards />} />
          <Route path="tiers" element={<BrandTiers />} />
          <Route path="rules" element={<BrandRules />} />
          <Route path="redemptions" element={<BrandRedemptions />} />
          <Route path="transactions" element={<BrandTransactions />} />
        </Route>

        {/* Customer */}
        <Route path="/customer" element={<RequireAuth role="customer"><AppLayout /></RequireAuth>}>
          <Route index element={<CustomerProfile />} />
          <Route path="earn" element={<CustomerEarn />} />
          <Route path="rewards" element={<CustomerRewards />} />
          <Route path="transactions" element={<CustomerTransactions />} />
          <Route path="redemptions" element={<CustomerRedemptions />} />
        </Route>

        <Route path="*" element={<DefaultRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
