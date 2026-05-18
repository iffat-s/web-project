import { useEffect, useState, useMemo } from 'react';
import { redemptionsApi } from '../../api/client';
import { LoadingPage, StatusBadge, FiltersBar, fmtDateTime, fmt } from '../../components/common';
import toast from 'react-hot-toast';

export default function AdminRedemptions() {
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    redemptionsApi.getAll().then(r => setRedemptions(r.data)).finally(() => setLoading(false));
  }, []);

  async function markFulfilled(id) {
    try {
      const r = await redemptionsApi.updateStatus(id, 'fulfilled');
      setRedemptions(p => p.map(x => x.id === id ? { ...x, status: r.data.status } : x));
      toast.success('Marked as fulfilled');
    } catch { toast.error('Failed to update status'); }
  }

  const filtered = useMemo(() => redemptions.filter(r => {
    const q = search.toLowerCase();
    const mQ = !q || r.loyaltyProfile?.user?.name?.toLowerCase().includes(q) || r.reward?.title?.toLowerCase().includes(q);
    const mS = !statusFilter || r.status === statusFilter;
    return mQ && mS;
  }), [redemptions, search, statusFilter]);

  if (loading) return <LoadingPage />;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Redemptions</h1>
          <p className="page-sub">{redemptions.length} total redemptions</p></div>
      </div>
      <FiltersBar search={search} onSearch={setSearch}>
        <select className="input input-sm" style={{ width: 140 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="redeemed">Redeemed</option>
          <option value="fulfilled">Fulfilled</option>
        </select>
      </FiltersBar>
      <div className="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Customer</th><th>Reward</th><th>Points</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id}>
                <td className="text-muted">{r.id}</td>
                <td><strong>{r.loyaltyProfile?.user?.name || '—'}</strong></td>
                <td>{r.reward?.title || '—'}</td>
                <td style={{ color: 'var(--accent)', fontWeight: 700 }}>{fmt(r.pointsSpent)}</td>
                <td><StatusBadge status={r.status} /></td>
                <td className="text-muted">{fmtDateTime(r.redeemedAt)}</td>
                <td>
                  {r.status === 'redeemed' && (
                    <button className="btn btn-sm" style={{ background: 'var(--info-bg)', color: 'var(--info)', border: '1px solid rgba(96,165,250,0.2)' }} onClick={() => markFulfilled(r.id)}>Mark Fulfilled</button>
                  )}
                  {r.status === 'fulfilled' && <span className="text-muted text-sm">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
