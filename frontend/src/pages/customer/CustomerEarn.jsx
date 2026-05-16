import { useEffect, useState } from 'react';
import { brandsApi, transactionsApi } from '../../api/client';
import { LoadingPage, FormGroup, fmt } from '../../components/common';
import { ShoppingBag, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomerEarn() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ brandId: '', purchaseAmount: '', referenceNo: '' });
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { brandsApi.getAll().then(r => setBrands(r.data.filter(b => b.isActive))).finally(() => setLoading(false)); }, []);

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); setResult(null); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.brandId || !form.purchaseAmount) { toast.error('Fill in all required fields'); return; }
    setSubmitting(true);
    try {
      const r = await transactionsApi.earn({ brandId: Number(form.brandId), purchaseAmount: parseFloat(form.purchaseAmount), referenceNo: form.referenceNo || undefined });
      setResult(r.data);
      setForm(p => ({ ...p, purchaseAmount: '', referenceNo: '' }));
      toast.success(`Earned ${fmt(r.data.points)} points!`);
    } catch (e) { toast.error(e.response?.data?.message || 'Error earning points'); }
    setSubmitting(false);
  }

  if (loading) return <LoadingPage />;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Earn Points</h1>
          <p className="page-sub">Submit your purchase to earn loyalty points</p></div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="flex items-center gap-3" style={{ marginBottom: 24 }}>
            <ShoppingBag size={20} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: 16 }}>Log a Purchase</h3>
          </div>
          <form onSubmit={handleSubmit}>
            <FormGroup label="Brand *">
              <select className="input" value={form.brandId} onChange={e => set('brandId', e.target.value)} required>
                <option value="">Select a brand…</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Purchase Amount ($) *">
              <input className="input" type="number" min="0.01" step="0.01" placeholder="0.00"
                value={form.purchaseAmount} onChange={e => set('purchaseAmount', e.target.value)} required />
            </FormGroup>
            <FormGroup label="Reference No. (optional)">
              <input className="input" placeholder="POS receipt number"
                value={form.referenceNo} onChange={e => set('referenceNo', e.target.value)} />
            </FormGroup>
            <button className="btn btn-primary w-full" style={{ marginTop: 8 }} disabled={submitting}>
              {submitting ? 'Processing…' : 'Submit Purchase'}
            </button>
          </form>
        </div>

        <div>
          {result ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <CheckCircle size={48} style={{ color: 'var(--success)', marginBottom: 16 }} />
              <h2 style={{ color: 'var(--success)', fontSize: 36, marginBottom: 4 }}>+{fmt(result.points)}</h2>
              <p style={{ color: 'var(--text2)' }}>points earned!</p>
              <div className="divider" />
              <div className="stat-label">Total Points Balance</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, color: 'var(--accent)', marginTop: 4 }}>{fmt(result.totalPoints)}</div>
            </div>
          ) : (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <ShoppingBag size={40} style={{ color: 'var(--text3)', marginBottom: 12 }} />
              <h3 style={{ color: 'var(--text2)', marginBottom: 8 }}>How it works</h3>
              <p className="text-muted text-sm" style={{ lineHeight: 1.8 }}>
                Select the brand you shopped at, enter your purchase amount, and click Submit.
                Points are calculated based on the brand's earning rules and any active campaigns.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
