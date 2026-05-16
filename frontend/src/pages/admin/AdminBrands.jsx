import { useEffect, useState } from 'react';
import { brandsApi } from '../../api/client';
import { LoadingPage, Modal, FormGroup, StatusBadge, ConfirmModal, fmtDate, Empty } from '../../components/common';
import { Plus, Pencil, Trash2, Store } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | brand obj
  const [form, setForm] = useState({ name: '', logoUrl: '' });
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);
  function load() { brandsApi.getAll().then(r => setBrands(r.data)).finally(() => setLoading(false)); }
  function openCreate() { setForm({ name: '', logoUrl: '' }); setModal('create'); }
  function openEdit(b) { setForm({ name: b.name, logoUrl: b.logoUrl || '' }); setModal(b); }

  async function handleSave() {
    setSaving(true);
    try {
      if (modal === 'create') {
        const r = await brandsApi.create(form);
        setBrands(p => [...p, r.data]);
        toast.success('Brand created');
      } else {
        const r = await brandsApi.update(modal.id, form);
        setBrands(p => p.map(x => x.id === modal.id ? r.data : x));
        toast.success('Brand updated');
      }
      setModal(null);
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    setSaving(false);
  }

  async function handleDelete() {
    await brandsApi.delete(deleteId);
    setBrands(p => p.filter(x => x.id !== deleteId));
    setDeleteId(null);
    toast.success('Brand deleted');
  }

  if (loading) return <LoadingPage />;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Brands</h1>
          <p className="page-sub">{brands.length} brands</p></div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> New Brand</button>
      </div>

      {brands.length === 0 ? <Empty icon="🏪" title="No brands yet" sub="Create your first brand" /> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Manager</th><th>Status</th><th>Created</th><th></th></tr></thead>
            <tbody>
              {brands.map(b => (
                <tr key={b.id}>
                  <td className="text-muted">{b.id}</td>
                  <td><div className="flex items-center gap-2"><Store size={14} style={{ color: 'var(--accent)' }} /><strong>{b.name}</strong></div></td>
                  <td className="text-muted">{b.manager?.name || '—'}</td>
                  <td><StatusBadge status={b.isActive ? 'active' : 'inactive'} /></td>
                  <td className="text-muted">{fmtDate(b.createdAt)}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(b)}><Pencil size={13} /></button>
                      <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteId(b.id)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={modal === 'create' ? 'New Brand' : 'Edit Brand'} onClose={() => setModal(null)}>
          <FormGroup label="Brand Name">
            <input className="input" placeholder="e.g. Starbucks" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </FormGroup>
          <FormGroup label="Logo URL (optional)">
            <input className="input" placeholder="https://..." value={form.logoUrl} onChange={e => setForm(p => ({ ...p, logoUrl: e.target.value }))} />
          </FormGroup>
          <div className="flex gap-3 mt-4">
            <button className="btn btn-ghost w-full" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary w-full" onClick={handleSave} disabled={saving || !form.name}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </Modal>
      )}

      {deleteId && <ConfirmModal message="Delete this brand and all related data?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}
