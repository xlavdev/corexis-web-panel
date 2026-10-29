import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/ui/index.jsx';
import { Badge } from '../components/ui/index.jsx';
import { Input, Select } from '../components/ui/index.jsx';
import { KA_INPUT, KA_SELECT, KA_FILTER_SELECT } from '../components/ui/ka.jsx';
import { KaModal, ModalFooter, Tip, InfoTip } from '../components/ui/ka.jsx';
import { Funnel, Trash, Filter } from 'lucide-react';
import api from '../services/api';

const ACTION_BTN = 'relative p-2.5 rounded-lg transition bg-blue-600/20 hover:bg-blue-600/40 border border-blue-600/30 group focus:outline-none';

export default function Sessions() {
  const { selectedApp } = useAppContext();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('cards');
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'credential',
    sortDir: 'desc',
    perPage: 12,
  });
  const [page, setPage] = useState(1);
  const [selectedSessionIds, setSelectedSessionIds] = useState(new Set());

  const fetchSessions = async () => {
    if (!selectedApp) return;
    setLoading(true);
    try {
      const res = await api.get(`/apps/${selectedApp._id}/tokens`);
      if (res.data.success) {
        let tokens = res.data.tokens || [];

        // Apply search filter
        if (filters.search) {
          const s = filters.search.toLowerCase();
          tokens = tokens.filter(
            (t) =>
              (t.token && t.token.toLowerCase().includes(s)) ||
              (t.assigned && t.assigned.toLowerCase().includes(s))
          );
        }

        // Apply sort
        const { sortBy, sortDir } = filters;
        tokens.sort((a, b) => {
          let va = a[sortBy] ?? '';
          let vb = b[sortBy] ?? '';
          if (sortBy === 'validated') {
            va = a.validated ? 1 : 0;
            vb = b.validated ? 1 : 0;
          }
          if (va > vb) return sortDir === 'desc' ? -1 : 1;
          if (va < vb) return sortDir === 'desc' ? 1 : -1;
          return 0;
        });

        // Apply pagination
        const start = (filters.perPage * (page - 1)) | 0;
        tokens = tokens.slice(start, start + filters.perPage);
        setSessions(tokens);
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [selectedApp, filters, page]);

  const handleDelete = async (ids) => {
    if (!confirm('Delete selected sessions?')) return;
    setLoading(true);
    try {
      await api.delete(`/apps/${selectedApp._id}/sessions`, {
        data: { ids },
      });
      setSelectedSessionIds(new Set());
      setPage(1);
      fetchSessions();
    } catch (err) {
      console.error('Failed to delete sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKill = async (sessionId) => {
    if (!window.confirm('Kill this session?')) return;
    setLoading(true);
    try {
      await api.delete(`/apps/${selectedApp._id}/sessions/${sessionId}`);
      setPage(1);
      fetchSessions();
    } catch (err) {
      console.error('Failed to kill session:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlacklist = async (ip, sessionId) => {
    if (!window.confirm(`Blacklist IP ${ip} and kill session?`)) return;
    setLoading(true);
    try {
      await api.post(`/apps/${selectedApp._id}/sessions/blacklist`, {
        ip,
        session_id: sessionId,
      });
      setPage(1);
      fetchSessions();
    } catch (err) {
      console.error('Failed to blacklist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedSessionIds.size === sessions.length) {
      setSelectedSessionIds(new Set());
    } else {
      const allIds = new Set(sessions.map((s) => s._id));
      setSelectedSessionIds(allIds);
    }
  };

  const hasSelected = selectedSessionIds.size > 0;

  return (
    <div className="p-4 space-y-6">
      {/* Header + breadcrumb */}
      <div className="p-4 block sm:flex items-center justify-between lg:mt-1.5 rounded-xl">
        <div className="mb-1 w-full mt-2 md:mt-2 rounded-xl">

          <div className="mb-4 p-8 bg-custom-back rounded-lg aos-init aos-animate" data-aos="fade-down" data-aos-duration="1500">
            <nav class="flex mb-5" aria-label="Breadcrumb">
              <ol class="inline-flex items-center space-x-1 md:space-x-2">
                <li class="inline-flex items-center">
                  <a data-savepage-href="?page=manage-apps" href="https://keyauth.cc/app/?page=manage-apps" class="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white">
                    <svg class="w-3 h-3 mr-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                      <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"></path>
                    </svg>
                    Manage Apps
                  </a>
                </li>
                <li>
                  <div class="flex items-center">
                    <i class="lni lni-angle-double-right mr-2" />
                    <label class="inline-flex items-center text-sm font-medium text-gray-400">Current Application:
                      COREXIS </label>
                  </div>
                </li>
                <li>
                  <i class="lni lni-angle-double-right mr-2" />
                  <label class="inline-flex items-center text-sm font-medium text-red-600">
                    You don't have a subscription!
                    <a data-savepage-href="?page=account-settings#billing" href="https://keyauth.cc/app/?page=account-settings#billing" class="text-blue-600 hover:underline">
                      Upgrade Now.
                    </a>
                  </label>
                </li>
              </ol>
            </nav>
            <h1 class="text-xl font-semibold text-white sm:text-2xl ">Sessions</h1>
            <p className="text-xs text-gray-500">All of your active sessions. (Active Users) <a href="https://keyauthdocs.apidog.io/dashboard/app/sessions" target="_blank" className="text-blue-600 hover:underline">Learn More</a>.</p>
          </div>

          {/* Search and Actions Row */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex-1">
              <input
                id="session-search"
                type="text"
                placeholder="Search sessions..."
                className={KA_INPUT}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            <div className="flex gap-2 flex-shrink-0">
              {/* Filter Toggle Button */}
              <button
                id="toggle-session-filters"
                type="button"
                className={ACTION_BTN}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 lucide lucide-filter"
                >
                  <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"></polygon>
                </svg>

                <span
                  role="tooltip"
                  className="pointer-events-none absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 text-xs font-medium text-white bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[9999]"
                >
                  Toggle Filters
                </span>
              </button>

              {/* View Toggle Button */}
              <button
                id="toggle-view-mode"
                type="button"
                className={ACTION_BTN}
              >
                <svg
                  id="view-icon-cards"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 lucide lucide-grid transition-all duration-200"
                >
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <svg
                  id="view-icon-table"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 lucide lucide-table hidden transition-all duration-200"
                >
                  <path d="M12 3v18"></path>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <path d="M3 9h18"></path>
                  <path d="M3 15h18"></path>
                </svg>

                <span
                  role="tooltip"
                  className="pointer-events-none absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap px-2 py-1 text-xs font-medium text-white bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[9999]"
                >
                  Toggle View
                </span>
              </button>

              {/* Delete Sessions */}
              <button
                onclick="openModal('delete-sessions-modal')"
                className={ACTION_BTN}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 lucide lucide-trash-2 transition-all duration-200 group-hover:scale-125 group-hover:rotate-6 group-hover:text-red-400"
                >
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  <line x1="10" x2="10" y1="11" y2="17"></line>
                  <line x1="14" x2="14" y1="11" y2="17"></line>
                </svg>

                <span
                  role="tooltip"
                  className="pointer-events-none absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap px-2 py-1 text-xs font-medium text-white bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[9999]"
                >
                  Delete Options
                </span>
              </button>
            </div>
          </div>

          {/* Collapsible Filters Row */}
          <div
            id="session-filters"
            className="hidden gap-3 mb-4 p-3 bg-custom-back-1/50 rounded-lg border border-custom transition-all duration-300 ease-in-out"
          >
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="flex flex-col">
                <label className="text-xs text-gray-400 mb-1 font-medium">Sort By</label>
                <select
                  id="sortField"
                  className={KA_FILTER_SELECT}
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters({ ...filters, sortBy: e.target.value })
                  }
                >
                  <option value="credential">Credential</option>
                  <option value="expiry">Expiry</option>
                  <option value="validated">Validated</option>
                  <option value="ip">IP</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-gray-400 mb-1 font-medium">Order</label>
                <select
                  id="sortDir"
                  className={KA_FILTER_SELECT}
                  value={filters.sortDir}
                  onChange={(e) =>
                    setFilters({ ...filters, sortDir: e.target.value })
                  }
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-gray-400 mb-1 font-medium">Per Page</label>
                <select
                  id="page-size-selector"
                  className={KA_FILTER_SELECT}
                  value={filters.perPage}
                  onChange={(e) =>
                    setFilters({ ...filters, perPage: Number(e.target.value) })
                  }
                >
                  <option value="12" selected="">
                    12 per page
                  </option>
                  <option value="25">25 per page</option>
                  <option value="75">75 per page</option>
                  <option value="100">100 per page</option>
                </select>
              </div>
            </div>
          </div>

          {/* Delete Sessions Modal */}
          <div
            id="delete-sessions-modal"
            className="modal-backdrop modal-hidden"
          >
            <div className="modal-backdrop-bg" onclick="closeModal('delete-sessions-modal')" />
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="modal-content relative w-full max-w-md transform overflow-hidden rounded-lg bg-custom-back shadow-xl">
                <div className="flex items-center justify-between p-6 pb-4">
                  <h3 className="text-lg font-semibold text-gray-300">Delete Sessions</h3>
                </div>
                <form id="deleteSessionsForm" method="POST">
                  <div className="px-6 pb-4 text-sm text-gray-300 space-y-4">
                    <div>
                      <label
                        for="delete-type-sessions"
                        className="block mb-1 text-gray-400"
                      >
                        Action
                      </label>
                      <select
                        id="delete-type-sessions"
                        className="w-full bg-custom-back-1 text-white rounded border border-custom p-2.5"
                      >
                        <option value="">Select an action…</option>
                        <option
                          id="delete-selected-option-sessions"
                          className="hidden"
                          value="deleteselected"
                        >
                          Delete selected sessions
                        </option>
                        <option value="killall" className="hidden">
                          Kill all (disabled)
                        </option>
                      </select>
                    </div>
                    <div id="delete-selected-btn-sessions" className="hidden">
                      <p className="mb-1 text-gray-400">Selected:</p>
                      <ul id="delete-sessions-summary" className="list-disc list-inside text-gray-300"></ul>
                    </div>

                    {/* Warning Text */}
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <p className="text-red-400 text-sm">
                        <i className="fas fa-exclamation-triangle mr-2" />
                        This action cannot be undone. Please confirm your selection.
                      </p>
                    </div>
                  </div>
                  <div className="bg-custom-back-1 px-6 py-4 flex space-x-3 justify-end">
                    <button
                      type="button"
                      onclick="closeModal('delete-sessions-modal')"
                      className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      id="deleteSessionsOption"
                      type="submit"
                      className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white"
                      disabled=""
                    >
                      Confirm
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          {/* End Delete Sessions Modal }}

          {/* Kill Session Modal */}
          <div id="kill-session-modal" className="modal-backdrop modal-hidden">
            <div className="modal-backdrop-bg" onclick="closeModal('kill-session-modal')" />
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="modal-content relative w-full max-w-md transform overflow-hidden rounded-lg bg-custom-back shadow-xl">
                <div className="flex items-center justify-between p-6 pb-4 -ml-3">
                  <h3 className="text-lg font-semibold text-gray-300">Kill Session</h3>
                </div>
                <form method="POST">
                  <div className="px-6 pb-4 text-sm text-gray-300 space-y-4">
                    <p>Are you sure you want to kill this session?</p>
                    <input
                      type="hidden"
                      id="kill-session-id"
                      name="kill"
                      value=""
                    />
                  </div>
                  <div className="bg-custom-back-1 px-6 py-4 flex space-x-3 justify-end">
                    <button
                      type="button"
                      onclick="closeModal('kill-session-modal')"
                      className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white">
                      Kill
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          {/* End Kill Session Modal }}

          {/* Blacklist Session Modal */}
          <div id="blacklist-session-modal" className="modal-backdrop modal-hidden">
            <div className="modal-backdrop-bg" onclick="closeModal('blacklist-session-modal')" />
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="modal-content relative w-full max-w-md transform overflow-hidden rounded-lg bg-custom-back shadow-xl">
                <div className="flex items-center justify-between p-6 pb-4 -ml-3">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-ban text-orange-500 text-xl" />
                    <h3 className="text-lg font-semibold text-gray-300">
                      Blacklist IP & Kill Session
                    </h3>
                  </div>
                </div>
                <form method="POST">
                  <div className="px-6 pb-4 text-sm text-gray-300 space-y-4">
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                      <p className="text-orange-400 text-sm">
                        This will add the IP address to the blacklist and immediately kill the session.
                      </p>
                    </div>
                    <div>
                      <label
                        className="text-gray-400 text-sm"
                        for="ip"
                        >
                        IP Address <span className="text-red-500">*</span>
                        </label>
                      <input
                        type="text"
                        id="blacklist-session-ip"
                        name="blacklist_ip"
                        readonly
                        className="w-full px-3 py-2 rounded-md bg-custom-back-1 text-white border border-custom-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        value=""
                      />
                    </div>
                    <div>
                      <label
                        className="text-gray-400 text-sm"
                        for="reason"
                        >
                        Blacklist Reason
                        </label>
                      <input
                        type="text"
                        name="blacklist_reason"
                        placeholder="Enter reason for blacklisting..."
                        className="w-full px-3 py-2 rounded-md bg-custom-back-1 text-white placeholder-gray-400 border border-custom-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        value=""
                      />
                    </div>
                    <input type="hidden" id="blacklist-session-id" name="blacklist_session_id" value="" />
                  </div>
                  <div className="bg-custom-back-1 px-6 py-4 flex space-x-3 justify-end">
                    <button
                      type="button"
                      onclick="closeModal('blacklist-session-modal')"
                      className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      name="blacklist_and_kill"
                      className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium bg-orange-600 hover:bg-orange-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
                    >
                      Blacklist & Kill
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          {/* End Blacklist Session Modal }}

          {/* START TABLE */}
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg pt-5">
            <div className="flex items-center justify-between mb-4">
              <label className="inline-flex items-center text-white text-sm">
                <input
                  id="sessions-select-all-checkbox"
                  type="checkbox"
                  className="appearance-none w-4 h-4 mr-2 ml-2 rounded border border-custom bg-custom-back-1 checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                Select All
              </label>
            </div>

            <div id="session-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-visible">
              {sessions.length === 0 && viewMode !== 'table' ? (
                <div className="col-span-full text-center text-gray-400 py-8">
                  🚫 No sessions found for this application.
                </div>
              ) : viewMode === 'table' ? (
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#121212] text-blue-700 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-4 px-4 font-semibold">Session ID</th>
                      <th className="py-4 px-4 font-semibold">User</th>
                      <th className="py-4 px-4 font-semibold">IP Address</th>
                      <th className="py-4 px-4 font-semibold">HWID</th>
                      <th className="py-4 px-4 font-semibold">Status</th>
                      <th className="py-4 px-4 font-semibold">Time Remaining</th>
                      <th className="py-4 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a1a1a]">
                    {sessions.map((s) => (
                      <tr key={s._id} className="hover:bg-[#1a1a1a]/50">
                        <td className="py-3 px-4 font-mono text-gray-300 font-medium select-all">{s.token}</td>
                        <td className="py-3 px-4 font-semibold text-white">{s.assigned || 'N/A'}</td>
                        <td className="py-3 px-4 font-mono text-gray-400">{s.ip || ''}</td>
                        <td className="py-3 px-4 font-mono text-gray-400 text-xs truncate max-w-xs">{s.hwid || ''}</td>
                        <td className="py-3 px-4">
                          <span
                            className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/20"
                          >
                            {s.validated ? 'Validated' : 'Unvalidated'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {s.expiresAt ? new Date(s.expiresAt).toLocaleString() : ''}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleKill(s.token)}
                            className="text-xs"
                          >
                            Terminate
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-visible">
                  {sessions.map((s) => (
                    <div
                      key={s._id}
                      className="bg-custom-back-1 border border-[#1a1a1a] rounded-lg p-4 flex flex-col h-100"
                    >
                      <div className="flex items-between justify-between mb-2">
                        <span className="text-sm font-medium text-white">{s.token}</span>
                        <Badge color="blue">
                          {s.validated ? 'Valid' : 'Unverified'}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2">{s.assigned || 'N/A'}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500">{s.ip || '—'}</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleKill(s.token)}
                            className="text-xs"
                          >
                            Terminate
                          </Button>
                          <Button
                            size="sm"
                            variant="warning"
                            onClick={() => handleBlacklist(s.ip || '', s.token)}
                            className="text-xs"
                          >
                            Blacklist IP
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4 text-white">
              <button
                id="prevPage"
                className="cursor-pointer bg-custom-back-1 px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span id="pagination-info" className="text-sm">
                Page {page} of {Math.max(1, Math.ceil(sessions.length / filters.perPage))}
              </span>
              <button
                id="nextPage"
                className="cursor-pointer bg-custom-back-1 px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => setPage((p) => p + 1)}
                disabled={true}
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