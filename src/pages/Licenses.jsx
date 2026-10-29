import { useEffect, useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import api from '../services/api';
import {
  Home, ChevronsRight, Filter, LayoutGrid, List, Key, Timer, FileDown,
  Trash2, Copy, Check, Pencil, ShieldBan, AlertCircle
} from 'lucide-react';
import { Tip, InfoTip, KaModal, ModalFooter } from '../components/ui/ka.jsx';

const UNITS = [
  { value: 1, label: 'Seconds' },
  { value: 60, label: 'Minutes' },
  { value: 3600, label: 'Hours' },
  { value: 86400, label: 'Days' },
  { value: 604800, label: 'Weeks' },
  { value: 2629743, label: 'Months' },
  { value: 31556926, label: 'Years' },
  { value: 315569260, label: 'Lifetime' }
];

const FIELD =
  'block px-2.5 pb-2.5 pt-4 w-full text-sm text-white bg-custom-back-1 rounded-lg border border-custom appearance-none focus:outline-none focus:ring-0 focus:border-blue-500 transition-colors';
const SELECT =
  'px-3 py-2 rounded-md bg-custom-back-1 text-white text-sm border border-custom focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors';
const CHECKBOX =
  'appearance-none w-4 h-4 rounded border border-custom bg-custom-back-1 checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer';

const unitToDays = (duration, unit) => {
  const d = Number(duration) || 0;
  if (!d) return 0;
  if (Number(unit) === 315569260) return 36500;
  return Math.max(1, Math.round((d * Number(unit)) / 86400));
};

const daysToUnit = (days) => {
  if (Number(days) >= 36500) return { unit: 315569260, duration: 1 };
  if (Number(days) % 7 === 0 && Number(days) >= 7) return { unit: 604800, duration: Number(days) / 7 };
  return { unit: 86400, duration: Number(days) || 0 };
};

const fmtDate = (value) => {
  if (!value) return 'Never';
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const expiryOf = (lic) => {
  if (!lic?.createdAt) return null;
  return new Date(new Date(lic.createdAt).getTime() + (Number(lic.durationDays) || 0) * 86400000);
};

const statusLabel = (status) => {
  if (status === 'unused') return 'Not Used';
  if (status === 'used') return 'Used';
  if (status === 'banned') return 'Banned';
  if (status === 'paused') return 'Paused';
  return status;
};

const statusStyle = (status) => {
  if (status === 'unused') return 'bg-green-600/20 text-green-400 border-green-600/30';
  if (status === 'used') return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
  if (status === 'banned') return 'bg-red-600/20 text-red-400 border-red-600/30';
  if (status === 'paused') return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
  return 'bg-gray-600/20 text-gray-300 border-gray-600/30';
};

export default function Licenses() {
  const { selectedApp } = useAppContext();
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('cards');
  const [sortField, setSortField] = useState('gendate');
  const [sortDir, setSortDir] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('');
  const [pageSize, setPageSize] = useState(12);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [exportOpen, setExportOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');
  const [toast, setToast] = useState('');

  // Create
  const [createModal, setCreateModal] = useState(false);
  const [genForm, setGenForm] = useState({
    amount: 1,
    mask: '******-******-******-******-******-******',
    lowercaseLetters: false,
    capitalLetters: true,
    level: 1,
    note: '',
    expiry: 86400,
    duration: ''
  });
  const [generating, setGenerating] = useState(false);
  const [generatedKeys, setGeneratedKeys] = useState([]);

  // Extend
  const [extendModal, setExtendModal] = useState(false);
  const [extendForm, setExtendForm] = useState({ expiry: 86400, time: '' });

  // Delete
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteMode, setDeleteMode] = useState('');
  const [singleDelete, setSingleDelete] = useState(null);

  // Edit
  const [editLicense, setEditLicense] = useState(null);
  const [editForm, setEditForm] = useState({ level: 1, unit: 86400, duration: 30, note: '' });

  // Ban
  const [banLicense, setBanLicense] = useState(null);
  const [banReason, setBanReason] = useState('');

  const notify = (text) => setToast(text);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchLicenses = async () => {
    if (!selectedApp) return;
    setLoading(true);
    try {
      const res = await api.get(`/apps/${selectedApp._id}/licenses`, { params: { limit: 1000 } });
      if (res.data.success) {
        setLicenses(res.data.licenses || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenses();
  }, [selectedApp]);

  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
  }, [search, statusFilter, sortField, sortDir, pageSize, selectedApp]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = licenses.filter((lic) => {
      if (statusFilter && lic.status !== statusFilter) return false;
      if (!term) return true;
      return (
        String(lic.key || '').toLowerCase().includes(term) ||
        String(lic.usedByUsername || '').toLowerCase().includes(term) ||
        String(lic.note || '').toLowerCase().includes(term) ||
        String(lic.level || '').includes(term)
      );
    });

    const dir = sortDir === 'asc' ? 1 : -1;
    list = [...list].sort((a, b) => {
      let av;
      let bv;
      switch (sortField) {
        case 'key': av = a.key; bv = b.key; break;
        case 'usedby': av = a.usedByUsername || ''; bv = b.usedByUsername || ''; break;
        case 'usedon': av = a.usedAt ? new Date(a.usedAt).getTime() : 0; bv = b.usedAt ? new Date(b.usedAt).getTime() : 0; break;
        case 'note': av = a.note || ''; bv = b.note || ''; break;
        case 'expires': av = expiryOf(a)?.getTime() || 0; bv = expiryOf(b)?.getTime() || 0; break;
        default: av = new Date(a.createdAt).getTime(); bv = new Date(b.createdAt).getTime();
      }
      if (typeof av === 'string') return av.localeCompare(bv) * dir;
      return (av - bv) * dir;
    });
    return list;
  }, [licenses, search, statusFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const allOnPageSelected = pageItems.length > 0 && pageItems.every((l) => selectedIds.includes(l._id));

  const copyKey = (key) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    notify('License key copied to clipboard.');
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const toggleSelectAll = () => {
    if (allOnPageSelected) {
      setSelectedIds(selectedIds.filter((id) => !pageItems.some((l) => l._id === id)));
    } else {
      setSelectedIds([...new Set([...selectedIds, ...pageItems.map((l) => l._id)])]);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    const days = unitToDays(genForm.duration, genForm.expiry);
    if (!days) {
      notify('Please enter an expiry duration.');
      return;
    }
    setGenerating(true);
    setGeneratedKeys([]);
    try {
      const res = await api.post(`/apps/${selectedApp._id}/licenses/generate`, {
        amount: Number(genForm.amount) || 1,
        days,
        level: Number(genForm.level) || 1,
        mask: genForm.mask,
        note: genForm.note,
        lowercaseLetters: genForm.lowercaseLetters,
        capitalLetters: genForm.capitalLetters
      });
      if (res.data.success) {
        setGeneratedKeys(res.data.keys || []);
        setGenForm((f) => ({ ...f, amount: 1, note: '' }));
        setSelectedIds([]);
        fetchLicenses();
      }
    } catch (err) {
      notify(err.response?.data?.message || 'Generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  const handleExtend = async (e) => {
    e.preventDefault();
    if (selectedIds.length === 0) {
      notify('Please select at least one license to add time to.');
      return;
    }
    const days = unitToDays(extendForm.time, extendForm.expiry);
    if (!days) {
      notify('Please enter a duration of time to add.');
      return;
    }
    try {
      for (const id of selectedIds) {
        const lic = licenses.find((l) => l._id === id);
        if (lic) {
          await api.put(`/licenses/${id}`, { durationDays: Number(lic.durationDays || 0) + days });
        }
      }
      setExtendModal(false);
      setExtendForm({ expiry: 86400, time: '' });
      setSelectedIds([]);
      fetchLicenses();
      notify(`Added time to ${selectedIds.length} license(s).`);
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to extend license(s).');
    }
  };

  const openEdit = (lic) => {
    const { unit, duration } = daysToUnit(lic.durationDays);
    setEditForm({ level: lic.level || 1, unit, duration, note: lic.note || '' });
    setEditLicense(lic);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/licenses/${editLicense._id}`, {
        level: Number(editForm.level) || 1,
        durationDays: unitToDays(editForm.duration, editForm.unit),
        note: editForm.note
      });
      if (res.data.success) {
        setEditLicense(null);
        fetchLicenses();
        notify('License updated.');
      }
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to update license.');
    }
  };

  const handleBan = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/licenses/${banLicense._id}`, { status: 'banned', note: banReason || banLicense.note });
      if (res.data.success) {
        setBanLicense(null);
        setBanReason('');
        fetchLicenses();
        notify('License banned.');
      }
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to ban license.');
    }
  };

  const handleSingleDelete = async () => {
    if (!singleDelete) return;
    try {
      await api.delete(`/licenses/${singleDelete._id}`);
      setSingleDelete(null);
      setSelectedIds((ids) => ids.filter((id) => id !== singleDelete._id));
      fetchLicenses();
      notify('License deleted.');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to delete license.');
    }
  };

  const handleBulkDelete = async (e) => {
    e.preventDefault();
    let targets = [];
    if (deleteMode === 'delkeys') targets = licenses;
    else if (deleteMode === 'deleteallunused') targets = licenses.filter((l) => l.status === 'unused');
    else if (deleteMode === 'deleteallused') targets = licenses.filter((l) => l.status === 'used');
    else if (deleteMode === 'deleteselected') targets = licenses.filter((l) => selectedIds.includes(l._id));

    if (targets.length === 0) {
      notify('No licenses match this deletion mode.');
      return;
    }

    try {
      for (const lic of targets) {
        await api.delete(`/licenses/${lic._id}`);
      }
      setDeleteModal(false);
      setDeleteMode('');
      setSelectedIds([]);
      fetchLicenses();
      notify(`Deleted ${targets.length} license(s).`);
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to delete license(s).');
    }
  };

  const exportLicenses = (format) => {
    setExportOpen(false);
    const rows = filtered;
    if (rows.length === 0) {
      notify('There are no licenses to export.');
      return;
    }
    let content;
    if (format === 'json') {
      content = JSON.stringify(
        rows.map((l) => ({
          key: l.key,
          durationDays: l.durationDays,
          level: l.level,
          status: l.status,
          usedBy: l.usedByUsername || '',
          note: l.note || '',
          createdAt: l.createdAt
        })),
        null,
        2
      );
    } else {
      const header = 'key,durationDays,level,status,usedBy,note,createdAt';
      content = [header, ...rows.map((l) => [l.key, l.durationDays, l.level, l.status, l.usedByUsername || '', `"${(l.note || '').replace(/"/g, '""')}"`, l.createdAt].join(','))].join('\n');
    }
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `licenses-${selectedApp?.name || 'app'}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const actionBtn = 'relative p-2.5 rounded-lg transition group focus:outline-none';

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="mb-4 p-8 bg-custom-back rounded-lg">
        <nav className="flex mb-4" aria-label="Breadcrumb">
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
        <h1 lang="" className="text-xl font-semibold text-white sm:text-2xl">Licenses</h1>
        <p className="text-xs text-gray-500">
          Licenses allow your users to register on your application.{' '}
          <a
            href="https://keyauthdocs.apidog.io/dashboard/app/licenses"
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
          {/* Search and actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex-1">
              <input
                id="license-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search licenses..."
                className="px-3 py-2 rounded-md bg-custom-back-1 text-white placeholder-gray-400 w-full sm:max-w-sm border border-custom-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <button
                id="toggle-license-filters"
                onClick={() => setShowFilters((v) => !v)}
                className={`${actionBtn} bg-blue-600/20 hover:bg-blue-600/40 border border-blue-600/30 text-blue-400`}
              >
                <Filter size={16} />
                <Tip>Toggle Filters</Tip>
              </button>

              <button
                id="toggle-view-mode"
                onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
                className={`${actionBtn} bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-600/30 text-cyan-400`}
              >
                {viewMode === 'cards' ? <LayoutGrid size={16} /> : <List size={16} />}
                <Tip>Toggle View</Tip>
              </button>

              <button
                onClick={() => { setGeneratedKeys([]); setCreateModal(true); }}
                className={`${actionBtn} bg-green-600/20 hover:bg-green-600/40 border border-green-600/30 text-green-400`}
              >
                <Key size={16} className="transition-all duration-200 group-hover:scale-125 group-hover:-rotate-6 group-hover:text-yellow-400" />
                <Tip>Create New Key</Tip>
              </button>

              <button
                onClick={() => setExtendModal(true)}
                className={`${actionBtn} bg-blue-600/20 hover:bg-blue-600/40 border border-blue-600/30 text-blue-400`}
              >
                <Timer size={16} className="transition-all duration-200 group-hover:scale-125 group-hover:rotate-12 group-hover:text-blue-400" />
                <Tip>Add Time To License</Tip>
              </button>

              <div className="relative inline-block text-left">
                <button
                  id="exportToggle"
                  onClick={() => setExportOpen((v) => !v)}
                  className={`${actionBtn} bg-purple-600/20 hover:bg-purple-600/40 border border-purple-600/30 text-purple-400`}
                >
                  <FileDown size={16} className="transition-all duration-200 group-hover:scale-125 group-hover:rotate-3 group-hover:text-green-400" />
                  <Tip>Export License(s)</Tip>
                </button>
                {exportOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} />
                    <div className="absolute right-0 z-20 w-48 mt-2 bg-custom-back-1 rounded shadow-md text-white">
                      <button onClick={() => exportLicenses('json')} className="block w-full px-4 py-2 text-left text-sm hover:bg-blue-600 rounded-t">
                        Export JSON
                      </button>
                      <button onClick={() => exportLicenses('csv')} className="block w-full px-4 py-2 text-left text-sm hover:bg-blue-600 rounded-b">
                        Export CSV
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => { setDeleteMode(selectedIds.length ? 'deleteselected' : ''); setDeleteModal(true); }}
                className={`${actionBtn} bg-red-600/20 hover:bg-red-600/40 border border-red-600/30 text-red-400`}
              >
                <Trash2 size={16} className="transition-all duration-200 group-hover:scale-125 group-hover:rotate-6 group-hover:text-red-400" />
                <Tip side="left">Delete Options</Tip>
              </button>
            </div>
          </div>

          {/* Collapsible filters */}
          {showFilters && (
            <div id="license-filters" className="flex gap-3 mb-4 p-3 bg-custom-back-1/50 rounded-lg border border-custom transition-all duration-300">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-400 mb-1 font-medium">Sort By</label>
                  <select id="sortField" value={sortField} onChange={(e) => setSortField(e.target.value)} className={SELECT}>
                    <option value="gendate">Creation Date</option>
                    <option value="key">Key</option>
                    <option value="usedby">Used By</option>
                    <option value="usedon">Used On</option>
                    <option value="note">Note</option>
                    <option value="expires">Expires</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs text-gray-400 mb-1 font-medium">Order</label>
                  <select id="sortDir" value={sortDir} onChange={(e) => setSortDir(e.target.value)} className={SELECT}>
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs text-gray-400 mb-1 font-medium">Status</label>
                  <select id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={SELECT}>
                    <option value="">All Statuses</option>
                    <option value="unused">Not Used</option>
                    <option value="used">Used</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs text-gray-400 mb-1 font-medium">Per Page</label>
                  <select id="page-size-selector" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className={SELECT}>
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
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center text-white text-sm cursor-pointer">
                  <input
                    id="select-all-checkbox"
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={toggleSelectAll}
                    className={`${CHECKBOX} mr-2 ml-2`}
                  />
                  Select All
                </label>
              </div>
            </div>

            {viewMode === 'cards' ? (
              <div id="license-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-visible">
                {loading ? (
                  <div className="col-span-full text-center text-gray-400 py-10">Loading licenses...</div>
                ) : pageItems.length === 0 ? (
                  <div className="col-span-full text-center text-gray-400 py-10 flex flex-col items-center gap-3">
                    <div>🎫 Get started by creating your first license.</div>
                    <p className="text-xs text-gray-500">
                      {licenses.length > 0 && 'No licenses match your current filters.'}
                    </p>
                    <button
                      id="create-license-cta"
                      onClick={() => { setGeneratedKeys([]); setCreateModal(true); }}
                      className="inline-flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 font-medium rounded-lg text-sm px-4 py-2 transition"
                    >
                      <Key size={14} />
                      Create License
                    </button>
                  </div>
                ) : (
                  pageItems.map((lic) => {
                    const checked = selectedIds.includes(lic._id);
                    const expiry = expiryOf(lic);
                    return (
                      <div
                        key={lic._id}
                        className={`bg-custom-back-1 border rounded-lg p-4 flex flex-col gap-3 transition-colors ${
                          checked ? 'border-blue-600/60' : 'border-custom hover:border-blue-600/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <label className="flex items-center gap-2 min-w-0 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                setSelectedIds(
                                  checked ? selectedIds.filter((id) => id !== lic._id) : [...selectedIds, lic._id]
                                )
                              }
                              className={CHECKBOX}
                            />
                            <span className="font-mono text-sm text-white truncate select-all" title={lic.key}>
                              {lic.key}
                            </span>
                          </label>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => copyKey(lic.key)}
                              title="Copy License Key"
                              className="p-1.5 rounded-md text-gray-500 hover:text-blue-400 hover:bg-blue-600/10 transition-colors"
                            >
                              {copiedKey === lic.key ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                            </button>
                            <button
                              onClick={() => openEdit(lic)}
                              title="Edit License"
                              className="p-1.5 rounded-md text-gray-500 hover:text-blue-400 hover:bg-blue-600/10 transition-colors"
                            >
                              <Pencil size={14} />
                            </button>
                            {lic.status !== 'banned' && (
                              <button
                                onClick={() => { setBanReason(''); setBanLicense(lic); }}
                                title="Ban License"
                                className="p-1.5 rounded-md text-gray-500 hover:text-yellow-400 hover:bg-yellow-600/10 transition-colors"
                              >
                                <ShieldBan size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => setSingleDelete(lic)}
                              title="Delete License"
                              className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-600/10 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusStyle(lic.status)}`}>
                            {statusLabel(lic.status)}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-600/30">
                            Level {lic.level}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                          <div>
                            <p className="text-gray-500">Duration</p>
                            <p className="text-gray-300">{lic.durationDays} day(s)</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Used By</p>
                            <p className="text-gray-300 font-mono truncate">{lic.usedByUsername || 'Not Used'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Created</p>
                            <p className="text-gray-300">{fmtDate(lic.createdAt)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Expires</p>
                            <p className="text-gray-300">{fmtDate(expiry)}</p>
                          </div>
                        </div>

                        <div className="border-t border-custom pt-2">
                          <p className="text-gray-500 text-xs">Note</p>
                          <p className="text-gray-300 text-xs break-words">{lic.note || '—'}</p>
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
                        <input type="checkbox" checked={allOnPageSelected} onChange={toggleSelectAll} className={CHECKBOX} />
                      </th>
                      <th className="px-3 py-3 font-normal">License Key</th>
                      <th className="px-3 py-3 font-normal">Duration</th>
                      <th className="px-3 py-3 font-normal">Level</th>
                      <th className="px-3 py-3 font-normal">Status</th>
                      <th className="px-3 py-3 font-normal">Used By</th>
                      <th className="px-3 py-3 font-normal">Note</th>
                      <th className="px-3 py-3 font-normal">Created</th>
                      <th className="px-3 py-3 font-normal text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-custom">
                    {loading ? (
                      <tr><td colSpan={9} className="text-center py-10 text-gray-400">Loading licenses...</td></tr>
                    ) : pageItems.length === 0 ? (
                      <tr><td colSpan={9} className="text-center py-10 text-gray-400">🎫 Get started by creating your first license.</td></tr>
                    ) : (
                      pageItems.map((lic) => {
                        const checked = selectedIds.includes(lic._id);
                        return (
                          <tr key={lic._id} className="hover:bg-custom-back-1/60 transition-colors">
                            <td className="px-3 py-3">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  setSelectedIds(
                                    checked ? selectedIds.filter((id) => id !== lic._id) : [...selectedIds, lic._id]
                                  )
                                }
                                className={CHECKBOX}
                              />
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-white select-all">{lic.key}</span>
                                <button onClick={() => copyKey(lic.key)} className="text-gray-500 hover:text-blue-400" title="Copy">
                                  {copiedKey === lic.key ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                                </button>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-gray-300">{lic.durationDays} day(s)</td>
                            <td className="px-3 py-3 text-gray-300">Level {lic.level}</td>
                            <td className="px-3 py-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusStyle(lic.status)}`}>
                                {statusLabel(lic.status)}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-gray-400 font-mono text-xs">{lic.usedByUsername || 'Not Used'}</td>
                            <td className="px-3 py-3 text-gray-400 text-xs max-w-[180px] truncate">{lic.note || '—'}</td>
                            <td className="px-3 py-3 text-gray-400 text-xs">{fmtDate(lic.createdAt)}</td>
                            <td className="px-3 py-3">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => openEdit(lic)} title="Edit" className="p-1.5 rounded-md text-gray-500 hover:text-blue-400 hover:bg-blue-600/10">
                                  <Pencil size={14} />
                                </button>
                                <button onClick={() => setSingleDelete(lic)} title="Delete" className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-600/10">
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
                {filtered.length > 0
                  ? `Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, filtered.length)} of ${filtered.length} licenses`
                  : 'No licenses to show'}
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

      {/* Create License Modal */}
      {createModal && (
        <KaModal
          title="Create a new license"
          icon={<AlertCircle size={20} className="text-red-500" />}
          onClose={() => setCreateModal(false)}
        >
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="px-6 pb-4">
              <div className="relative w-full">
                <label className="text-gray-400 text-sm" htmlFor="amount">
                  License Amount <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    id="amount"
                    name="amount"
                    value={genForm.amount}
                    onChange={(e) => setGenForm({ ...genForm, amount: e.target.value })}
                    className={FIELD}
                    required
                  />
                  <InfoTip text="The number of licenses to create." />
                </div>
              </div>

              <div className="relative mt-4 w-full">
                <label className="text-gray-400 text-sm" htmlFor="mask">
                  License Mask <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    maxLength="49"
                    id="mask"
                    name="mask"
                    placeholder="*****-*****-*****"
                    value={genForm.mask}
                    onChange={(e) => setGenForm({ ...genForm, mask: e.target.value })}
                    className={FIELD}
                    required
                  />
                  <InfoTip text="Format for generating the license key, use * as wildcard characters" />
                </div>
              </div>

              <div className="p-4 rounded flex justify-between items-center">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    id="lowercaseLetters"
                    name="lowercaseLetters"
                    checked={genForm.lowercaseLetters}
                    onChange={(e) => setGenForm({ ...genForm, lowercaseLetters: e.target.checked })}
                    className={CHECKBOX}
                  />
                  <span className="text-white text-sm">Lowercase Letters</span>
                </label>
                <InfoTip text="Include lowercase and/or uppercase characters in the generated license(s)" />
                <label className="flex items-center space-x-2 cursor-pointer">
                  <span className="text-white text-sm">Uppercase Letters</span>
                  <input
                    type="checkbox"
                    id="capitalLetters"
                    name="capitalLetters"
                    checked={genForm.capitalLetters}
                    onChange={(e) => setGenForm({ ...genForm, capitalLetters: e.target.checked })}
                    className={CHECKBOX}
                  />
                </label>
              </div>

              <div className="relative mt-2">
                <label className="text-gray-400 text-sm" htmlFor="level">
                  Subscription Level <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 relative">
                  <select
                    id="level"
                    name="level"
                    value={genForm.level}
                    onChange={(e) => setGenForm({ ...genForm, level: e.target.value })}
                    className={SELECT + ' w-full'}
                  >
                    <option value={1}>1 (default)</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                  <InfoTip text="Select the level/subscription assigned to the created license(s)" />
                </div>
              </div>

              <div className="relative w-full mt-4">
                <label className="text-gray-400 text-sm" htmlFor="note">License Note</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    maxLength="69"
                    id="note"
                    name="note"
                    value={genForm.note}
                    onChange={(e) => setGenForm({ ...genForm, note: e.target.value })}
                    className={FIELD}
                  />
                  <InfoTip text="Optional note or reference tied to the created license(s)" />
                </div>
              </div>

              <div className="flex flex-row gap-4 mt-4">
                <div className="relative w-1/3">
                  <label className="text-gray-400 text-sm" htmlFor="expiry">
                    Expiry Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="expiry"
                    name="expiry"
                    value={genForm.expiry}
                    onChange={(e) => setGenForm({ ...genForm, expiry: Number(e.target.value) })}
                    className={SELECT + ' w-full'}
                    required
                  >
                    {UNITS.map((u) => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                </div>

                <div className="relative w-2/3">
                  <label className="text-gray-400 text-sm" htmlFor="duration">
                    Expiry Duration <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="1"
                      id="duration"
                      name="duration"
                      value={genForm.duration}
                      onChange={(e) => setGenForm({ ...genForm, duration: e.target.value })}
                      className={FIELD}
                      required
                    />
                    <InfoTip text="Specify how long the license will last. Expiration Unit * Expiration Duration = Expiration. (i.e. Minutes + 1 = 1 minute)" />
                  </div>
                </div>
              </div>

              {generatedKeys.length > 0 && (
                <div className="mt-4 bg-green-600/10 border border-green-600/20 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400 text-sm font-semibold">{generatedKeys.length} license(s) created</span>
                    <button
                      type="button"
                      onClick={() => { navigator.clipboard.writeText(generatedKeys.join('\n')); notify('All keys copied.'); }}
                      className="text-xs text-blue-400 hover:underline inline-flex items-center gap-1"
                    >
                      <Copy size={12} /> Copy All
                    </button>
                  </div>
                  <div className="max-h-32 overflow-y-auto font-mono text-xs text-gray-300 space-y-1">
                    {generatedKeys.map((k) => <div key={k}>{k}</div>)}
                  </div>
                </div>
              )}
            </div>

            <ModalFooter
              onCancel={() => setCreateModal(false)}
              submitLabel={generating ? 'Creating...' : 'Create License'}
              disabled={generating}
            />
          </form>
        </KaModal>
      )}

      {/* Extend License Modal */}
      {extendModal && (
        <KaModal
          title="Extend Unused License(s)"
          icon={<AlertCircle size={20} className="text-red-500" />}
          onClose={() => setExtendModal(false)}
        >
          <form onSubmit={handleExtend} className="space-y-6">
            <div className="px-6 pb-4">
              <p className="text-xs text-gray-400 mb-3">
                {selectedIds.length} license(s) selected.
              </p>
              <div className="relative mt-2">
                <label className="text-gray-400 text-sm" htmlFor="extend-expiry">
                  Unit of time to add <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 relative">
                  <select
                    id="extend-expiry"
                    value={extendForm.expiry}
                    onChange={(e) => setExtendForm({ ...extendForm, expiry: Number(e.target.value) })}
                    className={SELECT + ' w-full'}
                  >
                    {UNITS.map((u) => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                  <InfoTip text="The unit of time being added (days, weeks, etc)" />
                </div>
              </div>

              <div className="relative w-full mt-4">
                <label className="text-gray-400 text-sm" htmlFor="time">
                  Duration of time to add <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="1"
                    maxLength="69"
                    id="time"
                    name="time"
                    value={extendForm.time}
                    onChange={(e) => setExtendForm({ ...extendForm, time: e.target.value })}
                    className={FIELD}
                    required
                  />
                  <InfoTip text="The duration of time to add to the unused license(s)" />
                </div>
              </div>
            </div>

            <ModalFooter
              onCancel={() => setExtendModal(false)}
              submitLabel="Extend Unused License(s)"
            />
          </form>
        </KaModal>
      )}

      {/* Edit License Modal */}
      {editLicense && (
        <KaModal
          title="Edit License"
          icon={<Pencil size={18} className="text-blue-500" />}
          onClose={() => setEditLicense(null)}
        >
          <form onSubmit={handleEdit} className="space-y-6">
            <div className="px-6 pb-4">
              <div className="relative w-full">
                <label className="text-gray-400 text-sm" htmlFor="edit-level">License Level</label>
                <div className="flex items-center gap-2 relative">
                  <select
                    id="edit-level"
                    value={editForm.level}
                    onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                    className={SELECT + ' w-full'}
                    required
                  >
                    {[1, 2, 3, 4, 5].map((l) => (
                      <option key={l} value={l}>{l}{l === 1 ? ' (default)' : ''}</option>
                    ))}
                  </select>
                  <InfoTip text="Select the level/subscription assigned to this license" />
                </div>
              </div>

              <div className="relative mt-4">
                <label className="text-gray-400 text-sm" htmlFor="edit-expiry">Unit of time</label>
                <div className="flex items-center gap-2 relative">
                  <select
                    id="edit-expiry"
                    value={editForm.unit}
                    onChange={(e) => setEditForm({ ...editForm, unit: Number(e.target.value) })}
                    className={SELECT + ' w-full'}
                  >
                    {UNITS.map((u) => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                  <InfoTip text="Select the unit of time for license expiration" />
                </div>
              </div>

              <div className="relative w-full mt-4">
                <label className="text-gray-400 text-sm" htmlFor="edit-duration">Duration of time</label>
                <div className="flex items-center gap-2 relative">
                  <input
                    type="number"
                    min="1"
                    maxLength="69"
                    id="edit-duration"
                    value={editForm.duration}
                    onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                    className={FIELD}
                  />
                  <InfoTip text="Enter the number of time units for license expiration" />
                </div>
              </div>

              <div className="relative w-full mt-4">
                <label className="text-gray-400 text-sm" htmlFor="edit-note">License Note</label>
                <div className="flex items-center gap-2 relative">
                  <input
                    type="text"
                    maxLength="69"
                    id="edit-note"
                    value={editForm.note}
                    onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                    className={FIELD}
                  />
                  <InfoTip text="Add a note or description for this license" />
                </div>
              </div>
            </div>

            <ModalFooter
              onCancel={() => setEditLicense(null)}
              submitLabel="Save Changes"
            />
          </form>
        </KaModal>
      )}

      {/* Ban License Modal */}
      {banLicense && (
        <KaModal
          title="Ban License"
          icon={<AlertCircle size={20} className="text-red-500" />}
          onClose={() => setBanLicense(null)}
        >
          <form onSubmit={handleBan} className="space-y-6">
            <div className="px-6 pb-4">
              <div className="relative w-full mt-2">
                <label className="text-gray-400 text-sm" htmlFor="reason">
                  Ban Reason <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    maxLength="69"
                    id="reason"
                    name="reason"
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    className={FIELD}
                    required
                  />
                  <InfoTip text="The reason for banning this license" />
                </div>
              </div>
            </div>

            <ModalFooter
              onCancel={() => setBanLicense(null)}
              submitLabel="Ban License"
              danger
            />
          </form>
        </KaModal>
      )}

      {/* Delete Single License Modal */}
      {singleDelete && (
        <KaModal
          title="Delete License"
          icon={<AlertCircle size={20} className="text-red-500" />}
          onClose={() => setSingleDelete(null)}
        >
          <form
            onSubmit={(e) => { e.preventDefault(); handleSingleDelete(); }}
            className="space-y-6"
          >
            <div className="px-6 pb-4">
              <p className="text-gray-300 mb-4 text-sm">
                You're about to delete license:{' '}
                <span className="font-semibold text-white">{singleDelete.key}</span>.
              </p>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input type="checkbox" name="delUserToo" className={CHECKBOX} />
                <span>Delete created user too (if applicable)</span>
              </label>
            </div>
            <ModalFooter onCancel={() => setSingleDelete(null)} submitLabel="Delete License" danger />
          </form>
        </KaModal>
      )}

      {/* Delete Licenses Modal */}
      {deleteModal && (
        <KaModal
          title="Delete License(s)"
          icon={<AlertCircle size={20} className="text-red-500" />}
          onClose={() => setDeleteModal(false)}
        >
          <form onSubmit={handleBulkDelete} className="space-y-6">
            <div className="px-6 pb-4">
              <label htmlFor="delete-type" className="block text-sm font-medium text-gray-400 mb-1">
                Deletion Mode
              </label>
              <select
                id="delete-type"
                value={deleteMode}
                onChange={(e) => setDeleteMode(e.target.value)}
                className="w-full rounded bg-custom-back-1 text-white border border-custom p-2 focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select option</option>
                <option value="delkeys">Delete All</option>
                <option value="deleteallunused">Delete Unused</option>
                <option value="deleteallused">Delete Used</option>
                {selectedIds.length > 0 && (
                  <option value="deleteselected">Delete Selected</option>
                )}
              </select>

              <label className="flex items-center gap-2 text-sm text-gray-300 mt-4">
                <input type="checkbox" name="delUserToo" className={CHECKBOX} />
                <span>Delete associated user too (if applicable)</span>
              </label>

              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-5">
                <p className="text-red-400 text-sm flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  This action cannot be undone. Please confirm your selection.
                </p>
              </div>

              {deleteMode === 'deleteselected' && (
                <div className="mt-3">
                  <p className="text-sm text-gray-300 mb-1">You selected:</p>
                  <ul className="text-sm text-white list-disc list-inside space-y-1 max-h-28 overflow-y-auto font-mono">
                    {licenses.filter((l) => selectedIds.includes(l._id)).map((l) => (
                      <li key={l._id}>{l.key}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <ModalFooter
              onCancel={() => setDeleteModal(false)}
              submitLabel="Delete License(s)"
              danger
              disabled={!deleteMode}
            />
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
