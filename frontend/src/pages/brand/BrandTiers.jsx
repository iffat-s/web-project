import { useEffect, useState } from 'react';
import useBrand from '../../hooks/useBrand';
import { tiersApi } from '../../api/client';
import { LoadingPage, Modal, FormGroup, ConfirmModal, TierBadge, Empty } from '../../components/common';
import { Plus, Pencil, Trash2, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

const blank = { name: '', minPoints: 0, badgeIcon: '', perks: '' };

export default function BrandTiers() {
  const { brand, loading: bLoading } = useBrand();
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(blank);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [perksError, setPerksError] = useState('');

  useEffect(() => {
    if (!brand) return;
    tiersApi.getByBrand(brand.id).then(r => setTiers(r.data)).finally(() => setLoading(false));
  }, [brand]);

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); if (k === 'perks') setPerksError(''); }
  function openCreate() { setForm(blank); setModal('create'); }
  function openEdit(t) { setForm({ name: t.name, minPoints: t.minPoints, badgeIcon: t.badgeIcon || '', perks: t.perks ? JSON.stringify(t.perks, null, 2) : '' }); setModal(t); }

  async function handleSave() {
    let perks = null;
    if (form.perks) {
      try { perks = JSON.parse(form.perks); } catch { setPerksError('Invalid JSON'); return; }
    }
    setSaving(true);
    try {
      const payload = { name: form.name, minPoints: Number(form.minPoints), badgeIcon: form.badgeIcon || null, perks };
      if (modal === 'create') {
        const r = await tiersApi.create(brand.id, payload);
        setTiers(p => [...p, r.data]);
        toast.success('Tier created');
      } else {
        const r = await tiersApi.update(brand.id, modal.id, payload);
        setTiers(p => p.map(x => x.id === modal.id ? r.data : x));
        toast.success('Tier updated');
      }
      setModal(null);
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    setSaving(false);
  }

  async function handleDelete() {
    await tiersApi.delete(brand.id, deleteId);
    setTiers(p => p.filter(x => x.id !== deleteId));
    setDeleteId(null);
    toast.success('Deleted');
  }

  if (bLoading || loading) return <LoadingPage />;

  const sorted = [...tiers].sort((a, b) => a.minPoints - b.minPoints);

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Tier Levels</h1>
          <p className="page-sub">{brand?.name} · {tiers.length} tiers</p></div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> New Tier</button>
      </div>

      {tiers.length === 0 ? <Empty icon="🏆" title="No tiers yet" sub="Create loyalty tiers for your customers" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sorted.map(t => (
            <div className="card" key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Trophy size={24} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="flex items-center gap-3" style={{ marginBottom: 4 }}>
                  <TierBadge tier={t.name} />
                  <span className="text-muted text-sm">{t.minPoints.toLocaleString()} pts minimum</span>
                </div>
                {t.perks && <p className="text-muted text-sm font-mono">{JSON.stringify(t.perks)}</p>}
              </div>
              <div className="flex gap-2">
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(t)}><Pencil size={13} /></button>
                <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteId(t.id)}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal === 'create' ? 'New Tier' : 'Edit Tier'} onClose={() => setModal(null)}>
          <FormGroup label="Tier Name"><input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Gold, Silver, Platinum…" /></FormGroup>
          <FormGroup label="Minimum Points"><input className="input" type="number" min={0} value={form.minPoints} onChange={e => set('minPoints', e.target.value)} /></FormGroup>
          <FormGroup label="Badge Icon URL (optional)"><input className="input" value={form.badgeIcon} onChange={e => set('badgeIcon', e.target.value)} placeholder="https://…" /></FormGroup>
          <FormGroup label={`Perks (JSON, optional)`}>
            <textarea className="input font-mono" rows={4} value={form.perks} onChange={e => set('perks', e.target.value)} placeholder={'{\n  "discount": "10%",\n  "freeShipping": true\n}'} style={{ resize: 'vertical' }} />
            {perksError && <p style={{ color: 'var(--error)', fontSize: 12, marginTop: 4 }}>{perksError}</p>}
          </FormGroup>
          <div className="flex gap-3 mt-4">
            <button className="btn btn-ghost w-full" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary w-full" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </Modal>
      )}
      {deleteId && <ConfirmModal message="Delete this tier level?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}
