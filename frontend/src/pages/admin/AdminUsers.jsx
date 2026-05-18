import { useEffect, useState, useMemo } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table';
import { usersApi } from '../../api/client';
import { LoadingPage, StatusBadge, TierBadge, FiltersBar, Pagination, ConfirmModal, SortIcon, fmtDate, fmt } from '../../components/common';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [sorting, setSorting] = useState([]);

  // useEffect(() => {
  //   usersApi.getAll().then(r => setUsers(r.data || [])).finally(() => setLoading(false));
  // }, []);
  useEffect(() => {
    usersApi.getAll()
      .then(r => {
        console.log('Users API response:', r); // Debug log
        // If response is array directly
        if (Array.isArray(r.data)) {
          setUsers(r.data);
        } 
        // If response is wrapped in { data: [...] }
        else if (r.data?.data && Array.isArray(r.data.data)) {
          setUsers(r.data.data);
        }
        // If response is something else
        else {
          console.error('Unexpected response format:', r);
          setUsers([]);
        }
      })
      .catch(err => {
        console.error('Error fetching users:', err);
        toast.error('Failed to load users');
      })
      .finally(() => setLoading(false));
  }, []);
  const filtered = useMemo(() => {
    return users.filter(u => {
      const q = search.toLowerCase();
      const matchQ = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
      const matchR = !roleFilter || u.role === roleFilter;
      return matchQ && matchR;
    });
  }, [users, search, roleFilter]);

  const columns = useMemo(() => [
    { accessorKey: 'id', header: 'ID', size: 60 },
    { accessorKey: 'name', header: 'Name', cell: i => <strong>{i.getValue()}</strong> },
    { accessorKey: 'email', header: 'Email', cell: i => <span className="text-muted">{i.getValue()}</span> },
    { accessorKey: 'role', header: 'Role', cell: i => <StatusBadge status={i.getValue()} /> },
    { accessorKey: 'phone', header: 'Phone', cell: i => i.getValue() || '—' },
    { 
      id: 'brand', 
      header: 'Brand', 
      cell: ({ row }) => {
        const user = row.original;
        return user.role === 'brand_manager' 
          ? <span className="text-muted">{user.brand?.name || '— Not assigned —'}</span>
          : '—';
      }
    },
    { accessorKey: 'createdAt', header: 'Joined', cell: i => fmtDate(i.getValue()) },
    {
      id: 'actions', header: '', size: 60,
      cell: ({ row }) => (
        <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteId(row.original.id)}><Trash2 size={13} /></button>
      )
    },
  ], []);

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  async function handleDelete() {
    await usersApi.delete(deleteId);
    setUsers(u => u.filter(x => x.id !== deleteId));
    setDeleteId(null);
    toast.success('User deleted');
  }

  if (loading) return <LoadingPage />;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Users</h1>
          <p className="page-sub">{users.length} total users</p></div>
      </div>

      <FiltersBar search={search} onSearch={setSearch}>
        <select className="input input-sm" style={{ width: 160 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="brand_manager">Brand Manager</option>
          <option value="customer">Customer</option>
        </select>
      </FiltersBar>

      <div className="table-wrap">
        <table>
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(h => (
                  <th key={h.id} className={h.column.getCanSort() ? 'sortable' : ''} onClick={h.column.getToggleSortingHandler()}>
                    <span className="flex items-center gap-2">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      <SortIcon dir={h.column.getIsSorted()} />
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination table={table} />

      {deleteId && (
        <ConfirmModal
          message="Delete this user and all their data? This cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
