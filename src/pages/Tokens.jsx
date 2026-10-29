import { useEffect, useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import api from '../services/api';
import {
  Home, ChevronsRight, Filter, LayoutGrid, List
} from 'lucide-react';
import { Tip } from '../components/ui/ka.jsx';

const FILTER_SELECT =
  'px-3 py-2 rounded-md bg-custom-back-1 text-white border border-custom-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors';

const pillStyle = (status) =>
  status === 'Banned'
    ? 'bg-red-600/30 text-red-300 border-red-600/60'
    : 'bg-green-600/30 text-green-300 border-green-600/60';

export default function Tokens() {
  const { selectedApp } = useAppContext();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('cards');
  const [sortField, setSortField] = useState('token');
  const [sortDir, setSortDir] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('');
  const [pageSize, setPageSize] = useState(12);
  const [page, setPage] = useState(1);

  const fetchTokens = async () => {
    if (!selectedApp) return;
    setLoading(true);
    try {
      const res = await api.get(`/apps/${selectedApp._id}/tokens`, { params: { limit: 1000 } });
      if (res.data.success) setTokens(res.data.tokens || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, [selectedApp]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, sortField, sortDir, pageSize, selectedApp]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = tokens.filter((t) => {
      if (term) {
        const haystack = [t.token, t.assigned, t.type, t.status, t.banReason].join(' ').toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (statusFilter && t.status.toLowerCase() !== statusFilter) return false;
      return true;
    });

    const dir = sortDir === 'asc' ? 1 : -1;
    list = [...list].sort((a, b) => {
      let av;
      let bv;
      switch (sortField) {
        case 'assigned': av = a.assigned || ''; bv = b.assigned || ''; break;
        case 'type': av = a.type || ''; bv = b.type || ''; break;
        case 'status': av = a.status || ''; bv = b.status || ''; break;
        default: av = a.token || ''; bv = b.token || '';
      }
      return av.localeCompare(bv) * dir;
    });
    return list;
  }, [tokens, search, statusFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
        <h1 className="text-xl font-semibold text-white sm:text-2xl">Tokens</h1>
        <p className="text-xs text-gray-500">
          Tokens act as access keys. While licenses allow users to login/register. Tokens allow the user to access the program entirely.{' '}
          <a
            href="https://keyauthdocs.apidog.com/dashboard/app/tokens"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline"
          >
            Learn More
          </a>
        </p>
      </div>

      {/* Main card */}
      <div className="p-4 flex flex-col bg-custom-back rounded-lg">
        <div className="overflow-x-auto">
          {/* Search + actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex-1">
              <input
                id="token-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tokens..."
                className="px-3 py-2 rounded-md bg-custom-back-1 text-white placeholder-gray-400 w-full sm:max-w-sm border border-custom-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <button
                id="toggle-token-filters"
                onClick={() => setShowFilters((v) => !v)}
                className={`${actionBtn} bg-blue-600/20 hover:bg-blue-600/40 border border-blue-600/30 text-blue-400`}
              >
                <Filter size={16} />
                <Tip side="left">Toggle Filters</Tip>
              </button>

              <button
                id="toggle-view-mode"
                onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
                className={`${actionBtn} bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-600/30 text-cyan-400`}
              >
                {viewMode === 'cards' ? <LayoutGrid size={16} /> : <List size={16} />}
                <Tip side="left">Toggle View</Tip>
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div
              id="token-filters"
              className="flex gap-3 mb-4 p-3 bg-custom-back-1/50 rounded-lg border border-custom transition-all duration-300 ease-in-out"
            >
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-400 mb-1 font-medium">Sort By</label>
                  <select id="sortField" value={sortField} onChange={(e) => setSortField(e.target.value)} className={FILTER_SELECT}>
                    <option value="token">Token</option>
                    <option value="assigned">Assigned</option>
                    <option value="type">Type</option>
                    <option value="status">Status</option>
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
                    <option value="">All</option>
                    <option value="unbanned">Unbanned</option>
                    <option value="banned">Banned</option>
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

          <div className="relative overflow-x-auto shadow-md sm:rounded-lg pt-5">
            {viewMode === 'cards' ? (
              <div id="token-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                  <div className="col-span-full text-center text-gray-400 py-10">Loading tokens...</div>
                ) : pageItems.length === 0 ? (
                  <div className="col-span-full text-center text-gray-400 py-10">No tokens found.</div>
                ) : (
                  pageItems.map((t) => (
                    <div
                      key={t._id}
                      className="bg-custom-back-1 rounded-xl p-4 text-white shadow-md hover:shadow-blue-500/30 transition duration-200"
                    >
                      <div className="flex justify-between items-center mb-2 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-semibold text-sm break-all">{t.token}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${pillStyle(t.status)}`}>
                            Status: {t.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs mb-1">
                        <p>Assigned: <span className="text-gray-400 break-all">{t.assigned}</span></p>
                        <p>Type: <span className="text-gray-400">{t.type}</span></p>
                      </div>
                      <div className="flex justify-between text-xs mb-1">
                        <p>Status: <span className="text-gray-400">N/A</span></p>
                        <p>Ban Reason: <span className="text-gray-400">{t.banReason}</span></p>
                      </div>
                      <div className="flex justify-between text-xs mb-1">
                        <p>Hash: <span className="text-gray-400">{t.hash}</span></p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-white">
                  <thead>
                    <tr className="text-blue-700 border-b border-custom">
                      <th className="px-3 py-3 font-normal">Token</th>
                      <th className="px-3 py-3 font-normal">Assigned</th>
                      <th className="px-3 py-3 font-normal">Type</th>
                      <th className="px-3 py-3 font-normal">Status</th>
                      <th className="px-3 py-3 font-normal">Ban Reason</th>
                      <th className="px-3 py-3 font-normal">Hash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-custom">
                    {loading ? (
                      <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading tokens...</td></tr>
                    ) : pageItems.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-10 text-gray-400">No tokens found.</td></tr>
                    ) : (
                      pageItems.map((t) => (
                        <tr key={t._id} className="hover:bg-custom-back-1/60 transition-colors">
                          <td className="px-3 py-3 font-mono text-xs text-gray-300 break-all">{t.token}</td>
                          <td className="px-3 py-3 text-gray-300 break-all">{t.assigned}</td>
                          <td className="px-3 py-3 text-gray-400">{t.type}</td>
                          <td className="px-3 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${pillStyle(t.status)}`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-gray-400">{t.banReason}</td>
                          <td className="px-3 py-3 text-gray-400">{t.hash}</td>
                        </tr>
                      ))
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
    </div>
  );
}
