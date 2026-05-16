import { useEffect, useState } from 'react';
import { brandsApi, rewardsApi, redemptionsApi, loyaltyApi } from '../../api/client';
import { LoadingPage, fmtDate, fmt, Empty, ConfirmModal } from '../../components/common';
import { Gift, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomerRewards() {
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [rewards, setRewards] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rewardLoading, setRewardLoading] = useState(false);
  const [confirmRedeem, setConfirmRedeem] = useState(null);
  const [redeeming, setRedeeming] = useState(false); // eslint-disable-line

  useEffect(() => {
    Promise.all([
      brandsApi.getAll(),
      loyaltyApi.getMe(),
    ]).then(([b, p]) => {
      setBrands(b.data.filter(x => x.isActive));
      setProfile(p.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedBrand) { setRewards([]); return; }
    setRewardLoading(true);
    rewardsApi.getByBrand(selectedBrand).then(r => setRewards(r.data)).finally(() => setRewardLoading(false));
  }, [selectedBrand]);

  async function handleRedeem() {
    const rw = confirmRedeem;
    setRedeeming(true);
    try {
      await redemptionsApi.redeem({ rewardId: rw.id, brandId: Number(selectedBrand) });
      setProfile(p => ({ ...p, availablePoints: p.availablePoints - rw.pointsRequired }));
      toast.success(`Redeemed "${rw.title}"! Awaiting approval.`);
      setConfirmRedeem(null);
    } catch (e) { toast.error(e.response?.data?.message || 'Redemption failed'); }
    setRedeeming(false);
  }

  if (loading) return <LoadingPage />;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Browse Rewards</h1>
          <p className="page-sub">Redeem your points for exclusive rewards</p></div>
        <div className="flex items-center gap-3">
          <Star size={16} style={{ color: 'var(--accent)' }} />
          <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 16 }}>{fmt(profile?.availablePoints)} pts</span>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <select className="input" style={{ maxWidth: 280 }} value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)}>
          <option value="">Select a brand to browse rewards…</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {rewardLoading ? <LoadingPage /> : !selectedBrand ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Gift size={48} style={{ color: 'var(--text3)', marginBottom: 12 }} />
          <p className="text-muted">Select a brand above to see available rewards</p>
        </div>
      ) : rewards.length === 0 ? <Empty icon="🎁" title="No rewards available" sub="This brand has no active rewards yet" /> : (
        <div className="grid-3">
          {rewards.map(rw => {
            const canAfford = (profile?.availablePoints || 0) >= rw.pointsRequired;
            const expired = rw.expiresAt && new Date(rw.expiresAt) < new Date();
            const outOfStock = rw.stock <= 0;
            const disabled = !canAfford || expired || outOfStock;

            return (
              <div className="card" key={rw.id} style={{ opacity: disabled ? 0.7 : 1 }}>
                <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
                  <Gift size={20} style={{ color: 'var(--accent)' }} />
                  {expired ? <span className="badge badge-error">Expired</span> :
                    outOfStock ? <span className="badge badge-neutral">Out of Stock</span> :
                    <span className="badge badge-success">Available</span>}
                </div>
                <h3 style={{ fontSize: 15, marginBottom: 6 }}>{rw.title}</h3>
                <p className="text-muted text-sm" style={{ marginBottom: 12, minHeight: 36 }}>{rw.description || '—'}</p>
                <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
                  <div>
                    <div className="stat-label">Points</div>
                    <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: 18 }}>{fmt(rw.pointsRequired)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="stat-label">Stock</div>
                    <div style={{ fontWeight: 600 }}>{rw.stock}</div>
                  </div>
                </div>
                {rw.expiresAt && <p className="text-muted text-sm" style={{ marginBottom: 12 }}>Expires {fmtDate(rw.expiresAt)}</p>}
                <button className="btn btn-primary w-full" disabled={disabled} onClick={() => setConfirmRedeem(rw)}>
                  {!canAfford ? `Need ${fmt(rw.pointsRequired - profile?.availablePoints)} more pts` : 'Redeem'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {confirmRedeem && (
        <ConfirmModal
          message={`Redeem "${confirmRedeem.title}" for ${fmt(confirmRedeem.pointsRequired)} points? You'll have ${fmt((profile?.availablePoints || 0) - confirmRedeem.pointsRequired)} pts remaining.`}
          onConfirm={handleRedeem}
          onCancel={() => setConfirmRedeem(null)}
        />
      )}
    </div>
  );
}
