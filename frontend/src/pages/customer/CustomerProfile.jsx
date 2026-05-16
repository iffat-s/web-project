import { useEffect, useState } from 'react';
import { loyaltyApi } from '../../api/client';
import { LoadingPage, TierBadge, fmt, fmtDate } from '../../components/common';
import { Star, Zap, Calendar } from 'lucide-react';

function PointsRing({ available, total }) {
  const pct = total > 0 ? Math.min((available / total) * 100, 100) : 0;
  const r = 52; const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ position: 'absolute' }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--bg3)" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--accent)" strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 70 70)" />
      </svg>
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700 }}>{fmt(available)}</div>
        <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>available</div>
      </div>
    </div>
  );
}

export default function CustomerProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loyaltyApi.getMe().then(r => setProfile(r.data)).finally(() => setLoading(false)); }, []);

  if (loading) return <LoadingPage />;
  if (!profile) return <div className="card"><p className="text-muted">Profile not found.</p></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">My Loyalty Profile</h1>
          <p className="page-sub">Track your points, tier, and reward history</p></div>
      </div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <PointsRing available={profile.availablePoints} total={profile.totalPoints} />
          <div style={{ textAlign: 'center' }}>
            <div className="stat-label">Total Lifetime Earned</div>
            <div style={{ fontWeight: 700, color: 'var(--text2)' }}>{fmt(profile.totalPoints)} pts</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="stat-card">
            <div style={{ color: 'var(--accent)', marginBottom: 4 }}><Star size={16} /></div>
            <div className="stat-label">Current Tier</div>
            <div style={{ marginTop: 6 }}><TierBadge tier={profile.currentTier} /></div>
          </div>
          <div className="stat-card">
            <div style={{ color: 'var(--success)', marginBottom: 4 }}><Zap size={16} /></div>
            <div className="stat-label">Available to Spend</div>
            <div className="stat-value" style={{ color: 'var(--success)', fontSize: 22 }}>{fmt(profile.availablePoints)}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="stat-card">
            <div style={{ color: 'var(--info)', marginBottom: 4 }}><Calendar size={16} /></div>
            <div className="stat-label">Member Since</div>
            <div style={{ fontWeight: 600, marginTop: 6 }}>{fmtDate(profile.joinedAt)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label" style={{ marginBottom: 8 }}>Achieved Tiers</div>
            {profile.userTiers?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {profile.userTiers.map(ut => (
                  <div key={ut.id} className="flex items-center gap-2">
                    <TierBadge tier={ut.tierLevel?.name} />
                    <span className="text-muted text-sm">{fmt(ut.tierLevel?.minPoints)} pts min</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-muted text-sm">No tiers earned yet</p>}
          </div>
        </div>
      </div>

      {profile.transactions?.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 16 }}>Recent Activity</h3>
          {profile.transactions.slice(0, 5).map(t => (
            <div key={t.id} className="flex justify-between items-center" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <span className={`badge ${t.type === 'earn' ? 'badge-success' : 'badge-gold'}`} style={{ marginRight: 8 }}>{t.type}</span>
                <span className="text-muted text-sm">{t.purchaseAmount ? `$${t.purchaseAmount.toFixed(2)} purchase` : '—'}</span>
              </div>
              <span style={{ fontWeight: 700, color: t.points > 0 ? 'var(--success)' : 'var(--error)' }}>
                {t.points > 0 ? '+' : ''}{fmt(t.points)} pts
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
