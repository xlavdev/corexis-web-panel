import { useEffect, useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import api from '../services/api';
import {
  Home, ChevronsRight, Filter, LayoutGrid, List, UsersRound, Timer, History,
  FileDown, RotateCcw, Trash2, MoreVertical, AlertCircle, Pencil, Pause,
  Play, Calendar, Copy, Check, UserRoundPen, Cpu, Layers, User, TriangleAlert
} from 'lucide-react';
import {
  Tip, InfoTip, KaModal, ModalFooter,
  KA_INPUT, KA_SELECT, KA_CHECK, KA_UNITS, unitToDays
} from '../components/ui/ka.jsx';

const FILTER_SELECT =
  'px-3 py-2 rounded-md bg-custom-back-1 text-white text-sm border border-custom-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors';

const BAN_DURATIONS = [
  { value: 315576000, label: 'Indefinite (Permanent)' },
  { value: 300, label: '5 Minutes' },
  { value: 900, label: '15 Minutes' },
  { value: 1800, label: '30 Minutes' },
  { value: 3600, label: '1 Hour' },
  { value: 7200, label: '2 Hours' },
  { value: 21600, label: '6 Hours' },
  { value: 43200, label: '12 Hours' },
  { value: 86400, label: '1 Day' },
  { value: 259200, label: '3 Days' },
  { value: 604800, label: '1 Week' },
  { value: 1209600, label: '2 Weeks' },
  { value: 2629743, label: '1 Month' },
  { value: 7889229, label: '3 Months' },
  { value: 15778458, label: '6 Months' },
  { value: 31556926, label: '1 Year' }
];

const fmtDate = (value) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString('en-US', {
    month: 'numeric', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', second: '2-digit'
  });
};

const toLocalInput = (date) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const defaultExpiry = () => toLocalInput(Date.now() + 30 * 86400000);

const activeSub = (user) =>
  (user?.subscriptions || []).find((s) => new Date(s.expiry).getTime() > Date.now()) || null;

const userStatus = (user) => {
  if (user.isBanned) return 'banned';
  if (user.isPaused) return 'paused';
  return activeSub(user) ? 'active' : 'expired';
};

const statusPill = (status) => {
  if (status === 'banned') return 'bg-red-600/20 text-red-400 border-red-600/30';
  if (status === 'expired') return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
  if (status === 'paused') return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
  return 'bg-green-600/20 text-green-400 border-green-600/30';
};

const statusLabel = (status) => {
  if (status === 'active') return 'Active';
  if (status === 'banned') return 'Banned';
  if (status === 'expired') return 'Expired';
  if (status === 'paused') return 'Paused';
  return status;
};

