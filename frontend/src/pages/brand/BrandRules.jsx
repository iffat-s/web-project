import { useEffect, useState } from 'react';
import useBrand from '../../hooks/useBrand';
import { rulesApi } from '../../api/client';
import { LoadingPage, Modal, FormGroup, StatusBadge, ConfirmModal, fmtDate, Empty } from '../../components/common';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

const blank = { ruleType: 'purchase', pointsPerUnit: 1, minPurchase: 0, startDate: '', endDate: '', isActive: true };

export default function BrandRules() {
  const { brand, loading: bLoading } = useBrand();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(blank);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!brand) return;
    rulesApi.getByBrand(brand.id).then(r => setRules(r.data)).finally(() => setLoading(false));
  }, [brand]);

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }
  function openCreate() { setForm(blank); setModal('create'); }
  function openEdit(r) { setForm({ ruleType: r.ruleType, pointsPerUnit: r.pointsPerUnit, minPurchase: r.minPurchase, startDate: r.startDate?.slice(0,16) || '', endDate: r.endDate?.slice(0,16) || '', isActive: r.isActive }); setModal(r); }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = { ...form, pointsPerUnit: Number(form.pointsPerUnit), minPurchase: Number(form.minPurchase) };
      if (!payload.startDate) delete payload.startDate;
      if (!payload.endDate) delete payload.endDate;
      if (modal === 'create') {
        const r = await rulesApi.create(brand.id, payload);
        setRules(p => [...p, r.data]);
        toast.success('Rule created');
      } else {
        const r = await rulesApi.update(brand.id, modal.id, payload);
        setRules(p => p.map(x => x.id === modal.id ? r.data : x));
        toast.success('Rule updated');
      }
      setModal(null);
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    setSaving(false);
  }

  async function handleDelete() {
    await rulesApi.delete(brand.id, deleteId);
    setRules(p => p.filter(x => x.id !== deleteId));
    setDeleteId(null);
    toast.success('Deleted');
  }

  if (bLoading || loading) return <LoadingPage />;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Earning Rules</h1>
          <p className="page-sub">{brand?.name} · {rules.length} rules</p></div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> New Rule</button>
      </div>

      {rules.length === 0 ? <Empty icon="📋" title="No earning rules" sub="Create rules for how customers earn points" /> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Type</th><th>Pts/Unit</th><th>Min Purchase</th><th>Start</th><th>End</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {rules.map(r => (
                <tr key={r.id}>
                  <td><div className="flex items-center gap-2"><Tag size={13} style={{ color: 'var(--accent)' }} /><strong>{r.ruleType}</strong></div></td>
                  <td><span className="badge badge-gold">{r.pointsPerUnit} pt/unit</span></td>
                  <td className="text-muted">${r.minPurchase}</td>
                  <td className="text-muted">{fmtDate(r.startDate)}</td>
                  <td className="text-muted">{fmtDate(r.endDate)}</td>
                  <td><StatusBadge status={r.isActive ? 'active' : 'inactive'} /></td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(r)}><Pencil size={13} /></button>
                      <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteId(r.id)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={modal === 'create' ? 'New Earning Rule' : 'Edit Rule'} onClose={() => setModal(null)}>
          <FormGroup label="Rule Type">
            <select className="input" value={form.ruleType} onChange={e => set('ruleType', e.target.value)}>
              <option value="purchase">Purchase (pts per $)</option>
              <option value="flat">Flat (pts per transaction)</option>
              <option value="category">Category</option>
            </select>
          </FormGroup>
          <div className="flex gap-3">
            <FormGroup label="Points Per Unit"><input className="input" type="number" step="0.1" min="0" value={form.pointsPerUnit} onChange={e => set('pointsPerUnit', e.target.value)} /></FormGroup>
            <FormGroup label="Min Purchase ($)"><input className="input" type="number" min="0" value={form.minPurchase} onChange={e => set('minPurchase', e.target.value)} /></FormGroup>
          </div>
          <div className="flex gap-3">
            <FormGroup label="Start Date"><input className="input" type="datetime-local" value={form.startDate} onChange={e => set('startDate', e.target.value)} /></FormGroup>
            <FormGroup label="End Date"><input className="input" type="datetime-local" value={form.endDate} onChange={e => set('endDate', e.target.value)} /></FormGroup>
          </div>
          <FormGroup label="Status">
            <select className="input" value={form.isActive} onChange={e => set('isActive', e.target.value === 'true')}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </FormGroup>
          <div className="flex gap-3 mt-4">
            <button className="btn btn-ghost w-full" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary w-full" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </Modal>
      )}
      {deleteId && <ConfirmModal message="Delete this earning rule?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}
