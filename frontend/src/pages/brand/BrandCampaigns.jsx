import { useEffect, useState } from 'react';
import useBrand from '../../hooks/useBrand';
import { campaignsApi } from '../../api/client';
import { LoadingPage, Modal, FormGroup, StatusBadge, ConfirmModal, fmtDate, Empty } from '../../components/common';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

const blank = { name: '', bonusMultiplier: 1.5, startDate: '', endDate: '' };

export default function BrandCampaigns() {
  const { brand, loading: bLoading } = useBrand();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(blank);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!brand) return;
    campaignsApi.getByBrand(brand.id).then(r => setCampaigns(r.data)).finally(() => setLoading(false));
  }, [brand]);

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }
  function openCreate() { setForm(blank); setModal('create'); }
  function openEdit(c) { setForm({ name: c.name, bonusMultiplier: c.bonusMultiplier, startDate: c.startDate?.slice(0,16) || '', endDate: c.endDate?.slice(0,16) || '' }); setModal(c); }

  async function handleSave() {
    setSaving(true);
    try {
      if (modal === 'create') {
        const r = await campaignsApi.create(brand.id, form);
        setCampaigns(p => [...p, r.data]);
        toast.success('Campaign created');
      } else {
        const r = await campaignsApi.update(brand.id, modal.id, form);
        setCampaigns(p => p.map(x => x.id === modal.id ? r.data : x));
        toast.success('Campaign updated');
      }
      setModal(null);
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    setSaving(false);
  }

  async function handleToggle(id) {
    const r = await campaignsApi.toggle(brand.id, id);
    setCampaigns(p => p.map(x => x.id === id ? { ...x, isActive: r.data.isActive } : x));
    toast.success('Toggled');
  }

  async function handleDelete() {
    await campaignsApi.delete(brand.id, deleteId);
    setCampaigns(p => p.filter(x => x.id !== deleteId));
    setDeleteId(null);
    toast.success('Deleted');
  }

  if (bLoading || loading) return <LoadingPage />;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Campaigns</h1>
          <p className="page-sub">{brand?.name} · {campaigns.length} campaigns</p></div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> New Campaign</button>
      </div>

      {campaigns.length === 0 ? <Empty icon="📣" title="No campaigns yet" sub="Create bonus point campaigns" /> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Multiplier</th><th>Start</th><th>End</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td>
                  <td><span className="badge badge-gold">{c.bonusMultiplier}×</span></td>
                  <td className="text-muted">{fmtDate(c.startDate)}</td>
                  <td className="text-muted">{fmtDate(c.endDate)}</td>
                  <td><StatusBadge status={c.isActive ? 'active' : 'inactive'} /></td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleToggle(c.id)}>
                        {c.isActive ? <ToggleRight size={15} style={{ color: 'var(--success)' }} /> : <ToggleLeft size={15} />}
                      </button>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(c)}><Pencil size={13} /></button>
                      <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteId(c.id)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={modal === 'create' ? 'New Campaign' : 'Edit Campaign'} onClose={() => setModal(null)}>
          <FormGroup label="Campaign Name"><input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Summer Bonus" /></FormGroup>
          <FormGroup label="Bonus Multiplier"><input className="input" type="number" step="0.1" min="1" value={form.bonusMultiplier} onChange={e => set('bonusMultiplier', parseFloat(e.target.value))} /></FormGroup>
          <FormGroup label="Start Date"><input className="input" type="datetime-local" value={form.startDate} onChange={e => set('startDate', e.target.value)} /></FormGroup>
          <FormGroup label="End Date"><input className="input" type="datetime-local" value={form.endDate} onChange={e => set('endDate', e.target.value)} /></FormGroup>
          <div className="flex gap-3 mt-4">
            <button className="btn btn-ghost w-full" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary w-full" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </Modal>
      )}
      {deleteId && <ConfirmModal message="Delete this campaign?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}
