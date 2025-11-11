import React, { useEffect, useMemo, useState } from 'react';
import { listUsers, type User } from './api';

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [openUserId, setOpenUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { users } = await listUsers();
        setUsers(users);
      } catch (e: any) {
        setError(e.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const baseMatch =
        u.username.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q));

      const accountMatch = Array.isArray(u.accounts) && u.accounts.some((a) => {
        return (
          (a.bankName && a.bankName.toLowerCase().includes(q)) ||
          (a.ifscCode && a.ifscCode.toLowerCase().includes(q)) ||
          (a.accountNumber && a.accountNumber.toLowerCase().includes(q)) ||
          (a.accountHolderName && a.accountHolderName.toLowerCase().includes(q)) ||
          (a.branchName && a.branchName.toLowerCase().includes(q))
        );
      });

      return baseMatch || accountMatch;
    });
  }, [users, query]);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handlePointerDown(e: MouseEvent | TouchEvent) {
      if (!openUserId) return;
      const el = document.getElementById(`dropdown-${openUserId}`);
      const target = (e as any).target as Node | null;
      if (el && target && el.contains(target)) return; // clicked inside
      setOpenUserId(null);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenUserId(null);
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openUserId]);

  return (
    <div className="container">
      <h1 className="heading">Admin • Users</h1>
      <div className="toolbar">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search username, email, bank name, IFSC, account number"
          className="input"
        />
        <div className="spacer" />
      </div>
      {error && (
        <div style={{ color: '#b00020', marginBottom: 12 }}>Error: {error}</div>
      )}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="card">
          <table className="table">
            <thead className="thead">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Accounts</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody className="tbody">
              {filtered.length === 0 ? (
                <tr className="row">
                  <td className="td" colSpan={5} style={{ textAlign: 'center', color: '#666' }}>No users found</td>
                </tr>
              ) : (
                filtered.map((u, idx) => (
                  <React.Fragment key={u.id}>
                    <tr className="row">
                      <td className="td">{idx + 1}</td>
                      <td className="td">{u.username}</td>
                      <td className="td">{u.email}</td>
                      <td className="td">
                        <div className="dropdown" id={`dropdown-${u.id}`}>
                          <button
                            className="dropdown-btn"
                            onClick={() => setOpenUserId(prev => (prev === u.id ? null : u.id))}
                            disabled={!u.accounts || u.accounts.length === 0}
                          >
                            Accounts ({u.accounts?.length ?? 0})
                          </button>
                          {openUserId === u.id && u.accounts && u.accounts.length > 0 && (
                            <div className="dropdown-menu" role="menu" aria-label={`Accounts for ${u.username}`}>
                              {u.accounts.map(a => (
                                <div key={a.id} className="dropdown-item">
                                  <div className="title">{a.bankName}</div>
                                  <div>Account: <code>{a.accountNumber}</code></div>
                                  <div>Holder: {a.accountHolderName}</div>
                                  <div>IFSC: {a.ifscCode}</div>
                                  <div>Branch: {a.branchName}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="td"><code>{u.id}</code></td>
                    </tr>
                    {/* Accounts shown via dropdown; expanded row removed. */}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}