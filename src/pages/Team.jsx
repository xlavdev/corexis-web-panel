import { useState, useEffect } from 'react';
import api from '../services/api';
import { Users2, UserPlus, Trash2, Shield, Mail, Key, CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Team() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'admin' });
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await api.get('/team');
      if (res.data.success) {
        setMembers(res.data.team || []);
      }
    } catch (err) {
      console.error('Failed to load team:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setActionLoading(true);

    try {
      const res = await api.post('/team/create', form);
      if (res.data.success) {
        setSuccess(res.data.message || 'Operator account created.');
        setForm({ username: '', email: '', password: '', role: 'admin' });
        setShowAddModal(false);
        fetchTeam();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id, username) => {
    if (!window.confirm(`Are you sure you want to remove administrator '${username}'?`)) return;
    try {
      const res = await api.delete(`/team/${id}`);
      if (res.data.success) {
        fetchTeam();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete member.');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-custom-back border border-[#1a1a1a] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-mono mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>PRIVATE ACCESS ONLY</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Account Management</h1>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Public registration is disabled. Only you can create accounts here — each account gets its own Owner ID and its own separate applications.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError('');
            setSuccess('');
            setShowAddModal(true);
          }}
          className="cursor-pointer px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Account</span>
        </button>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Table of Members */}
      <div className="bg-custom-back border border-[#1a1a1a] rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[#121212] bg-[#121212]/50 text-blue-500 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3.5 px-4 font-semibold">Username</th>
              <th className="py-3.5 px-4 font-semibold">Email</th>
              <th className="py-3.5 px-4 font-semibold">Role</th>
              <th className="py-3.5 px-4 font-semibold">Created</th>
              <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1a]">
            {loading ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500">
                  Loading accounts...
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500">
                  No operator accounts found.
                </td>
              </tr>
            ) : (
              members.map((m) => (
                <tr key={m.id} className="hover:bg-[#1a1a1a]/60 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>{m.username}</span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-300 font-mono text-[11px]">{m.email}</td>
                  <td className="py-3.5 px-4">
                    <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full text-[10px] font-bold border border-blue-500/20 uppercase tracking-wider">
                      {m.role || 'Admin'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                    {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(m.id, m.username)}
                      title="Remove Administrator"
                      className="text-gray-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Administrator Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121216] border border-[#26262a] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Add New Account</h3>
                <p className="text-xs text-gray-400">The account can sign in and manage its own applications</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. operator1"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#18181f] border border-[#2a2a32] rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. operator@corexis.io"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#18181f] border border-[#2a2a32] rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter secure password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#18181f] border border-[#2a2a32] rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#18181f] border border-[#2a2a32] rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="admin">Standard Account (Full Access)</option>
                  <option value="reseller">Reseller (Key Issuance Only)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#202028] text-gray-300 hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {actionLoading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