export default function Users() {
  const { selectedApp } = useAppContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('cards');
  const [sortField, setSortField] = useState('createdate');
  const [sortDir, setSortDir] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('');
  const [subscriptionFilter, setSubscriptionFilter] = useState('');
  const [pageSize, setPageSize] = useState(12);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [copied, setCopied] = useState('');
  const [toast, setToast] = useState('');

  // Create
  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: '', password: '', email: '', subscription: 'default',
    expiry: defaultExpiry(), hwidAffected: true
  });
  const [creating, setCreating] = useState(false);

  // Extend / Subtract
  const [extendModal, setExtendModal] = useState(false);
  const [subtractModal, setSubtractModal] = useState(false);
  const [extendForm, setExtendForm] = useState({
    target: '', subscription: 'default', expiry: 86400, time: '', activeOnly: false
  });
  const [subtractForm, setSubtractForm] = useState({
    target: '', subscription: 'default', expiry: 86400, time: '', activeOnly: false
  });

  // Delete
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteMode, setDeleteMode] = useState('');
  const [singleDelete, setSingleDelete] = useState(null);

  // Pause
  const [pauseUser, setPauseUser] = useState(null);

  // Reset HWIDs
  const [resetAllModal, setResetAllModal] = useState(false);
  const [resetUser, setResetUser] = useState(null);
  const [resetMode, setResetMode] = useState('all');
  const [resetHwidValue, setResetHwidValue] = useState('');

  // Ban
  const [banUser, setBanUser] = useState(null);
  const [banForm, setBanForm] = useState({ reason: '', duration: 315576000 });

  // Edit
  const [editUser, setEditUser] = useState(null);
  const [editTab, setEditTab] = useState('account');
  const [editForm, setEditForm] = useState({ username: '', password: '', email: '', hwid: '', hwidAffected: false });
  const [editSubs, setEditSubs] = useState([]);
  const [editSubIndex, setEditSubIndex] = useState(0);
  const [showIp, setShowIp] = useState(false);

  const notify = (text) => setToast(text);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchUsers = async () => {
    if (!selectedApp) return;
    setLoading(true);
    try {
      const res = await api.get(`/apps/${selectedApp._id}/users`, { params: { limit: 1000 } });
      if (res.data.success) setUsers(res.data.users || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedApp]);

  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
  }, [search, statusFilter, subscriptionFilter, sortField, sortDir, pageSize, selectedApp]);

  const subscriptionNames = useMemo(() => {
    const names = new Set(['default']);
    users.forEach((u) => (u.subscriptions || []).forEach((s) => s.subscription && names.add(s.subscription)));
    return [...names];
  }, [users]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = users.filter((u) => {
      if (term) {
        const haystack = [u.username, u.email, u.hwid, u.ip].join(' ').toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (statusFilter && userStatus(u) !== statusFilter) return false;
      if (subscriptionFilter) {
        const names = (u.subscriptions || []).map((s) => s.subscription);
        if (subscriptionFilter === 'no_subscription') {
          if (names.length > 0) return false;
        } else if (!names.includes(subscriptionFilter)) {
          return false;
        }
      }
      return true;
    });

    const dir = sortDir === 'asc' ? 1 : -1;
    list = [...list].sort((a, b) => {
      let av;
      let bv;
      switch (sortField) {
        case 'username': av = a.username || ''; bv = b.username || ''; break;
        case 'email': av = a.email || ''; bv = b.email || ''; break;
        case 'hwid': av = a.hwid || ''; bv = b.hwid || ''; break;
        case 'lastlogin': av = a.lastLogin ? new Date(a.lastLogin).getTime() : 0; bv = b.lastLogin ? new Date(b.lastLogin).getTime() : 0; break;
        case 'hwidAffected': av = a.hwid ? 1 : 0; bv = b.hwid ? 1 : 0; break;
        default: av = new Date(a.createdAt).getTime(); bv = new Date(b.createdAt).getTime();
      }
      if (typeof av === 'string') return av.localeCompare(bv) * dir;
      return (av - bv) * dir;
    });
    return list;
  }, [users, search, statusFilter, subscriptionFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const allOnPageSelected = pageItems.length > 0 && pageItems.every((u) => selectedIds.includes(u._id));
  const selectedUsers = users.filter((u) => selectedIds.includes(u._id));

  const toggleSelectAll = () => {
    if (allOnPageSelected) {
      setSelectedIds(selectedIds.filter((id) => !pageItems.some((u) => u._id === id)));
    } else {
      setSelectedIds([...new Set([...selectedIds, ...pageItems.map((u) => u._id)])]);
    }
  };

  const copyText = (text, label = 'Copied to clipboard.') => {
    navigator.clipboard.writeText(text || '');
    setCopied(text || '');
    notify(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    setCreating(true);
    try {
      const target = new Date(createForm.expiry).getTime();
      const days = Math.max(1, Math.ceil((target - Date.now()) / 86400000));
      const res = await api.post(`/apps/${selectedApp._id}/users`, {
        username: createForm.username,
        password: createForm.password,
        email: createForm.email,
        subscription: createForm.subscription,
        expiration: days,
        hwid: ''
      });
      if (res.data.success) {
        setCreateModal(false);
        setCreateForm({
          username: '', password: '', email: '', subscription: 'default',
          expiry: defaultExpiry(), hwidAffected: true
        });
        fetchUsers();
        notify('User created.');
      }
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setCreating(false);
    }
  };

  const resolveTargets = (form, selectedKey) => {
    if (form.target === 'all') return users;
    if (form.target === selectedKey) return selectedUsers;
    if (form.target) return users.filter((u) => u.username === form.target);
    return [];
  };

  const handleExtend = async (e) => {
    e.preventDefault();
    const targets = resolveTargets(extendForm, 'extendselected');
    if (targets.length === 0) {
      notify('Please select at least one user.');
      return;
    }
    const days = unitToDays(extendForm.time, extendForm.expiry);
    if (!days) {
      notify('Please enter an expiry duration.');
      return;
    }
    const list = extendForm.activeOnly ? targets.filter((u) => userStatus(u) === 'active') : targets;
    if (list.length === 0) {
      notify('No active users matched.');
      return;
    }
    try {
      for (const user of list) {
        await api.post(`/users/${user._id}/extend`, { days, subscription: extendForm.subscription });
      }
      setExtendModal(false);
      setExtendForm({ target: '', subscription: 'default', expiry: 86400, time: '', activeOnly: false });
      setSelectedIds([]);
      fetchUsers();
      notify(`Extended ${list.length} user(s).`);
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to extend user(s).');
    }
  };

  const handleSubtract = async (e) => {
    e.preventDefault();
    const targets = resolveTargets(subtractForm, 'subtractselected');
    if (targets.length === 0) {
      notify('Please select at least one user.');
      return;
    }
    const days = unitToDays(subtractForm.time, subtractForm.expiry);
    if (!days) {
      notify('Please enter an expiry duration.');
      return;
    }
    const list = subtractForm.activeOnly ? targets.filter((u) => userStatus(u) === 'active') : targets;
    if (list.length === 0) {
      notify('No active users matched.');
      return;
    }
    try {
      for (const user of list) {
        await api.post(`/users/${user._id}/extend`, { days: -days, subscription: subtractForm.subscription });
      }
      setSubtractModal(false);
      setSubtractForm({ target: '', subscription: 'default', expiry: 86400, time: '', activeOnly: false });
      setSelectedIds([]);
      fetchUsers();
      notify(`Subtracted time from ${list.length} user(s).`);
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to subtract time.');
    }
  };

  const handleBulkDelete = async (e) => {
    e.preventDefault();
    let targets = [];
    if (deleteMode === 'deleteselected') targets = selectedUsers;
    else if (deleteMode === 'delusers') targets = users;
    else if (deleteMode === 'delexpusers') targets = users.filter((u) => userStatus(u) === 'expired');
    else if (deleteMode === 'unbanall') targets = users.filter((u) => u.isBanned);

    if (targets.length === 0) {
      notify('No users match this selection.');
      return;
    }

    try {
      if (deleteMode === 'unbanall') {
        for (const user of targets) await api.post(`/users/${user._id}/unban`);
        notify(`Unbanned ${targets.length} user(s).`);
      } else {
        for (const user of targets) await api.delete(`/users/${user._id}`);
        notify(`Deleted ${targets.length} user(s).`);
      }
      setDeleteModal(false);
      setDeleteMode('');
      setSelectedIds([]);
      fetchUsers();
    } catch (err) {
      notify(err.response?.data?.message || 'Action failed.');
    }
  };

  const handleSingleDelete = async () => {
    if (!singleDelete) return;
    try {
      await api.delete(`/users/${singleDelete._id}`);
      notify('User deleted.');
      setSingleDelete(null);
      setSelectedIds((ids) => ids.filter((id) => id !== singleDelete._id));
      fetchUsers();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handlePause = async (e) => {
    e.preventDefault();
    if (!pauseUser) return;
    const next = !pauseUser.isPaused;
    try {
      await api.put(`/users/${pauseUser._id}`, { isPaused: next });
      notify(next ? 'User paused.' : 'User unpaused.');
      setPauseUser(null);
      fetchUsers();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to update user.');
    }
  };

  const handleBan = async (e) => {
    e.preventDefault();
    if (!banUser) return;
    try {
      await api.post(`/users/${banUser._id}/ban`, {
        reason: banForm.reason || 'Banned by administrator',
        duration: Number(banForm.duration)
      });
      notify('User banned.');
      setBanUser(null);
      setBanForm({ reason: '', duration: 315576000 });
      fetchUsers();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to ban user.');
    }
  };

  const handleUnban = async (user) => {
    try {
      await api.post(`/users/${user._id}/unban`);
      notify('User unbanned.');
      setMenuOpen(null);
      fetchUsers();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to unban user.');
    }
  };

  const openResetHwid = (user) => {
    setResetUser(user);
    setResetMode('all');
    setResetHwidValue('');
    setMenuOpen(null);
  };

  const handleResetHwid = async (e) => {
    e.preventDefault();
    if (!resetUser) return;
    try {
      if (resetMode === 'specific') {
        if (!resetHwidValue.trim() || resetHwidValue.trim() !== (resetUser.hwid || '')) {
          notify('That HWID was not found for this user.');
          return;
        }
        await api.put(`/users/${resetUser._id}`, { hwid: '' });
      } else {
        await api.post(`/users/${resetUser._id}/reset-hwid`);
      }
      notify('HWID reset successfully.');
      setResetUser(null);
      fetchUsers();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to reset HWID.');
    }
  };

  const handleResetAll = async (e) => {
    e.preventDefault();
    try {
      for (const user of users) {
        await api.post(`/users/${user._id}/reset-hwid`);
      }
      setResetAllModal(false);
      fetchUsers();
      notify('All HWIDs have been reset.');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to reset HWIDs.');
    }
  };

  const openEdit = (user) => {
    setEditTab('account');
    setShowIp(false);
    setEditForm({
      username: user.username || '',
      password: '',
      email: user.email || '',
      hwid: user.hwid || '',
      hwidAffected: !!user.hwid
    });
    setEditSubs((user.subscriptions || []).map((s) => ({ ...s })));
    setEditSubIndex(0);
    setEditUser(user);
    setMenuOpen(null);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    try {
      await api.put(`/users/${editUser._id}`, {
        username: editForm.username,
        password: editForm.password || undefined,
        email: editForm.email,
        hwid: editForm.hwidAffected ? editForm.hwid : '',
        subscriptions: editSubs
      });
      notify('User updated.');
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to update user.');
    }
  };

  const deleteSelectedSub = () => {
    setEditSubs(editSubs.filter((_, i) => i !== editSubIndex));
    setEditSubIndex(0);
  };

  const exportUsers = (format) => {
    setExportOpen(false);
    if (filtered.length === 0) {
      notify('There are no users to export.');
      return;
    }
    let content;
    if (format === 'json') {
      content = JSON.stringify(
        filtered.map((u) => ({
          username: u.username,
          email: u.email || '',
          hwid: u.hwid || '',
          ip: u.ip || '',
          status: statusLabel(userStatus(u)),
          subscription: activeSub(u)?.subscription || '',
          expiry: activeSub(u)?.expiry || null,
          createdAt: u.createdAt,
          lastLogin: u.lastLogin
        })),
        null,
        2
      );
    } else {
      const header = 'username,email,hwid,ip,status,subscription,expiry,createdAt,lastLogin';
      content = [
        header,
        ...filtered.map((u) => [
          u.username,
          `"${(u.email || '').replace(/"/g, '""')}"`,
          u.hwid || '',
          u.ip || '',
          statusLabel(userStatus(u)),
          activeSub(u)?.subscription || '',
          activeSub(u)?.expiry || '',
          u.createdAt,
          u.lastLogin
        ].join(','))
      ].join('\n');
    }
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${selectedApp?.name || 'app'}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const actionBtn = 'relative p-2.5 rounded-lg transition group focus:outline-none';

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="mb-4 p-8 bg-custom-back rounded-lg">
        <nav className="flex mb-5" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <a href="/app" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white">
                <Home size={12} className="mr-2.5" />
                Manage Apps
              </a>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronsRight size={14} className="mr-2 text-gray-400" />
                <label className="inline-flex items-center text-sm font-medium text-gray-400">
                  Current Application: {selectedApp?.name || 'COREXIS'}
                </label>
              </div>
            </li>
          </ol>
        </nav>
        <h1 className="text-xl font-semibold text-white sm:text-2xl">Users</h1>
        <p className="text-xs text-gray-500">
          After someone registers for your app with a license, they will appear here.{' '}
          <a
            href="https://keyauthdocs.apidog.io/dashboard/app/users"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline"
          >
            Learn More
          </a>
          .
        </p>
      </div>

      {/* Main card */}
      <div className="p-4 flex flex-col bg-custom-back rounded-lg">
        <div className="overflow-x-auto">
          {/* Search + actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <input
              id="users-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Users..."
              className="px-3 py-2 rounded-md bg-custom-back-1 text-white placeholder-gray-400 w-full sm:max-w-sm border border-custom-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />

            <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
              <button
                id="toggle-users-filters"
                onClick={() => setShowFilters((v) => !v)}
                className={`${actionBtn} bg-blue-600/20 hover:bg-blue-600/40 border border-blue-600/30 text-blue-400`}
              >
                <Filter size={16} className="transition-all duration-200 group-hover:scale-110" />
                <Tip>Toggle Filters</Tip>
              </button>

              <button
                id="toggle-view-mode-users"
                onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
                className={`${actionBtn} bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-600/30 text-cyan-400`}
              >
                {viewMode === 'cards' ? <LayoutGrid size={16} /> : <List size={16} />}
                <Tip>Toggle View</Tip>
              </button>

              <button
                onClick={() => setCreateModal(true)}
                className={`${actionBtn} bg-green-600/20 hover:bg-green-600/40 border border-green-600/30 text-green-400`}
              >
                <UsersRound size={16} className="transition-all duration-200 group-hover:scale-125 group-hover:-rotate-6 group-hover:text-white" />
                <Tip>Create New User</Tip>
              </button>

              <button
                onClick={() => {
                  setExtendForm((f) => ({
                    ...f,
                    target: selectedIds.length ? 'extendselected' : ''
                  }));
                  setExtendModal(true);
                }}
                className={`${actionBtn} bg-blue-600/20 hover:bg-blue-600/40 border border-blue-600/30 text-blue-400`}
              >
                <Timer size={16} className="transition-all duration-200 group-hover:scale-125 group-hover:rotate-12 group-hover:text-blue-400" />
                <Tip>Extend Expiration</Tip>
              </button>

              <button
                onClick={() => {
                  setSubtractForm((f) => ({
                    ...f,
                    target: selectedIds.length ? 'subtractselected' : ''
                  }));
                  setSubtractModal(true);
                }}
                className={`${actionBtn} bg-yellow-600/20 hover:bg-yellow-600/40 border border-yellow-600/30 text-yellow-400`}
              >
                <History size={16} className="transition-all duration-200 group-hover:scale-110 group-hover:-rotate-6 group-hover:text-yellow-300" />
                <Tip>Subtract Expiration</Tip>
              </button>

              <div className="relative inline-block text-left">
                <button
                  id="exportToggle"
                  onClick={() => setExportOpen((v) => !v)}
                  className={`${actionBtn} bg-purple-600/20 hover:bg-purple-600/40 border border-purple-600/30 text-purple-400`}
                >
                  <FileDown size={16} className="transition-all duration-200 group-hover:scale-125 group-hover:rotate-3 group-hover:text-green-400" />
                  <Tip>Export User(s)</Tip>
                </button>
                {exportOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} />
                    <div className="absolute right-0 z-20 w-48 mt-2 bg-custom-back-1 rounded shadow-md text-white">
                      <button onClick={() => exportUsers('json')} className="block w-full px-4 py-2 text-left text-sm hover:bg-blue-600 rounded-t">
                        Export JSON
                      </button>
                      <button onClick={() => exportUsers('csv')} className="block w-full px-4 py-2 text-left text-sm hover:bg-blue-600 rounded-b">
                        Export CSV
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => setResetAllModal(true)}
                className={`${actionBtn} bg-yellow-600/20 hover:bg-yellow-600/40 border border-yellow-600/30 text-yellow-400`}
              >
                <RotateCcw size={16} className="transition-all duration-200 group-hover:scale-110 group-hover:-rotate-12" />
                <Tip>Reset All HWIDs</Tip>
              </button>

              <button
                onClick={() => {
                  setDeleteMode(selectedIds.length ? 'deleteselected' : '');
                  setDeleteModal(true);
                }}
                className={`${actionBtn} bg-red-600/20 hover:bg-red-600/40 border border-red-600/30 text-red-400`}
              >
                <Trash2 size={16} className="transition-all duration-200 group-hover:scale-125 group-hover:rotate-6 group-hover:text-red-400" />
                <Tip side="left">Delete Options</Tip>
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div id="users-filters" className="flex gap-3 mb-4 p-3 bg-custom-back-1/50 rounded-lg border border-custom transition-all duration-300">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-400 mb-1 font-medium">Sort By</label>
                  <select id="sortField" value={sortField} onChange={(e) => setSortField(e.target.value)} className={FILTER_SELECT}>
                    <option value="createdate">Creation Date</option>
                    <option value="username">Username</option>
                    <option value="email">Email</option>
                    <option value="hwid">HWID</option>
                    <option value="lastlogin">Last Login</option>
                    <option value="hwidAffected">HWID Affected</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs text-gray-400 mb-1 font-medium">Order</label>
                  <select id="sortDir" value={sortDir} onChange={(e) => setSortDir(e.target.value)} className={FILTER_SELECT}>
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs text-gray-400 mb-1 font-medium">Status</label>
                  <select id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={FILTER_SELECT}>
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs text-gray-400 mb-1 font-medium">Subscription</label>
                  <select id="subscriptionFilter" value={subscriptionFilter} onChange={(e) => setSubscriptionFilter(e.target.value)} className={FILTER_SELECT}>
                    <option value="">All Subscriptions</option>
                    <option value="no_subscription">No Subscription</option>
                    {subscriptionNames.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs text-gray-400 mb-1 font-medium">Per Page</label>
                  <select id="page-size-selector" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className={FILTER_SELECT}>
                    <option value={12}>12 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={75}>75 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* List */}
          <div className="relative shadow-md sm:rounded-lg pt-5">
            <div className="flex items-center justify-between mb-4">
              <label className="inline-flex items-center text-white text-sm cursor-pointer">
                <input
                  id="select-all-checkbox"
                  type="checkbox"
                  checked={allOnPageSelected}
                  onChange={toggleSelectAll}
                  className={`${KA_CHECK} mr-2 ml-2`}
                />
                Select All
              </label>
            </div>

            {viewMode === 'cards' ? (
              <div id="users-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-visible">
                {loading ? (
                  <div className="col-span-full text-center text-gray-400 py-10">Loading users...</div>
                ) : pageItems.length === 0 ? (
                  <div className="col-span-full text-center text-gray-400 py-10 flex flex-col items-center gap-3">
                    <div>👤 Get started by creating your first user.</div>
                    <p className="text-xs text-gray-500">
                      {users.length > 0 && 'No users match your current filters.'}
                    </p>
                    <button
                      onClick={() => setCreateModal(true)}
                      className="inline-flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 font-medium rounded-lg text-sm px-4 py-2 transition"
                    >
                      <UsersRound size={14} />
                      Create User
                    </button>
                  </div>
                ) : (
                  pageItems.map((user) => {
                    const status = userStatus(user);
                    const checked = selectedIds.includes(user._id);
                    return (
                      <div
                        key={user._id}
                        className="bg-custom-back-1 rounded-xl p-4 text-white shadow-md hover:shadow-blue-500/30 transition duration-200 relative overflow-visible"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                setSelectedIds(
                                  checked ? selectedIds.filter((id) => id !== user._id) : [...selectedIds, user._id]
                                )
                              }
                              className="appearance-none w-4 h-4 rounded border border-custom-1 bg-custom-back checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="font-semibold text-sm truncate">{user.username}</span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-1">
                              <span className={`px-2 py-1 text-xs rounded-full border ${statusPill(status)}`}>
                                Status: {statusLabel(status)}
                              </span>
                            </div>

                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setMenuOpen(menuOpen === user._id ? null : user._id)}
                                className="p-1 rounded hover:bg-gray-600/40"
                              >
                                <MoreVertical size={20} />
                              </button>

                              {menuOpen === user._id && (
                                <>
                                  <div className="fixed inset-0 z-[9998]" onClick={() => setMenuOpen(null)} />
                                  <div className="absolute right-0 mt-1 w-40 max-h-[250px] overflow-y-auto bg-custom-back-1 border border-custom rounded shadow-lg z-[9999]">
                                    <button type="button" onClick={() => openEdit(user)} className="block w-full text-left px-3 py-2 hover:bg-blue-600 text-sm transition-colors duration-200">
                                      Edit
                                    </button>
                                    {user.isBanned ? (
                                      <button type="button" onClick={() => handleUnban(user)} className="block w-full text-left px-3 py-2 hover:bg-green-600 text-sm transition-colors duration-200">
                                        Unban
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => { setBanUser(user); setBanForm({ reason: '', duration: 315576000 }); setMenuOpen(null); }}
                                        className="block w-full text-left px-3 py-2 hover:bg-gray-600 text-sm transition-colors duration-200"
                                      >
                                        Ban
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => { setPauseUser(user); setMenuOpen(null); }}
                                      className="block w-full text-left px-3 py-2 hover:bg-yellow-600 text-sm transition-colors duration-200"
                                    >
                                      {user.isPaused ? 'Unpause' : 'Pause'}
                                    </button>
                                    <button type="button" onClick={() => openResetHwid(user)} className="block w-full text-left px-3 py-2 hover:bg-purple-600 text-sm transition-colors duration-200">
                                      Reset HWID
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => { setSingleDelete(user); setMenuOpen(null); }}
                                      className="block w-full text-left px-3 py-2 hover:bg-red-600 text-sm transition-colors duration-200"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between text-xs mb-1">
                          <div>
                            <p>Created: <span className="text-gray-400">{fmtDate(user.createdAt)}</span></p>
                            <p>IP: <span className="text-gray-400">{user.ip || 'N/A'}</span></p>
                            <p>Cooldown: <span className="text-gray-400">N/A</span></p>
                          </div>

                          <div className="text-right">
                            <p>Last Login: <span className="text-gray-400">{fmtDate(user.lastLogin)}</span></p>
                            <p>2FA: <span className="text-gray-400">Disabled</span></p>
                            <p>HWID Affected: <span className="text-gray-400">{user.hwid ? 'Yes' : 'No'}</span></p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-white">
                  <thead>
                    <tr className="text-blue-700 border-b border-custom">
                      <th className="px-3 py-3 w-10">
                        <input type="checkbox" checked={allOnPageSelected} onChange={toggleSelectAll} className={KA_CHECK} />
                      </th>
                      <th className="px-3 py-3 font-normal">Username</th>
                      <th className="px-3 py-3 font-normal">Email</th>
                      <th className="px-3 py-3 font-normal">HWID</th>
                      <th className="px-3 py-3 font-normal">IP</th>
                      <th className="px-3 py-3 font-normal">Subscription</th>
                      <th className="px-3 py-3 font-normal">Status</th>
                      <th className="px-3 py-3 font-normal">Last Login</th>
                      <th className="px-3 py-3 font-normal text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-custom">
                    {loading ? (
                      <tr><td colSpan={9} className="text-center py-10 text-gray-400">Loading users...</td></tr>
                    ) : pageItems.length === 0 ? (
                      <tr><td colSpan={9} className="text-center py-10 text-gray-400">👤 Get started by creating your first user.</td></tr>
                    ) : (
                      pageItems.map((user) => {
                        const status = userStatus(user);
                        const checked = selectedIds.includes(user._id);
                        return (
                          <tr key={user._id} className="hover:bg-custom-back-1/60 transition-colors">
                            <td className="px-3 py-3">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  setSelectedIds(
                                    checked ? selectedIds.filter((id) => id !== user._id) : [...selectedIds, user._id]
                                  )
                                }
                                className={KA_CHECK}
                              />
                            </td>
                            <td className="px-3 py-3 font-semibold">{user.username}</td>
                            <td className="px-3 py-3 text-gray-400">{user.email || '—'}</td>
                            <td className="px-3 py-3 font-mono text-xs text-gray-400 max-w-[160px] truncate">{user.hwid || '—'}</td>
                            <td className="px-3 py-3 font-mono text-xs text-gray-400">{user.ip || 'N/A'}</td>
                            <td className="px-3 py-3 text-gray-300">{activeSub(user)?.subscription || 'None'}</td>
                            <td className="px-3 py-3">
                              <span className={`px-2 py-1 text-xs rounded-full border ${statusPill(status)}`}>
                                {statusLabel(status)}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-gray-400 text-xs">{fmtDate(user.lastLogin)}</td>
                            <td className="px-3 py-3">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => openEdit(user)} title="Edit" className="p-1.5 rounded-md text-gray-500 hover:text-blue-400 hover:bg-blue-600/10">
                                  <Pencil size={14} />
                                </button>
                                <button onClick={() => setSingleDelete(user)} title="Delete" className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-600/10">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4 text-white">
              <button
                id="prevPage"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="cursor-pointer bg-custom-back-1 px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-custom-back-1"
              >
                Previous
              </button>
              <span id="pagination-info" className="text-sm">
                Showing page {currentPage} of {totalPages}
              </span>
              <button
                id="nextPage"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="cursor-pointer bg-custom-back-1 px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-custom-back-1"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {createModal && (
        <KaModal
          title="Create user"
          icon={<AlertCircle size={20} className="text-red-500" />}
          onClose={() => setCreateModal(false)}
        >
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="px-6 pb-4">
              <div className="relative w-full">
                <label className="text-gray-400 text-sm" htmlFor="username">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    id="username"
                    value={createForm.username}
                    onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                    className={KA_INPUT}
                    required
                  />
                  <InfoTip text="The username of the user you're creating." />
                </div>
              </div>

              <div className="relative w-full mt-5 mb-2">
                <label className="text-gray-400 text-sm" htmlFor="password">Password</label>
                <div className="flex items-center gap-3">
                  <input
                    type="password"
                    id="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className={KA_INPUT}
                  />
                  <InfoTip text="The password of the user you're creating." />
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Generate and store secure passwords with{' '}
                <a href="https://go.getproton.me/SH1Eq" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline mb-6">
                  Proton Pass
                </a>
              </p>

              <div className="relative w-full mt-5">
                <label className="text-gray-400 text-sm" htmlFor="email">Email</label>
                <div className="flex items-center gap-3">
                  <input
                    type="email"
                    id="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className={KA_INPUT}
                  />
                  <InfoTip text="The email of the user you're creating." />
                </div>
              </div>

              <div className="relative mt-5">
                <label className="text-gray-400 text-sm" htmlFor="sub">
                  Subscription <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <select
                    id="sub"
                    value={createForm.subscription}
                    onChange={(e) => setCreateForm({ ...createForm, subscription: e.target.value })}
                    className={KA_SELECT}
                    required
                  >
                    {subscriptionNames.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  <InfoTip text="The subscription you'd like to give the user." />
                </div>
              </div>

              <div className="relative w-full mt-5">
                <label className="text-gray-400 text-sm" htmlFor="expiry">
                  Expiration <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Calendar size={16} className="text-gray-500" />
                    </div>
                    <input
                      type="datetime-local"
                      id="expiry"
                      value={createForm.expiry}
                      onChange={(e) => setCreateForm({ ...createForm, expiry: e.target.value })}
                      className="block w-full pl-10 p-2.5 text-sm text-white bg-custom-back-1 border border-custom rounded-lg focus:outline-none focus:ring-0 focus:border-blue-500"
                      required
                    />
                  </div>
                  <InfoTip text="The date and time when the subscription will expire." />
                </div>
              </div>

              <label className="flex items-center gap-2 p-4 cursor-pointer">
                <input
                  type="checkbox"
                  id="hwidAffected"
                  checked={createForm.hwidAffected}
                  onChange={(e) => setCreateForm({ ...createForm, hwidAffected: e.target.checked })}
                  className={KA_CHECK}
                />
                <span className="text-white text-sm">HWID Affected</span>
                <span className="flex items-center">
                  <InfoTip text="Only 1 HWID per user is allowed.." />
                </span>
              </label>
            </div>

            <ModalFooter
              onCancel={() => setCreateModal(false)}
              submitLabel={creating ? 'Creating...' : 'Create User'}
              disabled={creating}
            />
          </form>
        </KaModal>
      )}

      {/* Extend User Modal */}
      {extendModal && (
        <KaModal
          title="Extend user(s)"
          icon={<AlertCircle size={20} className="text-red-500" />}
          onClose={() => setExtendModal(false)}
        >
          <form onSubmit={handleExtend} className="space-y-6">
            <div className="px-6 pb-4">
              <div className="relative w-full">
                <label className="text-gray-400 text-sm" htmlFor="extend-user-type">
                  Select User <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <select
                    id="extend-user-type"
                    value={extendForm.target}
                    onChange={(e) => setExtendForm({ ...extendForm, target: e.target.value })}
                    className={KA_SELECT}
                    required
                  >
                    <option value="">Choose an option...</option>
                    {selectedIds.length > 0 && <option value="extendselected">Extend Selected Users</option>}
                    <option value="all">All users</option>
                    {users.map((u) => (
                      <option key={u._id} value={u.username}>{u.username}</option>
                    ))}
                  </select>
                  <InfoTip text="The username of the user being extended." />
                </div>
              </div>

              {extendForm.target === 'extendselected' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Selected users to extend:
                  </label>
                  <div className="bg-custom-back-1 border border-gray-700 rounded-lg p-3 max-h-32 overflow-y-auto">
                    <ul className="text-sm text-gray-400 space-y-1">
                      {selectedUsers.map((u) => <li key={u._id}>{u.username}</li>)}
                    </ul>
                  </div>
                </div>
              )}

              <div className="relative mt-5">
                <label className="text-gray-400 text-sm" htmlFor="extend-sub">
                  Subscription <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <select
                    id="extend-sub"
                    value={extendForm.subscription}
                    onChange={(e) => setExtendForm({ ...extendForm, subscription: e.target.value })}
                    className={KA_SELECT}
                    required
                  >
                    {subscriptionNames.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  <InfoTip text="The subscription you'd like to give/extend the user." />
                </div>
              </div>

              <div className="relative mt-5">
                <label className="text-gray-400 text-sm" htmlFor="extend-expiry">
                  Expiry Unit <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <select
                    id="extend-expiry"
                    value={extendForm.expiry}
                    onChange={(e) => setExtendForm({ ...extendForm, expiry: Number(e.target.value) })}
                    className={KA_SELECT}
                    required
                  >
                    {KA_UNITS.map((u) => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                  <InfoTip text="The unit of time you'd like to extend the subscription for." />
                </div>
              </div>

              <div className="relative w-full mt-5">
                <label className="text-gray-400 text-sm" htmlFor="extend-time">
                  Expiry Duration <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    id="extend-time"
                    value={extendForm.time}
                    onChange={(e) => setExtendForm({ ...extendForm, time: e.target.value })}
                    className={KA_INPUT}
                    required
                  />
                  <InfoTip text="The amount of time you'd like to add to the users subscription." />
                </div>
              </div>

              <label className="flex items-center space-x-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="activeOnly"
                  checked={extendForm.activeOnly}
                  onChange={(e) => setExtendForm({ ...extendForm, activeOnly: e.target.checked })}
                  className={KA_CHECK}
                />
                <span className="text-white text-sm">Active Users Only</span>
              </label>
            </div>

            <ModalFooter onCancel={() => setExtendModal(false)} submitLabel="Extend User(s)" />
          </form>
        </KaModal>
      )}

      {/* Subtract User Modal */}
      {subtractModal && (
        <KaModal
          title="Subtract user(s)"
          icon={<AlertCircle size={20} className="text-red-500" />}
          onClose={() => setSubtractModal(false)}
        >
          <form onSubmit={handleSubtract} className="space-y-6">
            <div className="px-6 pb-4">
              <div className="relative w-full">
                <label className="text-gray-400 text-sm" htmlFor="subtract-user-type">
                  Select User <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <select
                    id="subtract-user-type"
                    value={subtractForm.target}
                    onChange={(e) => setSubtractForm({ ...subtractForm, target: e.target.value })}
                    className={KA_SELECT}
                    required
                  >
                    <option value="">Choose an option...</option>
                    {selectedIds.length > 0 && <option value="subtractselected">Subtract Selected Users</option>}
                    <option value="all">All users</option>
                    {users.map((u) => (
                      <option key={u._id} value={u.username}>{u.username}</option>
                    ))}
                  </select>
                  <InfoTip text="The username of the user having time subtracted." />
                </div>
              </div>

              {subtractForm.target === 'subtractselected' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Selected users to subtract time from:
                  </label>
                  <div className="bg-custom-back-1 border border-gray-700 rounded-lg p-3 max-h-32 overflow-y-auto">
                    <ul className="text-sm text-gray-400 space-y-1">
                      {selectedUsers.map((u) => <li key={u._id}>{u.username}</li>)}
                    </ul>
                  </div>
                </div>
              )}

              <div className="relative mt-5">
                <label className="text-gray-400 text-sm" htmlFor="subtract-sub">
                  Subscription <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <select
                    id="subtract-sub"
                    value={subtractForm.subscription}
                    onChange={(e) => setSubtractForm({ ...subtractForm, subscription: e.target.value })}
                    className={KA_SELECT}
                    required
                  >
                    {subscriptionNames.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  <InfoTip text="The subscription you'd like to subtract time from." />
                </div>
              </div>

              <div className="relative mt-5">
                <label className="text-gray-400 text-sm" htmlFor="subtract-expiry">
                  Expiry Unit <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <select
                    id="subtract-expiry"
                    value={subtractForm.expiry}
                    onChange={(e) => setSubtractForm({ ...subtractForm, expiry: Number(e.target.value) })}
                    className={KA_SELECT}
                    required
                  >
                    {KA_UNITS.map((u) => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                  <InfoTip text="The unit of time you'd like to subtract from the subscription." />
                </div>
              </div>

              <div className="relative w-full mt-5">
                <label className="text-gray-400 text-sm" htmlFor="subtract-time">
                  Expiry Duration <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    id="subtract-time"
                    value={subtractForm.time}
                    onChange={(e) => setSubtractForm({ ...subtractForm, time: e.target.value })}
                    className={KA_INPUT}
                    required
                  />
                  <InfoTip text="The amount of time you'd like to subtract from the users subscription." />
                </div>
              </div>

              <label className="flex items-center space-x-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="subtract-activeOnly"
                  checked={subtractForm.activeOnly}
                  onChange={(e) => setSubtractForm({ ...subtractForm, activeOnly: e.target.checked })}
                  className={KA_CHECK}
                />
                <span className="text-white text-sm">Active Users Only</span>
              </label>
            </div>

            <ModalFooter onCancel={() => setSubtractModal(false)} submitLabel="Subtract Time From User(s)" />
          </form>
        </KaModal>
      )}

      {/* Delete Users Modal */}
      {deleteModal && (
        <KaModal
          title="Delete User(s)"
          icon={<TriangleAlert size={20} className="text-red-500" />}
          onClose={() => setDeleteModal(false)}
        >
          <form onSubmit={handleBulkDelete} className="space-y-6">
            <div className="px-6 pb-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="delete-type-users" className="block text-sm font-medium text-gray-300 mb-2">
                    Select deletion method:
                  </label>
                  <select
                    id="delete-type-users"
                    value={deleteMode}
                    onChange={(e) => setDeleteMode(e.target.value)}
                    className={KA_SELECT}
                    required
                  >
                    <option value="">Choose an option...</option>
                    {selectedIds.length > 0 && <option value="deleteselected">Delete Selected Users</option>}
                    <option value="delusers">Delete All Users</option>
                    <option value="delexpusers">Delete Expired Users</option>
                    <option value="unbanall">Unban All Users</option>
                  </select>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    This action cannot be undone. Please confirm your selection.
                  </p>
                </div>

                {deleteMode === 'deleteselected' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Selected users to delete:
                    </label>
                    <div className="bg-custom-back-1 border border-gray-700 rounded-lg p-3 max-h-32 overflow-y-auto">
                      <ul className="text-sm text-gray-400 space-y-1">
                        {selectedUsers.map((u) => <li key={u._id}>{u.username}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <ModalFooter
              onCancel={() => setDeleteModal(false)}
              submitLabel="Delete User(s)"
              danger
              disabled={!deleteMode}
            />
          </form>
        </KaModal>
      )}

      {/* Delete Single User Modal */}
      {singleDelete && (
        <KaModal
          title="Delete User"
          icon={<AlertCircle size={20} className="text-red-500" />}
          onClose={() => setSingleDelete(null)}
        >
          <form onSubmit={(e) => { e.preventDefault(); handleSingleDelete(); }} className="space-y-6">
            <div className="px-6 pb-2">
              <p className="text-gray-300 mb-4 text-sm">
                You're about to delete user:{' '}
                <span className="font-semibold text-white">{singleDelete.username}</span>.
              </p>
            </div>
            <ModalFooter onCancel={() => setSingleDelete(null)} submitLabel="Delete User" danger />
          </form>
        </KaModal>
      )}

      {/* Pause / Unpause User Modal */}
      {pauseUser && (
        <KaModal
          title={pauseUser.isPaused ? 'Unpause User' : 'Pause User'}
          icon={pauseUser.isPaused
            ? <Play size={20} className="text-green-500" />
            : <Pause size={20} className="text-yellow-500" />}
          onClose={() => setPauseUser(null)}
        >
          <form onSubmit={handlePause} className="space-y-6">
            <div className="px-6 pb-4">
              <p className="text-gray-300 mb-4 text-sm">
                {pauseUser.isPaused
                  ? 'Are you sure you want to unpause this user?'
                  : 'Are you sure you want to pause this user?'}
              </p>
            </div>
            <ModalFooter
              onCancel={() => setPauseUser(null)}
              submitLabel={pauseUser.isPaused ? 'Unpause' : 'Pause'}
              warning={!pauseUser.isPaused}
              success={pauseUser.isPaused}
            />
          </form>
        </KaModal>
      )}

      {/* Reset User HWID Modal */}
      {resetUser && (
        <KaModal
          title="Reset HWIDs"
          icon={<RotateCcw size={20} className="text-purple-500" />}
          onClose={() => setResetUser(null)}
        >
          <form onSubmit={handleResetHwid}>
            <div className="px-6 pb-4">
              <div className="space-y-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="resetHwidMode"
                    value="all"
                    checked={resetMode === 'all'}
                    onChange={() => setResetMode('all')}
                    className="w-4 h-4 accent-purple-600"
                  />
                  <span className="ml-3 text-sm text-gray-300">Reset all HWIDs</span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="resetHwidMode"
                    value="specific"
                    checked={resetMode === 'specific'}
                    onChange={() => setResetMode('specific')}
                    className="w-4 h-4 accent-purple-600"
                  />
                  <span className="ml-3 text-sm text-gray-300">Remove specific HWID</span>
                </label>

                {resetMode === 'specific' && (
                  <div className="mt-3">
                    <label className="text-gray-400 text-sm mb-2 block" htmlFor="specificHwidValue">
                      HWID value to remove
                    </label>
                    <input
                      type="text"
                      id="specificHwidValue"
                      value={resetHwidValue}
                      onChange={(e) => setResetHwidValue(e.target.value)}
                      placeholder="Enter HWID to remove"
                      className="w-full px-3 py-2 rounded-md bg-custom-back-1 text-white border border-custom placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="bg-custom-back-1 px-6 py-4">
              <div className="flex space-x-3 justify-end">
                <button
                  type="button"
                  onClick={() => setResetUser(null)}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Reset
                </button>
              </div>
            </div>
          </form>
        </KaModal>
      )}

      {/* Reset All Users HWID Modal */}
      {resetAllModal && (
        <KaModal
          title="Reset All Users HWID"
          icon={<RotateCcw size={20} className="text-yellow-500" />}
          onClose={() => setResetAllModal(false)}
        >
          <form onSubmit={handleResetAll}>
            <div className="px-6 pb-4">
              <div className="flex items-center p-4 mb-4 text-sm text-white border border-yellow-500 rounded-lg bg-custom-back-1" role="alert">
                <div>
                  <span className="font-medium">Warning!</span> You're about to reset the HWID for all users. Users will need to re-authenticate their devices.
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-4">Are you sure you want to reset the HWID of all users?</p>
            </div>
            <ModalFooter
              onCancel={() => setResetAllModal(false)}
              submitLabel="Yes, Reset All HWIDs"
              warning
            />
          </form>
        </KaModal>
      )}

      {/* Ban User Modal */}
      {banUser && (
        <KaModal
          title="Ban User"
          icon={<AlertCircle size={20} className="text-red-500" />}
          onClose={() => setBanUser(null)}
        >
          <form onSubmit={handleBan} className="space-y-6">
            <div className="px-6 pb-4">
              <div className="relative w-full mt-2">
                <label className="text-gray-400 text-sm" htmlFor="ban-reason">Ban Reason</label>
                <input
                  type="text"
                  maxLength="69"
                  id="ban-reason"
                  value={banForm.reason}
                  onChange={(e) => setBanForm({ ...banForm, reason: e.target.value })}
                  className={KA_INPUT}
                />
              </div>

              <div className="relative w-full mt-5">
                <label className="text-gray-400 text-sm" htmlFor="ban-duration">
                  Ban Duration <span className="text-red-500">*</span>
                </label>
                <select
                  id="ban-duration"
                  value={banForm.duration}
                  onChange={(e) => setBanForm({ ...banForm, duration: Number(e.target.value) })}
                  className={KA_SELECT}
                  required
                >
                  {BAN_DURATIONS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <ModalFooter onCancel={() => setBanUser(null)} submitLabel="Ban User" danger />
          </form>
        </KaModal>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <KaModal
          title="Edit User"
          icon={<UserRoundPen size={20} className="text-blue-500" />}
          onClose={() => setEditUser(null)}
          maxWidth="max-w-2xl"
        >
          <div className="flex justify-center px-6 pb-6">
            <div className="relative inline-flex rounded-2xl p-1 border border-white/10 bg-custom-back/90 gap-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_2px_10px_rgba(0,0,0,0.25)]">
              {[
                { id: 'account', label: 'Account', Icon: User },
                { id: 'hardware', label: 'Hardware', Icon: Cpu },
                { id: 'subscriptions', label: 'Subs & Variables', Icon: Layers }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setEditTab(tab.id)}
                  className={`relative z-10 inline-flex items-center px-5 py-2 rounded-xl font-semibold transition-colors ${
                    editTab === tab.id
                      ? 'bg-gray-600/30 text-white ring-1 ring-black/40'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <tab.Icon size={14} className="mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleEditSave} className="space-y-6">
            {editTab === 'account' && (
              <div className="px-6 py-4 space-y-4">
                <div className="relative">
                  <label className="text-gray-400 text-sm" htmlFor="edit-username">Username</label>
                  <input
                    type="text"
                    id="edit-username"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className={KA_INPUT}
                  />
                </div>
                <div className="relative">
                  <label className="text-gray-400 text-sm" htmlFor="edit-pass">Password</label>
                  <input
                    type="password"
                    id="edit-pass"
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    className={KA_INPUT}
                  />
                </div>
                <div className="relative">
                  <div className="flex items-center space-x-2">
                    <label className="text-gray-400 text-sm" htmlFor="edit-email">
                      Email <span className="text-gray-500">(leave empty to keep current)</span>
                    </label>
                    <span className="flex items-center">
                      <InfoTip text="For security, existing emails are hashed. Leave empty to keep current email, or enter a new email to change it." />
                    </span>
                  </div>
                  <input
                    type="email"
                    id="edit-email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className={KA_INPUT}
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm text-gray-400 mb-1">IP</label>
                  <div
                    onClick={() => setShowIp((v) => !v)}
                    className={`text-gray-300 transition-all select-none cursor-pointer ${showIp ? '' : 'blur-[2.5px]'}`}
                  >
                    {editUser.ip || 'N/A'}
                  </div>
                </div>
              </div>
            )}

            {editTab === 'hardware' && (
              <div className="px-6 py-4 space-y-4">
                <div className="relative">
                  <label className="text-gray-400 text-sm" htmlFor="edit-hwid-list">HWID(s)</label>
                  <button
                    type="button"
                    onClick={() => copyText(editForm.hwid, 'HWID copied.')}
                    className="absolute top-0 right-0 text-gray-400 hover:text-white transition text-xs font-medium flex items-center gap-1"
                    title="Copy to clipboard"
                  >
                    {copied === editForm.hwid && editForm.hwid ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    <span>Copy</span>
                  </button>
                  <select
                    id="edit-hwid-list"
                    value={editForm.hwid}
                    onChange={(e) => setEditForm({ ...editForm, hwid: e.target.value })}
                    className="w-full bg-custom-back-1 border border-custom text-white rounded px-2 py-2"
                  >
                    {editForm.hwid
                      ? <option value={editForm.hwid}>{editForm.hwid}</option>
                      : <option value="">No HWID</option>}
                  </select>
                </div>
                <div className="relative">
                  <label className="text-gray-400 text-sm" htmlFor="edit-hwid">Additional HWID</label>
                  <input
                    type="text"
                    id="edit-hwid"
                    value={editForm.hwid}
                    onChange={(e) => setEditForm({ ...editForm, hwid: e.target.value })}
                    className={KA_INPUT}
                  />
                </div>
                <label className="flex items-center gap-2 p-4 cursor-pointer">
                  <input
                    type="checkbox"
                    id="editHwidAffected"
                    checked={editForm.hwidAffected}
                    onChange={(e) => setEditForm({ ...editForm, hwidAffected: e.target.checked })}
                    className={KA_CHECK}
                  />
                  <span className="text-white text-sm">HWID Affected</span>
                  <span className="flex items-center">
                    <InfoTip text="Only 1 HWID per user is allowed.." />
                  </span>
                </label>
              </div>
            )}

            {editTab === 'subscriptions' && (
              <div className="px-6 py-4 space-y-4">
                <div className="relative">
                  <label className="text-gray-400 text-sm" htmlFor="edit-subs">Subscription(s)</label>
                  <div className="flex gap-2">
                    <select
                      id="edit-subs"
                      value={editSubIndex}
                      onChange={(e) => setEditSubIndex(Number(e.target.value))}
                      className="w-full bg-custom-back-1 border border-custom text-white rounded px-2 py-2"
                    >
                      {editSubs.length === 0 ? (
                        <option value={0}>No subscriptions</option>
                      ) : (
                        editSubs.map((s, i) => (
                          <option key={`${s.subscription}-${i}`} value={i}>
                            {s.subscription} — {fmtDate(s.expiry)}
                          </option>
                        ))
                      )}
                    </select>
                    <button
                      type="button"
                      onClick={deleteSelectedSub}
                      disabled={editSubs.length === 0}
                      className="px-3 py-2 text-sm bg-red-700 hover:bg-red-800 rounded text-white whitespace-nowrap disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <label className="text-gray-400 text-sm" htmlFor="edit-vars">User Variable(s)</label>
                  <div className="flex gap-2">
                    <select id="edit-vars" className="w-full bg-custom-back-1 border border-custom text-white rounded px-2 py-2">
                      <option value="">No variables</option>
                    </select>
                    <button
                      type="button"
                      disabled
                      className="px-3 py-2 text-sm bg-yellow-700 hover:bg-yellow-800 rounded text-white whitespace-nowrap disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            <ModalFooter onCancel={() => setEditUser(null)} submitLabel="Save Changes" />
          </form>
        </KaModal>
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 z-[10000] bg-custom-back-1 border border-custom text-white text-sm px-4 py-3 rounded-lg shadow-xl animate-fade-up">
          {toast}
        </div>
      )}
    </div>
  );
}
