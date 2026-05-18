import { useEffect, useState, useMemo } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table';
import { transactionsApi } from '../../api/client';
import { LoadingPage, StatusBadge, FiltersBar, Pagination, SortIcon, fmtDateTime, fmt } from '../../components/common';

export default function AdminTransactions() {
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sorting, setSorting] = useState([{ id: 'createdAt', desc: true }]);

  useEffect(() => {
    transactionsApi.getAll().then(r => setTxns(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => txns.filter(t => {
    const q = search.toLowerCase();
    const matchQ = !q || t.loyaltyProfile?.user?.name?.toLowerCase().includes(q)
      || t.brand?.name?.toLowerCase().includes(q) || String(t.id).includes(q);
    const matchT = !typeFilter || t.type === typeFilter;
    return matchQ && matchT;
  }), [txns, search, typeFilter]);

  const columns = useMemo(() => [
    { accessorKey: 'id', header: 'ID', size: 60 },
    { accessorKey: 'loyaltyProfile.user.name', header: 'Customer', cell: i => i.row.original.loyaltyProfile?.user?.name || '—' },
    { accessorKey: 'brand.name', header: 'Brand', cell: i => i.row.original.brand?.name || '—' },
    { accessorKey: 'type', header: 'Type', cell: i => <StatusBadge status={i.getValue()} /> },
    { accessorKey: 'points', header: 'Points', cell: i => {
      const v = i.getValue();
      return <span style={{ color: v > 0 ? 'var(--success)' : 'var(--error)', fontWeight: 700 }}>{v > 0 ? '+' : ''}{fmt(v)}</span>;
    }},
    { accessorKey: 'purchaseAmount', header: 'Amount', cell: i => i.getValue() ? `$${i.getValue().toFixed(2)}` : '—' },
    { accessorKey: 'referenceNo', header: 'Ref#', cell: i => i.getValue() || '—' },
    { accessorKey: 'campaign.name', header: 'Campaign', cell: i => i.row.original.campaign?.name || '—' },
    { accessorKey: 'createdAt', header: 'Date', cell: i => fmtDateTime(i.getValue()) },
  ], []);

  const table = useReactTable({
    data: filtered, columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

  if (loading) return <LoadingPage />;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">All Transactions</h1>
          <p className="page-sub">{txns.length} total transactions</p></div>
      </div>
      <FiltersBar search={search} onSearch={setSearch}>
        <select className="input input-sm" style={{ width: 140 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="earn">Earn</option>
          <option value="redeem">Redeem</option>
          <option value="adjust">Adjust</option>
          <option value="expire">Expire</option>
        </select>
      </FiltersBar>
      <div className="table-wrap">
        <table>
          <thead>{table.getHeaderGroups().map(hg => (
            <tr key={hg.id}>{hg.headers.map(h => (
              <th key={h.id} className={h.column.getCanSort() ? 'sortable' : ''} onClick={h.column.getToggleSortingHandler()}>
                <span className="flex items-center gap-2">{flexRender(h.column.columnDef.header, h.getContext())}<SortIcon dir={h.column.getIsSorted()} /></span>
              </th>
            ))}</tr>
          ))}</thead>
          <tbody>{table.getRowModel().rows.map(row => (
            <tr key={row.id}>{row.getVisibleCells().map(cell => (
              <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
            ))}</tr>
          ))}</tbody>
        </table>
      </div>
      <Pagination table={table} />
    </div>
  );
}
