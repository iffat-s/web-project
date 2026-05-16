import { useEffect, useState } from 'react';
import useBrand from '../../hooks/useBrand';
import { transactionsApi } from '../../api/client';
import { LoadingPage, StatusBadge, FiltersBar, fmtDateTime, fmt, Empty } from '../../components/common';

export default function BrandTransactions() {
  const { brand, loading: bLoading } = useBrand();
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    if (!brand) return;
    transactionsApi.getAll().then(r => {
      // Filter transactions for this brand
      const filtered = r.data.filter(t => t.brand?.id === brand.id);
      setTxns(filtered);
    }).finally(() => setLoading(false));
  }, [brand]);

  const filtered = txns.filter(t => {
    const q = search.toLowerCase();
    const mQ = !q || t.loyaltyProfile?.user?.name?.toLowerCase().includes(q) || t.brand?.name?.toLowerCase().includes(q);
    const mT = !typeFilter || t.type === typeFilter;
    return mQ && mT;
  });

  if (bLoading || loading) return <LoadingPage />;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Transactions</h1>
          <p className="page-sub">{brand?.name} · {txns.length} total</p></div>
      </div>
      <FiltersBar search={search} onSearch={setSearch}>
        <select className="input input-sm" style={{ width: 140 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="earn">Earn</option>
          <option value="redeem">Redeem</option>
        </select>
      </FiltersBar>
      {filtered.length === 0 ? <Empty icon="📊" title="No transactions found" /> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Customer</th><th>Brand</th><th>Type</th><th>Points</th><th>Amount</th><th>Date</th></tr></thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td><strong>{t.loyaltyProfile?.user?.name || '—'}</strong></td>
                  <td className="text-muted">{t.brand?.name || '—'}</td>
                  <td><StatusBadge status={t.type} /></td>
                  <td style={{ fontWeight: 700, color: t.points > 0 ? 'var(--success)' : 'var(--error)' }}>{t.points > 0 ? '+' : ''}{fmt(t.points)}</td>
                  <td className="text-muted">{t.purchaseAmount ? `$${t.purchaseAmount.toFixed(2)}` : '—'}</td>
                  <td className="text-muted">{fmtDateTime(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
