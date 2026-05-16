import { useEffect, useState } from 'react';
import { tiersApi, rulesApi, redemptionsApi, transactionsApi } from '../../api/client';
import { useBrand } from '../../hooks/useBrand';
import { LoadingPage, Modal, Empty, ConfirmModal, StatusBadge, fmt, fmtDate, fmtDateTime } from '../../components/common';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

// ─── TIERS ────────────────────────────────────────────────────────────────────
function TierModal({ tier, brandId, onClose, onSaved }) {
  const [form, setForm] = useState({ name: tier?.name || '', minPoints: tier?.minPoints || 0, badgeIcon: tier?.badgeIcon || '', perks: tier?.perks ? JSON.stringify(tier.perks, null, 2) : '' });
  const s = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault(); setLoading(true);
    try {
      let perks = null;
      if (form.perks.trim()) { try { perks = JSON.parse(form.perks); } catch { toast.error('Invalid JSON in perks'); setLoading(false); return; } }
      const payload = { ...form, perks, badgeIcon: form.badgeIcon || undefined };
      if (tier) { const r = await tiersApi.update(brandId, tier.id, payload); onSaved(r.data); toast.success('Updated'); }
      else { const r = await tiersApi.create(brandId, payload); onSaved(r.data); toast.success('Tier created'); }
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  }

  return (
    <Modal title={tier ? 'Edit Tier' : 'New Tier'} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="form-group"><label className="form-label">Tier Name</label><input className="input" value={form.name} onChange={s('name')} required placeholder="Gold" /></div>
        <div className="form-group"><label className="form-label">Min Points</label><input className="input" type="number" min="0" value={form.minPoints} onChange={s('minPoints')} required /></div>
        <div className="form-group"><label className="form-label">Badge Icon URL (optional)</label><input className="input" value={form.badgeIcon} onChange={s('badgeIcon')} placeholder="https://..." /></div>
        <div className="form-group"><label className="form-label">Perks (JSON, optional)</label><textarea className="input" rows={3} value={form.perks} onChange={s('perks')} placeholder={'{ "discount": "10%", "freeShipping": true }'} /></div>
        <div className="flex gap-3">
          <button type="button" className="btn btn-ghost w-full" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary w-full" disabled={loading}>{loading ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}

export function BrandTiers() {
  const { brand, loading: bl } = useBrand();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (!brand) return;
    setLoading(true);
    tiersApi.getByBrand(brand.id).then(r => setItems(r.data || [])).finally(() => setLoading(false));
  }, [brand]);

  function upsert(item) { setItems(prev => { const idx = prev.findIndex(x => x.id === item.id); if (idx >= 0) { const n = [...prev]; n[idx] = item; return n; } return [item, ...prev]; }); }

  async function confirmDelete() {
    try { await tiersApi.delete(brand.id, deleting.id); setItems(i => i.filter(x => x.id !== deleting.id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
    setDeleting(null);
  }

  if (bl || loading) return <LoadingPage />;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Tier Levels</h1><p className="page-sub">{brand?.name}</p></div>
        <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={15} /> New Tier</button>
      </div>
      {items.length === 0 ? <Empty icon="🏆" title="No tiers yet" /> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Name</th><th>Min Points</th><th>Perks</th><th></th></tr></thead>
          <tbody>{items.sort((a,b)=>a.minPoints-b.minPoints).map(t => (
            <tr key={t.id}>
              <td><strong>{t.name}</strong></td>
              <td><span className="text-accent">{fmt(t.minPoints)} pts</span></td>
              <td><span className="text-muted text-sm">{t.perks ? Object.entries(t.perks).map(([k,v])=>`${k}: ${v}`).join(', ') : '—'}</span></td>
              <td><div className="flex gap-2">
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal(t)}><Pencil size={13}/></button>
                <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleting(t)}><Trash2 size={13}/></button>
              </div></td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
      {modal && <TierModal tier={modal === 'new' ? null : modal} brandId={brand.id} onClose={() => setModal(null)} onSaved={upsert} />}
      {deleting && <ConfirmModal message={`Delete tier "${deleting.name}"?`} onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />}
    </div>
  );
}

// ─── RULES ────────────────────────────────────────────────────────────────────
function RuleModal({ rule, brandId, onClose, onSaved }) {
  const [form, setForm] = useState({ ruleType: rule?.ruleType || 'purchase', pointsPerUnit: rule?.pointsPerUnit || 1, minPurchase: rule?.minPurchase || 0, startDate: rule?.startDate?.slice(0,16) || '', endDate: rule?.endDate?.slice(0,16) || '', isActive: rule?.isActive ?? true });
  const s = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault(); setLoading(true);
    try {
      const payload = { ...form, startDate: form.startDate || undefined, endDate: form.endDate || undefined };
      if (rule) { const r = await rulesApi.update(brandId, rule.id, payload); onSaved(r.data); toast.success('Updated'); }
      else { const r = await rulesApi.create(brandId, payload); onSaved(r.data); toast.success('Rule created'); }
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  }

  return (
    <Modal title={rule ? 'Edit Rule' : 'New Earning Rule'} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="form-group"><label className="form-label">Rule Type</label>
          <select className="input" value={form.ruleType} onChange={s('ruleType')}>
            <option value="purchase">Purchase (per $)</option>
            <option value="flat">Flat (per transaction)</option>
            <option value="category">Category</option>
          </select>
        </div>
        <div className="grid-2" style={{ gap: 12 }}>
          <div className="form-group"><label className="form-label">Points per Unit</label><input className="input" type="number" step="0.1" min="0" value={form.pointsPerUnit} onChange={s('pointsPerUnit')} required /></div>
          <div className="form-group"><label className="form-label">Min Purchase ($)</label><input className="input" type="number" step="0.01" min="0" value={form.minPurchase} onChange={s('minPurchase')} /></div>
        </div>
        <div className="grid-2" style={{ gap: 12 }}>
          <div className="form-group"><label className="form-label">Start Date (opt)</label><input className="input" type="datetime-local" value={form.startDate} onChange={s('startDate')} /></div>
          <div className="form-group"><label className="form-label">End Date (opt)</label><input className="input" type="datetime-local" value={form.endDate} onChange={s('endDate')} /></div>
        </div>
        <div className="form-group" style={{ display:'flex', alignItems:'center', gap:10 }}>
          <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(p=>({...p,isActive:e.target.checked}))} />
          <label htmlFor="isActive" className="form-label" style={{margin:0}}>Active</label>
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn btn-ghost w-full" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary w-full" disabled={loading}>{loading ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}

export function BrandRules() {
  const { brand, loading: bl } = useBrand();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (!brand) return;
    setLoading(true);
    rulesApi.getByBrand(brand.id).then(r => setItems(r.data || [])).finally(() => setLoading(false));
  }, [brand]);

  function upsert(item) { setItems(prev => { const idx = prev.findIndex(x => x.id === item.id); if (idx >= 0) { const n = [...prev]; n[idx] = item; return n; } return [item, ...prev]; }); }

  async function confirmDelete() {
    try { await rulesApi.delete(brand.id, deleting.id); setItems(i => i.filter(x => x.id !== deleting.id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
    setDeleting(null);
  }

  if (bl || loading) return <LoadingPage />;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Earning Rules</h1><p className="page-sub">{brand?.name}</p></div>
        <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={15} /> New Rule</button>
      </div>
      {items.length === 0 ? <Empty icon="📋" title="No rules yet" sub="Create rules to define how customers earn points" /> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Type</th><th>Pts/Unit</th><th>Min Purchase</th><th>Dates</th><th>Status</th><th></th></tr></thead>
          <tbody>{items.map(r => (
            <tr key={r.id}>
              <td><span className="badge badge-info">{r.ruleType}</span></td>
              <td><span className="text-accent">{r.pointsPerUnit}</span></td>
              <td>{r.minPurchase > 0 ? `$${r.minPurchase}` : '—'}</td>
              <td className="text-muted text-sm">{r.startDate ? `${fmtDate(r.startDate)} → ${fmtDate(r.endDate)}` : 'Always'}</td>
              <td><StatusBadge status={r.isActive ? 'active' : 'inactive'} /></td>
              <td><div className="flex gap-2">
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal(r)}><Pencil size={13}/></button>
                <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleting(r)}><Trash2 size={13}/></button>
              </div></td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
      {modal && <RuleModal rule={modal === 'new' ? null : modal} brandId={brand.id} onClose={() => setModal(null)} onSaved={upsert} />}
      {deleting && <ConfirmModal message="Delete this rule?" onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />}
    </div>
  );
}

// ─── BRAND REDEMPTIONS ────────────────────────────────────────────────────────
export function BrandRedemptions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    redemptionsApi.getAll().then(r => setItems(r.data || [])).finally(() => setLoading(false));
  }, []);

  async function changeStatus(id, status) {
    try { const r = await redemptionsApi.updateStatus(id, status); setItems(d => d.map(x => x.id === id ? { ...x, status: r.data.status } : x)); toast.success(`Status → ${status}`); }
    catch { toast.error('Failed'); }
  }

  const filtered = filter ? items.filter(r => r.status === filter) : items;

  if (loading) return <LoadingPage />;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Redemptions</h1><p className="page-sub">{items.filter(r=>r.status==='pending').length} pending</p></div>
        <select className="input input-sm" style={{ width: 160 }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="fulfilled">Fulfilled</option>
        </select>
      </div>
      {filtered.length === 0 ? <Empty icon="🔄" title="No redemptions" /> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Customer</th><th>Reward</th><th>Points</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map(r => (
            <tr key={r.id}>
              <td><strong>{r.loyaltyProfile?.user?.name || '—'}</strong></td>
              <td>{r.reward?.title}</td>
              <td><span className="text-accent">{fmt(r.pointsSpent)}</span></td>
              <td><StatusBadge status={r.status} /></td>
              <td className="text-muted">{fmtDateTime(r.redeemedAt)}</td>
              <td><div className="flex gap-2">
                {r.status === 'pending' && <>
                  <button className="btn btn-sm" style={{background:'var(--success-bg)',color:'var(--success)',border:'1px solid rgba(74,222,128,0.2)',fontSize:12}} onClick={() => changeStatus(r.id,'approved')}>Approve</button>
                  <button className="btn btn-danger btn-sm" onClick={() => changeStatus(r.id,'rejected')}>Reject</button>
                </>}
                {r.status === 'approved' && <button className="btn btn-sm" style={{background:'var(--info-bg)',color:'var(--info)',border:'1px solid rgba(96,165,250,0.2)',fontSize:12}} onClick={() => changeStatus(r.id,'fulfilled')}>Fulfill</button>}
                {['rejected','fulfilled'].includes(r.status) && <span className="text-muted text-sm">—</span>}
              </div></td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
    </div>
  );
}

// ─── BRAND TRANSACTIONS ───────────────────────────────────────────────────────
export function BrandTransactions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    transactionsApi.getAll().then(r => setItems(r.data || [])).finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? items.filter(t => t.loyaltyProfile?.user?.name?.toLowerCase().includes(search.toLowerCase()) || t.brand?.name?.toLowerCase().includes(search.toLowerCase()))
    : items;

  if (loading) return <LoadingPage />;

  return (
    <div>
      <div className="page-header"><div><h1 className="page-title">Transactions</h1></div></div>
      <div className="filters-bar mb-4">
        <div className="search-wrap"><input className="input input-sm" placeholder="Search customer or brand..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      </div>
      <div className="table-wrap"><table>
        <thead><tr><th>Customer</th><th>Brand</th><th>Type</th><th>Points</th><th>Amount</th><th>Date</th></tr></thead>
        <tbody>{filtered.map(t => (
          <tr key={t.id}>
            <td><strong>{t.loyaltyProfile?.user?.name || '—'}</strong></td>
            <td className="text-muted">{t.brand?.name}</td>
            <td><StatusBadge status={t.type} /></td>
            <td style={{ fontWeight:700, color: t.points>0?'var(--success)':'var(--error)' }}>{t.points>0?'+':''}{fmt(t.points)}</td>
            <td>{t.purchaseAmount ? `$${Number(t.purchaseAmount).toFixed(2)}` : '—'}</td>
            <td className="text-muted">{fmtDateTime(t.createdAt)}</td>
          </tr>
        ))}</tbody>
      </table></div>
    </div>
  );
}
