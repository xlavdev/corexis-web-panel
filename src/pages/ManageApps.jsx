import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import api from '../services/api';
import {
  Home, ChevronRight, Copy, RotateCcw, Plus, Pencil, CirclePause,
  Play, Trash2, Search, X, ExternalLink,
} from 'lucide-react';

const CopyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
  >
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

const languages = [
  { id: 'csharp', label: 'C#', example: 'https://github.com/KeyAuth/KeyAuth-CSHARP-Example' },
  { id: 'cpp', label: 'C++', example: 'https://github.com/KeyAuth/KeyAuth-CPP-Example' },
  { id: 'py', label: 'Python', example: 'https://github.com/KeyAuth/KeyAuth-Python-Example' },
  { id: 'php', label: 'PHP', example: 'https://github.com/KeyAuth/KeyAuth-PHP-Example' },
  { id: 'js', label: 'JavaScript', example: 'https://github.com/mazkdevf/KeyAuth-JS-Example' },
  { id: 'ts', label: 'TypeScript', example: 'https://github.com/mazkdevf/KeyAuth-TypeScript-Example' },
  { id: 'java', label: 'Java', example: 'https://github.com/KeyAuth-Archive/KeyAuth-JAVA-api' },
  { id: 'vbnet', label: 'VB.Net', example: 'https://github.com/KeyAuth/KeyAuth-VB-Example' },
  { id: 'rust', label: 'Rust', example: 'https://github.com/KeyAuth/KeyAuth-Rust-Example' },
  { id: 'go', label: 'Go', example: 'https://github.com/mazkdevf/KeyAuth-Go-Example' },
  { id: 'lua', label: 'Lua', example: 'https://github.com/mazkdevf/KeyAuth-Lua-Examples' },
  { id: 'ruby', label: 'Ruby', example: 'https://github.com/mazkdevf/KeyAuth-Ruby-Example' },
  { id: 'perl', label: 'Perl', example: 'https://github.com/mazkdevf/KeyAuth-Perl-Example' },
];

function buildSnippets(app) {
  const name = app?.name || '';
  const ownerid = app?.ownerId || '';
  const secret = app?.secret || '';
  const version = app?.version || '';
  const url = 'https://keyauth.win/api/1.3/';

  return {
    csharp: `public static api KeyAuthApp = new api(
    name: "${name}", // App name
    ownerid: "${ownerid}", // Account ID
    version: "${version}", // Application version. Used for automatic downloads see video here https://www.youtube.com/watch?v=kW195PLCBKs
    //path: @"Your_Path_Here" // (OPTIONAL) see tutorial here https://www.youtube.com/watch?v=I9rxt821gMk&t=1s
);`,
    cpp: `std::string name = skCrypt("${name}").decrypt();
std::string ownerid = skCrypt("${ownerid}").decrypt();
std::string version = skCrypt("${version}").decrypt();
std::string url = skCrypt("${url}").decrypt(); // change if you're self-hosting`,
    py: `keyauthapp = api(
    name = "${name}",
    ownerid = "${ownerid}",
    version = "${version}",
    hash_to_check = getchecksum()
)`,
    php: `$name = "${name}";
$ownerid = "${ownerid}";
$version = "${version}";`,
    js: `const KeyAuthApp = new KeyAuth(
    "${name}",
    "${ownerid}",
    "${version}",
);`,
    ts: `const KeyAuthApp = new KeyAuth(
    "${name}",
    "${ownerid}",
    "${version}",
);`,
    java: `private static String ownerid = "${ownerid}",
private static String appname = "${name}",
private static String version = "${version}"`,
    vbnet: `Private Shared name As String = "${name}"
Private Shared ownerid As String = "${ownerid}"
Private Shared version As String = "${version}"`,
    rust: `let mut keyauthapp = keyauth::v1_3::KeyauthApi::new(
    "${name}",
    "${ownerid}",
    "${version}",
    "${url}",
);`,
    go: `var name = "${name}"
var ownerid = "${ownerid}"
var version = "${version}"`,
    lua: `local name = "${name}";
local ownerid = "${ownerid}";
local version = "${version}";`,
    ruby: `KeyAuth.new.Api(
    "${name}",
    "${ownerid}",
    "${version}"
)`,
    perl: `KeyAuth::Api(
    "${name}",
    "${ownerid}",
    "${version}"
);`,
  };
}

