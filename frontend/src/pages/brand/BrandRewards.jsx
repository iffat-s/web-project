import { useEffect, useState } from 'react';
import useBrand from '../../hooks/useBrand';
import { rewardsApi } from '../../api/client';
import { LoadingPage, Modal, FormGroup, StatusBadge, ConfirmModal, fmtDate, fmt, Empty } from '../../components/common';
import { Plus, Pencil, Trash2, Gift } from 'lucide-react';
import toast from 'react-hot-toast';

const blank = { title: '', description: '', pointsRequired: 100, stock: 10, expiresAt: '' };

export default function BrandRewards() {
  const { brand, loading: bLoading } = useBrand();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(blank);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!brand) return;
    rewardsApi.getByBrand(brand.id).then(r => setRewards(r.data)).finally(() => setLoading(false));
  }, [brand]);

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }
  function openCreate() { setForm(blank); setModal('create'); }
  function openEdit(rw) { setForm({ title: rw.title, description: rw.description || '', pointsRequired: rw.pointsRequired, stock: rw.stock, expiresAt: rw.expiresAt?.slice(0,16) || '' }); setModal(rw); }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = { ...form, pointsRequired: Number(form.pointsRequired), stock: Number(form.stock) };
      if (!payload.expiresAt) delete payload.expiresAt;
      if (modal === 'create') {
        const r = await rewardsApi.create(brand.id, payload);
        setRewards(p => [...p, r.data]);
        toast.success('Reward created');
      } else {
        const r = await rewardsApi.update(brand.id, modal.id, payload);
        setRewards(p => p.map(x => x.id === modal.id ? r.data : x));
        toast.success('Reward updated');
      }
      setModal(null);
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    setSaving(false);
  }

  async function handleDelete() {
    await rewardsApi.delete(brand.id, deleteId);
    setRewards(p => p.filter(x => x.id !== deleteId));
    setDeleteId(null);
    toast.success('Deleted');
  }

  if (bLoading || loading) return <LoadingPage />;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Rewards</h1>
          <p className="page-sub">{brand?.name} · {rewards.length} rewards</p></div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> New Reward</button>
      </div>

      {rewards.length === 0 ? <Empty icon="🎁" title="No rewards yet" sub="Add rewards for customers to redeem" /> : (
        <div className="grid-3">
          {rewards.map(rw => (
            <div className="card" key={rw.id}>
              <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
                <Gift size={18} style={{ color: 'var(--accent)' }} />
                <StatusBadge status={rw.isActive ? 'active' : 'inactive'} />
              </div>
              <h3 style={{ fontSize: 15, marginBottom: 4 }}>{rw.title}</h3>
              <p className="text-muted text-sm" style={{ marginBottom: 12 }}>{rw.description || '—'}</p>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div><div className="stat-label">Points</div><div style={{ fontWeight: 700, color: 'var(--accent)' }}>{fmt(rw.pointsRequired)}</div></div>
                <div><div className="stat-label">Stock</div><div style={{ fontWeight: 700 }}>{rw.stock}</div></div>
                <div><div className="stat-label">Expires</div><div className="text-muted text-sm">{fmtDate(rw.expiresAt)}</div></div>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-ghost btn-sm w-full" onClick={() => openEdit(rw)}><Pencil size={12} /> Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(rw.id)}><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal === 'create' ? 'New Reward' : 'Edit Reward'} onClose={() => setModal(null)}>
          <FormGroup label="Title"><input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Coffee Voucher" /></FormGroup>
          <FormGroup label="Description"><textarea className="input" rows={2} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Short description…" style={{ resize: 'vertical' }} /></FormGroup>
          <div className="flex gap-3">
            <FormGroup label="Points Required"><input className="input" type="number" min={1} value={form.pointsRequired} onChange={e => set('pointsRequired', e.target.value)} /></FormGroup>
            <FormGroup label="Stock"><input className="input" type="number" min={0} value={form.stock} onChange={e => set('stock', e.target.value)} /></FormGroup>
          </div>
          <FormGroup label="Expires At (optional)"><input className="input" type="datetime-local" value={form.expiresAt} onChange={e => set('expiresAt', e.target.value)} /></FormGroup>
          <div className="flex gap-3 mt-4">
            <button className="btn btn-ghost w-full" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary w-full" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </Modal>
      )}
      {deleteId && <ConfirmModal message="Delete this reward?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}
