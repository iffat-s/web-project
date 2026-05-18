import { useEffect, useState } from 'react';
import { dashboardApi, usersApi } from '../../api/client';
import { LoadingPage, fmt, fmtDate, TierBadge } from '../../components/common';
import { Users, CreditCard, Repeat, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.admin().then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingPage />;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Admin Dashboard</h1>
          <p className="page-sub">Platform overview and customer engagement</p></div>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Customers', value: fmt(data?.totalCustomers), icon: Users, color: 'var(--accent)' },
          { label: 'Transactions', value: fmt(data?.totalTransactions), icon: CreditCard, color: 'var(--success)' },
          { label: 'Redemptions', value: fmt(data?.totalRedemptions), icon: Repeat, color: 'var(--info)' },
          { label: 'Top Tier Members', value: fmt(data?.topCustomers?.length), icon: TrendingUp, color: 'var(--warn)' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div className="stat-card" key={label}>
            <div style={{ color, marginBottom: 8 }}><Icon size={20} /></div>
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16, fontSize: 16 }}>Top Customers by Points</h3>
        {data?.topCustomers?.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>Rank</th><th>Name</th><th>Email</th>
                <th>Total Points</th><th>Available</th><th>Tier</th><th>Joined</th>
              </tr></thead>
              <tbody>
                {data.topCustomers.map((p, i) => (
                  <tr key={p.id}>
                    <td><span className="badge badge-gold">#{i + 1}</span></td>
                    <td style={{ fontWeight: 600 }}>{p.user?.name || '—'}</td>
                    <td className="text-muted">{p.user?.email}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{fmt(p.totalPoints)}</td>
                    <td>{fmt(p.availablePoints)}</td>
                    <td>
                      <div><TierBadge tier={p.currentTier || 'Bronze'} /></div>
                      {p.userTiers && p.userTiers.length > 0 && (
                        <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {p.userTiers.map(ut => (
                            <TierBadge key={ut.id} tier={ut.tierLevel?.name} />
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="text-muted">{fmtDate(p.joinedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-muted">No data yet.</p>}
      </div>
    </div>
  );
}