function Field({ label, value, secret, onCopy }) {
  return (
    <div className="relative bg-custom-back rounded-xl p-4 shadow-sm mt-2">
      <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-custom-back-1" />
      <button
        type="button"
        onClick={() => onCopy(value)}
        className="absolute top-2 right-2 text-gray-400 hover:text-white transition text-xs font-medium flex items-center gap-1"
        title="Copy to clipboard"
      >
        <CopyIcon />
      </button>
      <p className="text-[10px] font-medium text-gray-300 uppercase tracking-widest mb-1">{label}</p>
      <div className="overflow-x-auto whitespace-nowrap">
        <p
          onClick={() => onCopy(value)}
          className={`inline-block w-fit text-sm font-semibold text-gray-300 font-mono select-all ${
            secret ? 'blur-[2.5px] hover:blur-none cursor-pointer' : 'cursor-pointer'
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function Modal({ open, onClose, children, border = 'border-[#1a1a1a]' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex items-center justify-center min-h-full p-4">
        <div className={`relative w-full max-w-md bg-custom-back-1 border ${border} rounded-xl shadow-lg`}>
          {children}
        </div>
      </div>
    </div>
  );
}

function FloatInput({ id, label, value, onChange, autoFocus, color = 'peer-focus:border-blue-600' }) {
  return (
    <div className="relative mb-4">
      <input
        id={id}
        type="text"
        value={value}
        onChange={onChange}
        autoFocus={autoFocus}
        placeholder=" "
        autoComplete="off"
        className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-[#2a2a2a] appearance-none focus:outline-none focus:ring-0 peer ${color}`}
      />
      <label
        htmlFor={id}
        className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-custom-back-1 px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
      >
        {label}
      </label>
    </div>
  );
}

