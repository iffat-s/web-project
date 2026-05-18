import { X, Search, ChevronUp, ChevronDown } from 'lucide-react';

// ─── MODAL ────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, size = '' }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${size === 'lg' ? 'modal-lg' : ''}`}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    pending: 'badge-warn',
    approved: 'badge-success',
    rejected: 'badge-error',
    redeemed: 'badge-success',
    fulfilled: 'badge-info',
    active: 'badge-success',
    inactive: 'badge-neutral',
    earn: 'badge-success',
    redeem: 'badge-gold',
    adjust: 'badge-info',
    expire: 'badge-error',
    true: 'badge-success',
    false: 'badge-neutral',
  };
  const labels = {
    redeemed: 'Redeemed ✓',
  };
  const displayLabel = labels[String(status)] || String(status);
  return <span className={`badge ${map[String(status)] || 'badge-neutral'}`}>{displayLabel}</span>;
}

// ─── TIER BADGE ───────────────────────────────────────────────────────────────
export function TierBadge({ tier }) {
  if (!tier) return <span className="tier-badge tier-default">—</span>;
  const t = tier.toLowerCase();
  const cls = t.includes('plat') ? 'tier-platinum' : t.includes('gold') ? 'tier-gold' : t.includes('silver') ? 'tier-silver' : t.includes('bronze') ? 'tier-bronze' : 'tier-default';
  return <span className={`tier-badge ${cls}`}>★ {tier}</span>;
}

// ─── SPINNER ──────────────────────────────────────────────────────────────────
export function Spinner() {
  return <div className="spinner" />;
}

export function LoadingPage() {
  return <div className="loading-page"><Spinner /></div>;
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
export function Empty({ icon = '📭', title = 'Nothing here yet', sub = '' }) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <h4>{title}</h4>
      {sub && <p>{sub}</p>}
    </div>
  );
}

// ─── SEARCH + FILTER BAR ──────────────────────────────────────────────────────
export function FiltersBar({ search, onSearch, children }) {
  return (
    <div className="filters-bar">
      <div className="search-wrap">
        <Search />
        <input
          className="input input-sm"
          placeholder="Search..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      {children}
    </div>
  );
}

// ─── SORT ICON ────────────────────────────────────────────────────────────────
export function SortIcon({ dir }) {
  if (!dir) return null;
  return dir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />;
}

// ─── CONFIRM DIALOG ───────────────────────────────────────────────────────────
export function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <Modal title="Confirm Action" onClose={onCancel}>
      <p style={{ color: 'var(--text2)', marginBottom: 24 }}>{message}</p>
      <div className="flex gap-3">
        <button className="btn btn-ghost w-full" onClick={onCancel}>Cancel</button>
        <button className="btn btn-danger w-full" onClick={onConfirm}>Confirm</button>
      </div>
    </Modal>
  );
}

// ─── PAGINATION ───────────────────────────────────────────────────────────────
export function Pagination({ table }) {
  return (
    <div className="flex items-center justify-between mt-4" style={{ color: 'var(--text2)', fontSize: 13 }}>
      <span>
        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        {' · '}{table.getFilteredRowModel().rows.length} rows
      </span>
      <div className="flex gap-2">
        <button className="btn btn-ghost btn-sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>← Prev</button>
        <button className="btn btn-ghost btn-sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next →</button>
      </div>
    </div>
  );
}

// ─── FORM HELPERS ─────────────────────────────────────────────────────────────
export function FormGroup({ label, children }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

// ─── FORMAT HELPERS ───────────────────────────────────────────────────────────
export function fmt(n) {
  return Number(n || 0).toLocaleString();
}

export function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function fmtDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
