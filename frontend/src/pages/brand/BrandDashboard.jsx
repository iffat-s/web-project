import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { dashboardApi, brandsApi } from '../../api/client';
import { LoadingPage, fmt } from '../../components/common';
import { CreditCard, Repeat, Store, AlertCircle } from 'lucide-react';

export default function BrandDashboard() {
  const { user } = useSelector(s => s.auth);
  const [data, setData] = useState(null);
  const [brand, setBrand] = useState(null);
  const [hasBrand, setHasBrand] = useState(null); // null = loading, true = has brand, false = no brand
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyBrand = async () => {
      try {
        const r = await brandsApi.getMyBrand();
        setBrand(r.data);
        setHasBrand(true);
        // Fetch dashboard data
        const dashData = await dashboardApi.brand(r.data.id);
        setData(dashData.data);
      } catch (error) {
        if (error.response?.status === 404) {
          setHasBrand(false); // No brand assigned
        } else {
          console.error('Error fetching brand:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'brand_manager') {
      fetchMyBrand();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <LoadingPage />;

  if (hasBrand === false) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Brand Dashboard</h1>
            <p className="page-sub">No brand assigned</p>
          </div>
        </div>
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <h2 style={{ marginBottom: 8 }}>No Brand Assigned Yet</h2>
          <p style={{ marginBottom: 16 }}>An administrator will assign a brand to you soon.</p>
          <p>Please contact support if you believe this is an error.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{brand?.name || 'Brand'} Dashboard</h1>
          <p className="page-sub">Brand performance overview</p>
        </div>
      </div>
      <div className="grid-3" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Transactions', value: fmt(data?.totalTransactions), icon: CreditCard, color: 'var(--accent)' },
          { label: 'Total Redemptions', value: fmt(data?.totalRedemptions), icon: Repeat, color: 'var(--success)' },
          { label: 'Brand Status', value: brand?.isActive ? 'Active' : 'Inactive', icon: Store, color: brand?.isActive ? 'var(--success)' : 'var(--error)' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div className="stat-card" key={label}>
            <div style={{ color, marginBottom: 8 }}><Icon size={20} /></div>
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <h3 style={{ marginBottom: 8, fontSize: 16 }}>Brand Info</h3>
        <p className="text-muted text-sm">Use the sidebar to manage campaigns, rewards, tiers, rules, and redemptions for <strong style={{ color: 'var(--text)' }}>{brand?.name}</strong>.</p>
      </div>
    </div>
  );
}
