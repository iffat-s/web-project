import { useEffect, useState } from 'react';
import { redemptionsApi } from '../../api/client';
import { LoadingPage, StatusBadge, fmtDateTime, fmt, Empty } from '../../components/common';
import { Repeat } from 'lucide-react';

export default function CustomerRedemptions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { redemptionsApi.getMy().then(r => setItems(r.data)).finally(() => setLoading(false)); }, []);

  const filtered = filter ? items.filter(i => i.status === filter) : items;

  if (loading) return <LoadingPage />;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">My Redemptions</h1>
          <p className="page-sub">{items.length} rewards redeemed</p></div>
        <select className="input input-sm" style={{ width: 160 }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="redeemed">Redeemed</option>
          <option value="fulfilled">Fulfilled</option>
        </select>
      </div>

      {filtered.length === 0 ? <Empty icon="🔁" title="No redemptions yet" sub="Browse rewards and redeem your points" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(r => (
            <div className="card" key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Repeat size={18} style={{ color: 'var(--accent)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{r.reward?.title || 'Reward'}</div>
                <div className="text-muted text-sm">{r.reward?.description || '—'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: 16 }}>−{fmt(r.pointsSpent)} pts</div>
                <div className="text-muted text-sm">{fmtDateTime(r.redeemedAt)}</div>
              </div>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
