import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { dashboardApi, brandsApi } from '../../api/client';
import { LoadingPage, fmt } from '../../components/common';
import { CreditCard, Repeat, Store } from 'lucide-react';

export default function BrandDashboard() {
  const { user } = useSelector(s => s.auth);
  const [data, setData] = useState(null);
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get manager's brand first
    brandsApi.getAll().then(r => {
      const myBrand = r.data.find(b => b.manager?.id === user?.id) || r.data[0];
      if (myBrand) {
        setBrand(myBrand);
        return dashboardApi.brand(myBrand.id).then(d => setData(d.data));
      }
    }).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingPage />;

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
