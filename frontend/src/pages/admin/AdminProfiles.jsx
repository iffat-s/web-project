import { useEffect, useState } from 'react';
import { loyaltyApi } from '../../api/client';
import { LoadingPage, TierBadge, fmtDate, fmt, Empty } from '../../components/common';

export default function AdminProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { loyaltyApi.getAll().then(r => setProfiles(r.data)).finally(() => setLoading(false)); }, []);

  const filtered = profiles.filter(p => {
    const q = search.toLowerCase();
    return !q || p.user?.name?.toLowerCase().includes(q) || p.user?.email?.toLowerCase().includes(q);
  });

  if (loading) return <LoadingPage />;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Loyalty Profiles</h1>
          <p className="page-sub">{profiles.length} customer profiles</p></div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <input className="input" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 360 }} />
      </div>
      {filtered.length === 0 ? <Empty icon="👥" title="No profiles found" /> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Customer</th><th>Email</th><th>Total Points</th><th>Available</th><th>Tier</th><th>Joined</th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td className="text-muted">{p.id}</td>
                  <td><strong>{p.user?.name || '—'}</strong></td>
                  <td className="text-muted">{p.user?.email}</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{fmt(p.totalPoints)}</td>
                  <td>{fmt(p.availablePoints)}</td>
                  <td><TierBadge tier={p.currentTier || 'Bronze'} /></td>
                  <td className="text-muted">{fmtDate(p.joinedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