export default function ManageApps() {
  const { apps, selectedApp, selectApp, fetchApps } = useAppContext();
  const [snippets, setSnippets] = useState(() => buildSnippets(selectedApp));
  const [showCode, setShowCode] = useState(false);
  const [language, setLanguage] = useState('csharp');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState({});
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);

  const [createModal, setCreateModal] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [renameModal, setRenameModal] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [descriptionModal, setDescriptionModal] = useState(null);
  const [descriptionValue, setDescriptionValue] = useState('');
  const [pauseModal, setPauseModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [confirmName, setConfirmName] = useState('');
  const [refreshModal, setRefreshModal] = useState(false);

  useEffect(() => {
    setSnippets(buildSnippets(selectedApp));
  }, [selectedApp]);

  useEffect(() => {
    let cancelled = false;
    const loadStats = async () => {
      const results = {};
      await Promise.all(
        apps.map(async (app) => {
          try {
            const res = await api.get(`/apps/${app._id}/stats`);
            if (res.data.success) results[app._id] = res.data.stats;
          } catch {
            results[app._id] = { totalUsers: 0, onlineSessions: 0 };
          }
        })
      );
      if (!cancelled) setStats(results);
    };
    if (apps.length) loadStats();
    return () => {
      cancelled = true;
    };
  }, [apps]);

  const notify = (message) => {
    setToast(message);
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => setToast(''), 1800);
  };

  const copy = (value) => {
    navigator.clipboard.writeText(value || '');
    notify('Copied!');
  };

  const activeCount = apps.filter((a) => a.status !== 'paused').length;
  const pausedCount = apps.filter((a) => a.status === 'paused').length;
  const activeSessions = Object.values(stats).reduce((sum, s) => sum + (s?.onlineSessions || 0), 0);

  const filteredApps = [...apps]
    .filter((app) => app.name.toLowerCase().includes(search.trim().toLowerCase()))
    .filter((app) => {
      if (statusFilter === 'active') return app.status !== 'paused';
      if (statusFilter === 'paused') return app.status === 'paused';
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newAppName.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/apps', { name: newAppName.trim(), version: '1.0' });
      if (res.data.success) {
        await fetchApps();
        if (res.data.app) selectApp(res.data.app);
        setCreateModal(false);
        setNewAppName('');
        notify('Application created!');
      }
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to create application!');
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (e) => {
    e.preventDefault();
    if (!renameModal || !renameValue.trim()) return;
    setLoading(true);
    try {
      await api.put(`/apps/${renameModal._id}`, { name: renameValue.trim() });
      await fetchApps();
      setRenameModal(null);
      notify('Application renamed!');
    } catch (err) {
      notify(err.response?.data?.message || 'Rename failed!');
    } finally {
      setLoading(false);
    }
  };

  const handleDescription = async (e) => {
    e.preventDefault();
    if (!descriptionModal) return;
    setLoading(true);
    try {
      await api.put(`/apps/${descriptionModal._id}`, { description: descriptionValue });
      await fetchApps();
      setDescriptionModal(null);
      notify('Description updated!');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to update description!');
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    if (!pauseModal) return;
    setLoading(true);
    try {
      const paused = pauseModal.status === 'paused';
      await api.put(`/apps/${pauseModal._id}`, { status: paused ? 'enabled' : 'paused' });
      await fetchApps();
      setPauseModal(null);
      notify(paused ? 'Application unpaused!' : 'Application paused!');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to update application!');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!selectedApp) return;
    setLoading(true);
    try {
      await api.post(`/apps/${selectedApp._id}/regenerate-secret`);
      await fetchApps();
      setRefreshModal(false);
      notify('Application secret refreshed!');
    } catch (err) {
      notify(err.response?.data?.message || 'Refresh failed!');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal || confirmName.trim() !== deleteModal.name) return;
    setLoading(true);
    try {
      await api.delete(`/apps/${deleteModal._id}`);
      await fetchApps();
      setDeleteModal(null);
      setConfirmName('');
      notify('Application deleted!');
    } catch (err) {
      notify(err.response?.data?.message || 'Delete failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-page="manage-apps" className="p-4 block sm:flex items-center justify-between lg:mt-1.5 rounded-xl">
      <div className="mb-1 w-full mt-2 md:mt-2 rounded-xl">
        <div className="mb-4 p-8 bg-custom-back rounded-lg animate-fade-up">
          <nav className="flex mb-5" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
              <li className="inline-flex items-center">
                <a
                  href="/app/manage-apps"
                  className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white"
                >
                  <Home className="w-3 h-3 mr-2.5" />
                  Manage Apps
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRight className="w-3 h-3 mr-2 text-gray-400" />
                  <label className="inline-flex items-center text-sm font-medium text-gray-400">
                    Current Application: {selectedApp?.name || 'None'}
                  </label>
                </div>
              </li>
            </ol>
          </nav>

          <h1 className="text-xl font-semibold text-white sm:text-2xl">Manage Applications</h1>
          <p className="text-xs text-gray-500">
            Manage your applications. Applications are the backbone of all the data.{' '}
            <a
              href="https://keyauthdocs.apidog.io/dashboard/manage-applications"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline"
            >
              Learn More
            </a>
            .
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Apps', value: apps.length },
            { label: 'Active', value: activeCount },
            { label: 'Paused', value: pausedCount },
            { label: 'Active Sessions', value: activeSessions },
          ].map((stat) => (
            <div
              key={stat.label}
              className="relative flex flex-col items-center justify-center text-center bg-custom-back px-4 py-4 rounded-xl w-full sm:w-auto transition-shadow duration-300 ease-in-out hover:shadow-[0_0_15px_3px_rgba(59,130,246,0.5)] cursor-pointer"
            >
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mt-5">
          {/* Application Credentials */}
          <div className="w-full lg:w-1/3 bg-custom-back rounded-xl p-4">
            <p className="text-base text-gray-300 ml-2">Application Credentials</p>
            <p className="text-xs text-gray-500 ml-2">
              Simply replace the placeholder code in the example with these
            </p>

            <div className="ml-4 mt-4">
              <label className="relative inline-flex items-center mr-5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCode}
                  onChange={(e) => setShowCode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-custom-back-1 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-[#1a1a1a] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-custom-back" />
                <span className="text-sm text-gray-500 ml-2">Display Code Snippet</span>
              </label>

              {!showCode && selectedApp && (
                <div className="transition-opacity duration-300">
                  <Field label="Application Name" value={selectedApp.name} onCopy={copy} />
                  <Field label="Account Owner ID" value={selectedApp.ownerId} secret onCopy={copy} />
                  <Field label="Application Secret" value={selectedApp.secret} secret onCopy={copy} />
                  <Field label="Application Version" value={selectedApp.version || '1.0'} onCopy={copy} />

                  <button
                    type="button"
                    onClick={() => setRefreshModal(true)}
                    className="mt-2 cursor-pointer flex items-center gap-1 px-4 py-1.5 bg-yellow-700 text-white text-sm rounded hover:bg-yellow-800 transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Refresh Application Secret
                  </button>

                  <div
                    className="mt-4 flex items-start p-4 mb-4 text-blue-100 bg-blue-900 border border-blue-700 rounded-lg"
                    role="alert"
                  >
                    <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zM9 9V5a1 1 0 012 0v4a1 1 0 11-2 0zm1 4a1.25 1.25 0 100-2.5A1.25 1.25 0 0010 13z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium">Notice!</h3>
                      <div className="text-xs text-blue-200">
                        Application secrets are only displayed for users using our older API endpoints. If you're
                        using our newer API (1.3), application secrets are not used!
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {showCode && selectedApp && (
                <div className="transition-opacity duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <label htmlFor="languageSelect" className="text-sm font-medium text-gray-400 whitespace-nowrap">
                      Select Language:
                    </label>
                    <select
                      id="languageSelect"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full p-2 bg-custom-back-1 text-white rounded focus:outline-none"
                    >
                      {languages.map((lang) => (
                        <option key={lang.id} value={lang.id}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative bg-custom-back-1 rounded-lg p-4">
                    <button
                      type="button"
                      onClick={() => copy(snippets[language])}
                      className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
                      title="Copy to clipboard"
                    >
                      <CopyIcon />
                    </button>
                    <pre className="text-gray-300 text-xs overflow-x-auto whitespace-pre">
                      {snippets[language]}
                    </pre>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copy(snippets[language])}
                      className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition"
                    >
                      <CopyIcon />
                      Copy Credentials
                    </button>
                    <a
                      href={languages.find((l) => l.id === language)?.example}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Example
                    </a>
                    {language === 'csharp' && (
                      <a
                        href="https://github.com/KeyAuth/KeyAuth-Unity-Example"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Unity Example
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* My Applications */}
          <div className="w-full lg:w-2/3 bg-custom-back rounded-xl">
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg pt-5 pb-5 pl-3 pr-3">
              <div className="flex flex-col space-y-3 mb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <p className="text-base font-semibold text-gray-200 whitespace-nowrap">My Applications</p>

                  <div className="relative w-full sm:max-w-md">
                    <div className="flex items-center bg-custom-back-1 rounded-md px-3 py-2">
                      <Search className="w-4 h-4 text-gray-400 mr-2" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search applications..."
                        className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="relative w-full">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="block w-full px-3 py-2 text-sm text-white bg-custom-back-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Applications</option>
                      <option value="active">Active Applications</option>
                      <option value="paused">Paused Applications</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setNewAppName('');
                      setCreateModal(true);
                    }}
                    className="cursor-pointer w-full flex justify-center items-center text-white bg-blue-700 hover:opacity-50 font-medium rounded-lg text-sm px-5 py-2.5 transition duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="whitespace-nowrap">Create Application</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-4">
                {filteredApps.length === 0 && (
                  <div className="bg-custom-back-1 rounded-xl p-5 text-sm text-gray-500">
                    No applications found.
                  </div>
                )}

                {filteredApps.map((app) => {
                  const isSelected = selectedApp?._id === app._id;
                  const paused = app.status === 'paused';
                  const appStats = stats[app._id] || {};
                  return (
                    <div
                      key={app._id}
                      className="bg-custom-back-1 app-card text-black rounded-xl p-5 shadow-sm hover:shadow-md transition duration-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h2 className="text-lg font-semibold text-white">{app.name}</h2>
                          <p className="text-sm text-gray-500">{app.description || ''}</p>
                        </div>
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase ${
                            paused ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {paused ? 'Paused' : 'Active'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 text-center text-sm mb-4">
                        <div>
                          <p className="text-gray-500 text-xs">App Version</p>
                          <p className="font-semibold text-white">{app.version || '1.0'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Users</p>
                          <p className="font-semibold text-white">{appStats.totalUsers ?? 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Application Standing</p>
                          <p className="font-semibold text-white">{paused ? 'Paused' : 'Good'}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={isSelected}
                          onClick={() => selectApp(app)}
                          className={`flex items-center gap-1 px-4 py-1.5 text-white text-sm rounded transition duration-200 ${
                            isSelected
                              ? 'bg-green-800 cursor-not-allowed'
                              : 'bg-green-700 cursor-pointer hover:bg-green-800'
                          }`}
                        >
                          📄 {isSelected ? 'Selected' : 'Select'}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setRenameModal(app);
                            setRenameValue(app.name);
                          }}
                          className="cursor-pointer flex items-center gap-1 px-4 py-1.5 bg-purple-700 text-white text-sm rounded hover:bg-purple-800 transition"
                        >
                          <Pencil className="w-4 h-4" />
                          Rename
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDescriptionModal(app);
                            setDescriptionValue(app.description || '');
                          }}
                          className="cursor-pointer flex items-center gap-1 px-4 py-1.5 bg-cyan-700 text-white text-sm rounded hover:bg-cyan-800 transition"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit Description
                        </button>

                        <button
                          type="button"
                          onClick={() => setPauseModal(app)}
                          className="cursor-pointer flex items-center gap-1 px-4 py-1.5 bg-orange-700 text-white text-sm rounded hover:bg-orange-800 transition"
                        >
                          {paused ? <Play className="w-4 h-4" /> : <CirclePause className="w-4 h-4" />}
                          {paused ? 'Unpause' : 'Pause'}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDeleteModal(app);
                            setConfirmName('');
                          }}
                          className="cursor-pointer flex items-center gap-1 px-4 py-1.5 bg-red-700 text-white text-sm rounded hover:bg-red-800 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Copy toast */}
        <div
          className={`fixed bottom-5 right-5 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg text-sm transition-opacity duration-300 z-50 ${
            toast ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {toast || 'Copied!'}
        </div>
      </div>

      {/* Create Application */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} border="border-blue-700">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-medium text-white">Create A New Application</h3>
            <button onClick={() => setCreateModal(false)} className="text-gray-400 hover:text-white" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleCreate}>
            <FloatInput
              id="appname"
              label="Application Name"
              value={newAppName}
              onChange={(e) => setNewAppName(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5"
            >
              Create App
            </button>
          </form>
        </div>
      </Modal>

      {/* Rename */}
      <Modal open={!!renameModal} onClose={() => setRenameModal(null)} border="border-purple-700">
        <div className="px-6 py-6">
          <h3 className="mb-4 text-xl font-medium text-white">Rename Application</h3>
          <form onSubmit={handleRename}>
            <FloatInput
              id="newappname"
              label="New Application Name"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              autoFocus
              color="peer-focus:border-purple-700"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white bg-purple-700 hover:bg-purple-800 font-medium rounded-lg text-sm px-5 py-2.5"
            >
              Rename Application
            </button>
          </form>
        </div>
      </Modal>

      {/* Description */}
      <Modal open={!!descriptionModal} onClose={() => setDescriptionModal(null)} border="border-cyan-700">
        <div className="px-6 py-6">
          <h3 className="mb-4 text-xl font-medium text-white">Edit Description</h3>
          <form onSubmit={handleDescription}>
            <FloatInput
              id="appdescription"
              label="Application Description"
              value={descriptionValue}
              onChange={(e) => setDescriptionValue(e.target.value)}
              autoFocus
              color="peer-focus:border-cyan-700"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white bg-cyan-700 hover:bg-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5"
            >
              Save Description
            </button>
          </form>
        </div>
      </Modal>

      {/* Pause / Unpause */}
      <Modal open={!!pauseModal} onClose={() => setPauseModal(null)} border="border-orange-700">
        <div className="p-6 text-center">
          <div className="flex items-center p-4 mb-4 text-sm text-orange-200 border border-orange-700 rounded-lg bg-custom-back-1">
            <span className="font-medium text-white">
              Notice! Pausing your app and users will make your application unusable until you unpause it.
            </span>
          </div>
          <h3 className="mb-5 text-lg font-normal text-gray-200">
            Are you sure you want to {pauseModal?.status === 'paused' ? 'unpause' : 'pause'} this application?
          </h3>
          <button
            type="button"
            onClick={handlePause}
            disabled={loading}
            className="text-white bg-orange-700 hover:bg-orange-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 mr-2"
          >
            Yes, I'm sure
          </button>
          <button
            type="button"
            onClick={() => setPauseModal(null)}
            className="inline-flex text-white bg-gray-700 hover:bg-gray-600 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            No, cancel
          </button>
        </div>
      </Modal>

      {/* Delete */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} border="border-red-700">
        <div className="p-6 text-center">
          <div className="flex items-center p-4 mb-4 text-sm text-red-200 border border-red-700 rounded-lg bg-custom-back-1">
            <span className="font-medium text-red-400">
              Notice! You're about to delete your application. <b>This can NOT be undone</b>
            </span>
          </div>
          <h3 className="mb-5 text-lg font-normal text-gray-200">
            Type &quot;{deleteModal?.name}&quot; to confirm deletion.
          </h3>
          <div className="text-left mb-4">
            <FloatInput
              id="confirmappname"
              label="Application Name"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              autoFocus
              color="peer-focus:border-red-700"
            />
          </div>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || confirmName.trim() !== deleteModal?.name}
            className="text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 mr-2 disabled:opacity-50"
          >
            Yes, I'm sure
          </button>
          <button
            type="button"
            onClick={() => setDeleteModal(null)}
            className="inline-flex text-white bg-gray-700 hover:bg-gray-600 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            No, cancel
          </button>
        </div>
      </Modal>

      {/* Refresh secret */}
      <Modal open={refreshModal} onClose={() => setRefreshModal(false)} border="border-yellow-700">
        <div className="p-6 text-center">
          <div className="flex items-center p-4 mb-4 text-sm text-yellow-200 border border-yellow-700 rounded-lg bg-custom-back-1">
            <span className="font-medium text-white">
              Notice! Make sure you change your application secret in your program after refreshing.
            </span>
          </div>
          <h3 className="mb-5 text-lg font-normal text-gray-200">
            Are you sure you want to refresh your application secret?
          </h3>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="text-white bg-yellow-700 hover:bg-yellow-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 mr-2"
          >
            Yes, I'm sure
          </button>
          <button
            type="button"
            onClick={() => setRefreshModal(false)}
            className="inline-flex text-white bg-gray-700 hover:bg-gray-600 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            No, cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}
