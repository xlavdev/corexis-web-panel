import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { InfoTip } from '../components/ui/ka.jsx';
import {
  Home, ChevronsRight, RefreshCw, Image as ImageIcon, CircleAlert, TriangleAlert,
  Key, X, Trash, Funnel, LayoutGrid, List, Download, Layers, CreditCard,
  Copy, UserLock, Save, CirclePlus, Monitor, Lock, Check
} from 'lucide-react';

const FLOAT_INPUT =
  'block px-2.5 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-gray-700 appearance-none focus:outline-none focus:ring-0 peer';
const FLOAT_INPUT_PADDED =
  'block px-2.5 pb-2.5 pt-4 pr-10 w-full text-sm text-white bg-transparent rounded-lg border border-gray-700 appearance-none focus:outline-none focus:ring-0 peer';
const FLOAT_LABEL =
  'absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-custom-back-lbl-1 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1';
const FILTER_SELECT =
  'px-3 py-2 rounded-md bg-custom-back-1 text-white border border-custom-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors';
const BTN = 'inline-flex items-center justify-center text-white font-medium rounded-lg text-sm px-5 py-2.5 transition duration-200';
const ACTION_BTN = 'relative p-2.5 rounded-lg transition group focus:outline-none';

const TABS = [
  { id: 'account', label: 'Account' },
  { id: 'sessions', label: 'Active Sessions' },
  { id: 'logs', label: 'Logs' },
  { id: 'audit-logs', label: 'Audit Logs' },
  { id: 'billing', label: 'Billing' }
];
const TAB_IDS = TABS.map((t) => t.id);

const PLANS = [
  {
    id: 'developer',
    name: 'Developer',
    monthly: '$2.99',
    yearly: '$14.99',
    popular: false,
    features: ['Webhooks', 'Team Management', 'File System', 'User & App Variables'],
    button: 'bg-gray-600 hover:bg-gray-700 text-white'
  },
  {
    id: 'seller',
    name: 'Seller',
    monthly: '$4.99',
    yearly: '$24.99',
    popular: true,
    features: ['All Developer Features', 'Seller API Access', 'Discord Bot', 'Telegram Bot', 'Web-Loader'],
    button: 'bg-blue-600 hover:bg-blue-700 text-white'
  }
];

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const randomSecret = () =>
  Array.from({ length: 32 }, () => BASE32[Math.floor(Math.random() * BASE32.length)]).join('');

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
  });
};

function Toggle({ checked, onChange, label, tip }) {
  return (
    <label className="inline-flex items-center gap-2 mr-5 cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
      <div
        className="w-11 h-6 bg-custom-back rounded-full relative peer-focus:ring-0
          peer-checked:after:translate-x-full peer-checked:after:border-white
          after:content-[''] after:absolute after:top-0.5 after:left-[2px]
          after:bg-white after:border-custom after:border after:rounded-full
          after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
      />
      <div className="flex items-center gap-1 text-sm text-gray-500">
        <span>{label}</span>
        {tip && <InfoTip text={tip} />}
      </div>
    </label>
  );
}

function AccountModal({
  title,
  icon,
  onClose,
  children,
  maxWidth = 'max-w-md',
  closeIcon = false,
  titleClass = 'text-lg font-semibold text-gray-300'
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex min-h-screen items-center justify-center p-4">
        <div className={`relative w-full ${maxWidth} transform overflow-hidden rounded-lg bg-custom-back shadow-xl`}>
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex items-center space-x-3">
              {icon}
              <h3 className={titleClass}>{title}</h3>
            </div>
            {closeIcon && (
              <button type="button" onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

const CancelButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
  >
    Cancel
  </button>
);

const PrimaryButton = ({ children, danger = false, type = 'submit', ...rest }) => (
  <button
    type={type}
    className={`cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
      danger
        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
    }`}
    {...rest}
  >
    {children}
  </button>
);

export default function AccountSettings() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { selectedApp } = useAppContext();

  const [tab, setTab] = useState(() => {
    const initial = (location.hash || window.location.hash || '').replace('#', '');
    return TAB_IDS.includes(initial) ? initial : 'account';
  });
  const [account, setAccount] = useState({
    username: user?.username || '',
    ownerId: user?.ownerId || '',
    pfp: '',
    accountLogs: true,
    emailVerify: true,
    twoFactor: false,
    securityWords: [],
    securityKeys: []
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [modal, setModal] = useState('');
  const [pfpInput, setPfpInput] = useState('');
  const [tfaSecret, setTfaSecret] = useState('');
  const [tfaCode, setTfaCode] = useState('');
  const [tfaError, setTfaError] = useState('');
  const [keyName, setKeyName] = useState('');
  const [words, setWords] = useState([]);
  const [credForm, setCredForm] = useState({ username: '', currentPassword: '', newPassword: '', confirmPassword: '' });
  const [credError, setCredError] = useState('');
  const [credSaving, setCredSaving] = useState(false);
  const [credDone, setCredDone] = useState(false);

  const [logSearch, setLogSearch] = useState('');
  const [showLogFilters, setShowLogFilters] = useState(false);
  const [logSortField, setLogSortField] = useState('date');
  const [logSortDir, setLogSortDir] = useState('desc');
  const [logPageSize, setLogPageSize] = useState(12);
  const [logPage, setLogPage] = useState(1);

  const [auditSearch, setAuditSearch] = useState('');
  const [auditView, setAuditView] = useState('cards');

  const [period, setPeriod] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState('developer');

  const tabRefs = useRef({});
  const [slider, setSlider] = useState({ width: 0, x: 0 });

  /* Hash based tab selection (#account, #billing ...) */
  useEffect(() => {
    const applyHash = () => {
      const next = (window.location.hash || '').replace('#', '');
      if (TAB_IDS.includes(next)) setTab(next);
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, []);

  useEffect(() => {
    const next = (location.hash || '').replace('#', '');
    if (TAB_IDS.includes(next)) setTab(next);
  }, [location.hash]);

  useEffect(() => {
    const measure = () => {
      const el = tabRefs.current[tab];
      if (el) setSlider({ width: el.offsetWidth, x: el.offsetLeft });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [tab]);

  const selectTab = (next) => {
    setTab(next);
    if (window.location.hash !== `#${next}`) {
      window.history.replaceState(null, '', `#${next}`);
    }
  };

  const loadAccount = async () => {
    setLoading(true);
    try {
      const res = await api.get('/account');
      if (res.data.success) {
        setAccount((prev) => ({ ...prev, ...res.data.account }));
        setLogs(res.data.logs || []);
        if (res.data.account.securityWords?.length) setWords(res.data.account.securityWords);
      }
    } catch {
      /* keep the account shell visible if the request fails */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccount();
  }, []);

  useEffect(() => {
    setLogPage(1);
  }, [logSearch, logSortField, logSortDir, logPageSize]);

  const filteredLogs = useMemo(() => {
    const term = logSearch.trim().toLowerCase();
    let list = logs.filter((log) => {
      if (!term) return true;
      return [log.ip, log.userAgent, formatDate(log.date)]
        .join(' ')
        .toLowerCase()
        .includes(term);
    });

    const dir = logSortDir === 'asc' ? 1 : -1;
    list = [...list].sort((a, b) => {
      let av;
      let bv;
      if (logSortField === 'ip') {
        av = a.ip || '';
        bv = b.ip || '';
      } else if (logSortField === 'useragent') {
        av = a.userAgent || '';
        bv = b.userAgent || '';
      } else {
        av = new Date(a.date).getTime();
        bv = new Date(b.date).getTime();
        return (av - bv) * dir;
      }
      return av.localeCompare(bv) * dir;
    });
    return list;
  }, [logs, logSearch, logSortField, logSortDir]);

  const totalLogPages = Math.max(1, Math.ceil(filteredLogs.length / logPageSize));
  const currentLogPage = Math.min(logPage, totalLogPages);
  const pageLogs = filteredLogs.slice(
    (currentLogPage - 1) * logPageSize,
    currentLogPage * logPageSize
  );

  const saveAccount = async () => {
    setSaving(true);
    try {
      const res = await api.put('/account', {
        pfp: account.pfp,
        accountLogs: account.accountLogs,
        emailVerify: account.emailVerify
      });
      if (res.data.success) {
        setAccount((prev) => ({ ...prev, ...res.data.account }));
        setSaved(true);
        setTimeout(() => setSaved(false), 1600);
      }
    } catch {
      /* noop */
    } finally {
      setSaving(false);
    }
  };

  const openModal = (name) => {
    setTfaCode('');
    setTfaError('');
    if (name === 'pfp') setPfpInput(account.pfp || '');
    if (name === 'enable-tfa') setTfaSecret(randomSecret());
    setModal(name);
  };

  const closeModal = () => setModal('');

  const submitCredentials = async (event) => {
    event.preventDefault();
    setCredError('');
    if (credForm.newPassword && credForm.newPassword !== credForm.confirmPassword) {
      setCredError('New passwords do not match.');
      return;
    }
    if ((credForm.newPassword || credForm.username !== account.username) && !credForm.currentPassword) {
      setCredError('Please enter your current password.');
      return;
    }
    setCredSaving(true);
    try {
      const res = await api.post('/account/credentials', {
        username: credForm.username.trim(),
        currentPassword: credForm.currentPassword,
        newPassword: credForm.newPassword || undefined
      });
      if (res.data.success) {
        setCredDone(true);
        setCredForm((prev) => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      } else {
        setCredError(res.data.message || 'Could not update credentials.');
      }
    } catch (err) {
      setCredError(err?.response?.data?.message || 'Could not update credentials.');
    } finally {
      setCredSaving(false);
    }
  };

  const savePfp = async (event) => {
    event.preventDefault();
    try {
      const res = await api.put('/account', { pfp: pfpInput.trim() });
      if (res.data.success) {
        setAccount((prev) => ({ ...prev, ...res.data.account }));
        closeModal();
      }
    } catch {
      /* noop */
    }
  };

  const submitTwoFactor = async (enabled) => {
    if (!/^\d{6}$/.test(tfaCode)) {
      setTfaError('Please enter a valid 6 digit code.');
      return;
    }
    try {
      const res = await api.post('/account/2fa', { enabled, code: tfaCode });
      if (res.data.success) {
        setAccount((prev) => ({ ...prev, ...res.data.account }));
        closeModal();
      } else {
        setTfaError(res.data.message || 'Could not update two factor authentication.');
      }
    } catch (err) {
      setTfaError(err?.response?.data?.message || 'Could not update two factor authentication.');
    }
  };

  const generateWords = async () => {
    try {
      const res = await api.post('/account/security-words');
      if (res.data.success) {
        setWords(res.data.words);
        setAccount((prev) => ({ ...prev, securityWords: res.data.words }));
        openModal('security-words');
      }
    } catch {
      /* noop */
    }
  };

  const copyWords = async () => {
    try {
      await navigator.clipboard.writeText(words.join(' '));
    } catch {
      /* noop */
    }
  };

  const addSecurityKey = async () => {
    if (!keyName.trim()) return;
    try {
      const res = await api.post('/account/security-keys', { name: keyName.trim() });
      if (res.data.success) {
        setAccount((prev) => ({ ...prev, ...res.data.account }));
        setKeyName('');
        openModal('fido');
      }
    } catch {
      /* noop */
    }
  };

  const deleteAccountLogs = async () => {
    try {
      const res = await api.delete('/account/logs');
      if (res.data.success) {
        setLogs([]);
        closeModal();
      }
    } catch {
      /* noop */
    }
  };

  const deleteAuditLogs = async () => {
    try {
      await api.delete('/account/audit-logs');
      closeModal();
    } catch {
      /* noop */
    }
  };

  const exportLogs = () => {
    const rows = [
      ['Date', 'IP', 'User Agent'],
      ...filteredLogs.map((log) => [formatDate(log.date), log.ip, log.userAgent])
    ];
    const csv = rows
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'account-logs.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(
    `otpauth://totp/${account.username || 'corexis'}?secret=${tfaSecret}&issuer=KeyAuth`
  )}&size=200&margin=1`;

  const cashappAmount =
    selectedPlan === 'seller'
      ? period === 'yearly'
        ? '$24.99'
        : '$4.99'
      : period === 'yearly'
        ? '$14.99'
        : '$2.99';

  const activeTab = 'relative z-10 px-7 py-2 rounded-xl font-semibold text-white transition-colors';
  const idleTab =
    'relative z-10 px-7 py-2 rounded-xl font-semibold text-white/70 hover:text-white transition-colors';

  return (
    <div className="p-4 block sm:flex items-center justify-between lg:mt-1.5 rounded-xl">
      <div className="mb-1 w-full mt-2 md:mt-2 rounded-xl">
        {/* Header */}
        <div className="mb-4 p-8 bg-custom-back rounded-lg">
          <nav className="flex mb-5" aria-label="Breadcrumb">
            <ol className="inline-flex flex-wrap items-center gap-y-1 space-x-1 md:space-x-2">
              <li className="inline-flex items-center">
                <a
                  href="/app/manage-apps"
                  className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white"
                >
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
              <li className="inline-flex items-center">
                <ChevronsRight size={14} className="mr-2 text-gray-400" />
                <label className="inline-flex items-center text-sm font-medium text-red-600">
                  You don't have a subscription!
                  <a href="#billing" className="text-blue-600 hover:underline ml-1">
                    Upgrade Now.
                  </a>
                </label>
              </li>
            </ol>
          </nav>
          <h1 className="text-xl font-semibold text-white sm:text-2xl">Account Settings</h1>
          <p className="text-xs text-gray-500">
            Manage your account, view active sessions, Manager/Reseller activity and upgrade your account!
          </p>
        </div>

        {/* Segmented tabs */}
        <div className="mb-4 flex justify-center">
          <div className="block sm:hidden w-full px-4">
            <select
              id="mobile-tab-select-account"
              value={tab}
              onChange={(e) => selectTab(e.target.value)}
              className="w-full bg-custom-back-1 border border-white/10 text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="account">Account</option>
              <option value="sessions">Active Sessions</option>
              <option value="logs">Logs</option>
              <option value="audit-logs">Audit Logs</option>
              <option value="billing">Billing</option>
            </select>
          </div>

          <div className="hidden sm:block max-w-full">
            <div
              id="tabs-segmented-account-settings"
              className="relative inline-flex rounded-2xl p-1 border border-white/10 bg-custom-back/90 gap-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_2px_10px_rgba(0,0,0,0.25)]"
            >
              <span
                id="tabs-slider-account-settings"
                className="absolute top-1 bottom-1 left-0 rounded-xl bg-gray-600/30 ring-1 ring-black/40 shadow-[0_1px_1px_rgba(0,0,0,0.35)] pointer-events-none"
                style={{
                  width: slider.width,
                  transform: `translateX(${slider.x}px)`,
                  transition:
                    'transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1), width 260ms cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
              />
              {TABS.map((item) => (
                <button
                  key={item.id}
                  ref={(el) => {
                    tabRefs.current[item.id] = el;
                  }}
                  data-tab={item.id}
                  type="button"
                  aria-selected={tab === item.id}
                  onClick={() => selectTab(item.id)}
                  className={tab === item.id ? activeTab : idleTab}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main card */}
        <div className="p-4 flex flex-col bg-custom-back rounded-lg">
          <div className="overflow-x-auto">
            {/* Account */}
            <form
              method="post"
              onSubmit={(e) => {
                e.preventDefault();
                saveAccount();
              }}
            >
              <div id="account-content" className={tab === 'account' ? '' : 'hidden'}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Profile */}
                  <div className="bg-custom-back-1 rounded-xl shadow p-6 flex flex-col min-h-[150px]">
                    <h2 className="font-bold text-lg mb-2">Profile Information</h2>

                    <div
                      className="flex items-center gap-4 mb-4 cursor-pointer"
                      onClick={() => openModal('pfp')}
                    >
                      <img
                        src={account.pfp || '/favicon.svg'}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover bg-custom-back"
                      />
                      <span className="flex items-center gap-2 text-gray-300 text-sm hover:underline cursor-pointer">
                        <ImageIcon className="w-4 h-4" />
                        Change profile picture
                      </span>
                    </div>

                    <div className="relative mb-4 mt-4">
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={account.username}
                        readOnly
                        autoComplete="on"
                        placeholder=" "
                        className={FLOAT_INPUT_PADDED}
                      />
                      <label htmlFor="username" className={FLOAT_LABEL}>
                        Username
                      </label>
                      <button
                        type="button"
                        onClick={loadAccount}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-blue-500 transition cursor-pointer"
                        aria-label="Refresh account"
                      >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>

                    <div className="relative mb-4 mt-4">
                      <input
                        type="text"
                        id="ownerid"
                        name="ownerid"
                        value={account.ownerId || ''}
                        readOnly
                        autoComplete="on"
                        placeholder=" "
                        className={FLOAT_INPUT}
                      />
                      <label htmlFor="ownerid" className={FLOAT_LABEL}>
                        OwnerID
                      </label>
                    </div>

                    <div className="relative mb-4 mt-4">
                      <input
                        type="text"
                        id="expires"
                        name="expires"
                        value="The tester subscription never expires"
                        readOnly
                        autoComplete="on"
                        placeholder=" "
                        className={FLOAT_INPUT}
                      />
                      <label htmlFor="expires" className={FLOAT_LABEL}>
                        Subscription Expires
                      </label>
                    </div>

                    <div className="flex gap-3 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setCredError('');
                          setCredDone(false);
                          setCredForm({ username: account.username || '', currentPassword: '', newPassword: '', confirmPassword: '' });
                          openModal('credentials');
                        }}
                        className={`${BTN} bg-custom-back hover:opacity-60 cursor-pointer`}
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Change Username / Password
                      </button>
                    </div>
                  </div>

                  {/* Security */}
                  <div className="bg-custom-back-1 rounded-xl shadow p-6 flex flex-col min-h-[150px]">
                    <h2 className="font-bold text-lg mb-2">Security</h2>
                    <div className="flex flex-col space-y-3">
                      <Toggle
                        checked={account.accountLogs}
                        onChange={(e) =>
                          setAccount((prev) => ({ ...prev, accountLogs: e.target.checked }))
                        }
                        label="Account Logs"
                        tip="Receive alerts for all account activity."
                      />
                      <Toggle
                        checked={account.emailVerify}
                        onChange={(e) =>
                          setAccount((prev) => ({ ...prev, emailVerify: e.target.checked }))
                        }
                        label="New Location Alerts"
                        tip="If enabled, you must verify your email in order to log into your account."
                      />
                      <Toggle
                        checked={account.twoFactor}
                        onChange={() => openModal(account.twoFactor ? 'disable-tfa' : 'enable-tfa')}
                        label="Two Factor Authentication"
                        tip="Require a 6 digit code to log into your account. Two factor authentication codes typically change every 30 seconds."
                      />
                    </div>

                    <hr className="my-6 border-blue-500" />

                    <h2 className="font-bold text-lg mb-2">Fido - Security Key</h2>
                    <span className="text-xs text-gray-500 mb-3">
                      Add a security key to your account for better account protection.
                    </span>
                    <div>
                      <div className="relative mb-4">
                        <input
                          type="text"
                          id="webauthn_name"
                          name="webauthn_name"
                          value={keyName}
                          onChange={(e) => setKeyName(e.target.value)}
                          placeholder=" "
                          maxLength={99}
                          autoComplete="on"
                          className={FLOAT_INPUT}
                        />
                        <label htmlFor="webauthn_name" className={FLOAT_LABEL}>
                          New Security Key Name
                        </label>
                      </div>

                      <div className="flex justify-end mt-5">
                        <button
                          type="button"
                          onClick={() => openModal('fido')}
                          className={`mr-3 cursor-pointer inline-flex items-center gap-x-2 text-white bg-custom-back hover:opacity-60 focus:ring-0 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 transition duration-200`}
                          id="view-security-keys"
                        >
                          <UserLock className="w-[18px] h-[18px]" />
                          View Existing Security Key(s)
                        </button>

                        <button
                          type="button"
                          id="add-security-key-btn"
                          onClick={addSecurityKey}
                          disabled={!keyName.trim()}
                          title="Please enter a security key name above to proceed"
                          className="cursor-pointer inline-flex items-center gap-x-2 text-white bg-custom-back hover:opacity-60 focus:ring-0 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <UserLock className="w-[18px] h-[18px]" />
                          Add Security Key
                        </button>
                      </div>
                    </div>

                    <hr className="my-6 border-blue-500" />

                    <h2 className="font-bold text-lg mb-1">Security Words</h2>
                    <div>
                      <span className="text-xs text-gray-500">
                        These are used to verify your identity if you forget your password.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={generateWords}
                      id="generate-secwords-btn"
                      className="self-start cursor-pointer inline-flex text-white bg-custom-back hover:opacity-60 focus:ring-0 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 transition duration-200 mt-6"
                    >
                      <CirclePlus className="w-4 h-4 mr-2" />
                      Generate Security Words
                    </button>

                    <div className="flex justify-end mt-5 items-center gap-3">
                      {saved && (
                        <span className="text-xs text-green-400 inline-flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Saved
                        </span>
                      )}
                      <button
                        type="submit"
                        name="updatesettings"
                        id="updatesettings"
                        disabled={saving}
                        className="cursor-pointer inline-flex items-center text-white bg-blue-700 hover:opacity-60 focus:ring-0 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 transition duration-200 disabled:opacity-60"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>

                  {/* Danger zone */}
                  <div className="bg-custom-back-1 rounded-xl shadow p-6 flex flex-col min-h-[100px] md:col-span-2">
                    <h2 className="font-bold text-lg mb-2">Danger Zone</h2>
                    <a
                      href="https://keyauth.cc/deleteAccount/"
                      target="_blank"
                      rel="noreferrer"
                      className={`${BTN} bg-red-700 hover:opacity-60 mb-2`}
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Delete Account
                    </a>
                  </div>
                </div>
              </div>
            </form>

            {/* Active Sessions */}
            <div id="sessions-content" className={tab === 'sessions' ? '' : 'hidden'}>
              <div className="bg-custom-back-1 rounded-xl shadow p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Active Sessions</h2>
                    <p className="text-sm text-gray-400 mt-1">
                      Manage your active login sessions across different devices
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openModal('terminate-all')}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center self-start sm:self-auto"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Terminate All Other Sessions
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Monitor className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-400">No active sessions found</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <CircleAlert className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-blue-300 font-medium">Security Information</h4>
                      <p className="text-blue-200 text-sm mt-1">
                        Sessions are automatically cleaned up after 7 days of inactivity. If you notice any
                        suspicious sessions, terminate them immediately and change your password.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Logs */}
            <div id="logs-content" className={tab === 'logs' ? '' : 'hidden'}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <input
                    id="logs-search"
                    type="text"
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    placeholder="Search Account Logs..."
                    className="px-3 py-2 rounded-md bg-custom-back-1 text-white placeholder-gray-400 w-full sm:max-w-sm border border-custom-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    id="toggle-acclogs-filters"
                    type="button"
                    onClick={() => setShowLogFilters((v) => !v)}
                    className={`${ACTION_BTN} ${
                      showLogFilters
                        ? 'bg-blue-600/20 hover:bg-blue-600/40 border border-blue-600/30 text-blue-400'
                        : 'bg-blue-600/20 hover:bg-blue-600/40 border border-blue-600/30 text-blue-400'
                    }`}
                  >
                    <Funnel className="w-4 h-4" />
                    <span className="pointer-events-none absolute top-full mt-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-custom-back-1 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg z-20">
                      Toggle Filters
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openModal('delete-acc-logs')}
                    className={`${ACTION_BTN} bg-red-600/20 hover:bg-red-600/40 border border-red-600/30 text-red-400`}
                  >
                    <Trash className="w-4 h-4 transition-all duration-200 group-hover:scale-125 group-hover:rotate-6 group-hover:text-red-400" />
                    <span className="pointer-events-none absolute top-full mt-1 left-auto right-0 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-custom-back-1 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg z-20">
                      Delete All Logs
                    </span>
                  </button>
                </div>
              </div>

              {showLogFilters && (
                <div
                  id="acclogs-filters"
                  className="flex gap-3 mb-4 p-3 bg-custom-back-1/50 rounded-lg border border-custom transition-all duration-300 ease-in-out"
                >
                  <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    <div className="flex flex-col">
                      <label className="text-xs text-gray-400 mb-1 font-medium">Sort By</label>
                      <select
                        id="sortField"
                        value={logSortField}
                        onChange={(e) => setLogSortField(e.target.value)}
                        className={FILTER_SELECT}
                      >
                        <option value="date">Date</option>
                        <option value="ip">IP</option>
                        <option value="useragent">User Agent</option>
                      </select>
                    </div>

                    <div className="flex flex-col">
                      <label className="text-xs text-gray-400 mb-1 font-medium">Order</label>
                      <select
                        id="sortDir"
                        value={logSortDir}
                        onChange={(e) => setLogSortDir(e.target.value)}
                        className={FILTER_SELECT}
                      >
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                      </select>
                    </div>

                    <div className="flex flex-col">
                      <label className="text-xs text-gray-400 mb-1 font-medium">Per Page</label>
                      <select
                        id="page-size-selector"
                        value={logPageSize}
                        onChange={(e) => setLogPageSize(Number(e.target.value))}
                        className={FILTER_SELECT}
                      >
                        <option value={12}>12 per page</option>
                        <option value={24}>24 per page</option>
                        <option value={36}>36 per page</option>
                        <option value={48}>48 per page</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="relative overflow-x-auto shadow-md sm:rounded-lg pt-5">
                <div id="accountLogs-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {loading ? (
                    <div className="col-span-full text-center text-gray-400 py-10">Loading account logs...</div>
                  ) : pageLogs.length === 0 ? (
                    <div className="col-span-full text-center text-gray-400 py-10 flex flex-col items-center gap-3">
                      <div>📦 No account logs found.</div>
                      <p className="text-xs text-gray-500">Log in activity will appear here.</p>
                    </div>
                  ) : (
                    pageLogs.map((log) => (
                      <div
                        key={log._id}
                        className="bg-custom-back-1 rounded-xl shadow p-5 flex flex-col gap-1 border border-custom-1 transition hover:scale-[1.02] hover:shadow-lg"
                      >
                        <div className="flex items-center gap-2 text-blue-300 text-xs">
                          <span>{formatDate(log.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white break-all">
                          <span className="blur-[3.5px] hover:blur-none transition cursor-pointer">
                            {log.ip}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 break-all">
                          <span className="blur-[3.5px] hover:blur-none transition cursor-pointer">
                            {log.userAgent}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex justify-between items-center mt-4 text-white">
                  <button
                    id="prevPage"
                    type="button"
                    onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                    disabled={currentLogPage <= 1}
                    className="cursor-pointer bg-custom-back-1 px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-custom-back-1"
                  >
                    Previous
                  </button>
                  <span id="pagination-info" className="text-sm">
                    Showing page {currentLogPage} of {totalLogPages}
                  </span>
                  <button
                    id="nextPage"
                    type="button"
                    onClick={() => setLogPage((p) => Math.min(totalLogPages, p + 1))}
                    disabled={currentLogPage >= totalLogPages}
                    className="cursor-pointer bg-custom-back-1 px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-custom-back-1"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/* Audit Logs */}
            <div id="audit-logs-content" className={tab === 'audit-logs' ? '' : 'hidden'}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <input
                    id="audit-logs-search"
                    type="text"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    placeholder="Search Audit Logs..."
                    className="px-3 py-2 rounded-md bg-custom-back-1 text-white placeholder-gray-400 w-full sm:max-w-sm border border-custom-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    id="auditlogs-view-toggle"
                    type="button"
                    onClick={() => setAuditView(auditView === 'cards' ? 'table' : 'cards')}
                    className={`${ACTION_BTN} bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-600/30 text-cyan-400`}
                  >
                    {auditView === 'cards' ? (
                      <LayoutGrid className="w-4 h-4 transition-all duration-200 group-hover:scale-110 group-hover:text-cyan-400" />
                    ) : (
                      <List className="w-4 h-4 transition-all duration-200 group-hover:scale-110 group-hover:text-cyan-400" />
                    )}
                    <span className="pointer-events-none absolute top-full mt-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-custom-back-1 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg z-20">
                      Toggle View
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={exportLogs}
                    className={`${ACTION_BTN} bg-green-600/20 hover:bg-green-600/40 border border-green-600/30 text-green-400`}
                  >
                    <Download className="w-4 h-4 transition-all duration-200 group-hover:scale-110 group-hover:text-green-400" />
                    <span className="pointer-events-none absolute top-full mt-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-custom-back-1 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg z-20">
                      Export Logs
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openModal('delete-audit-logs')}
                    className={`${ACTION_BTN} bg-red-600/20 hover:bg-red-600/40 border border-red-600/30 text-red-400`}
                  >
                    <Trash className="w-4 h-4 transition-all duration-200 group-hover:scale-125 group-hover:rotate-6 group-hover:text-red-400" />
                    <span className="pointer-events-none absolute top-full mt-1 left-auto right-0 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-custom-back-1 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg z-20">
                      Delete All Logs
                    </span>
                  </button>
                </div>
              </div>

              <div className="relative overflow-x-auto shadow-md sm:rounded-lg pt-5">
                {auditView === 'cards' ? (
                  <div id="auditLogs-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="col-span-full text-center text-gray-400 py-10 flex flex-col items-center gap-3">
                      <div>📦 No audit logs found.</div>
                      <p className="text-xs text-gray-500">
                        Audit logs track the activity of your managers and resellers.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-white">
                      <thead>
                        <tr className="text-blue-700 border-b border-custom">
                          <th className="px-3 py-3 font-normal">Date</th>
                          <th className="px-3 py-3 font-normal">User</th>
                          <th className="px-3 py-3 font-normal">Action</th>
                          <th className="px-3 py-3 font-normal">IP</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={4} className="text-center py-10 text-gray-400">
                            📦 No audit logs found.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex justify-between items-center mt-4 text-white">
                  <button
                    id="auditlogs-prevPage"
                    type="button"
                    disabled
                    className="cursor-pointer bg-custom-back-1 px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-custom-back-1"
                  >
                    Previous
                  </button>
                  <span id="auditlogs-pagination-info" className="text-sm" />
                  <button
                    id="auditlogs-nextPage"
                    type="button"
                    disabled
                    className="cursor-pointer bg-custom-back-1 px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-custom-back-1"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/* Billing */}
            <div id="billing-content" className={tab === 'billing' ? '' : 'hidden'}>
              <div className="bg-custom-back-1 rounded-xl shadow p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      Premium Billing
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                      Upgrade to unlock premium features and capabilities.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href="https://keyauth.cc/pricing/"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      View Plans
                    </a>
                    <button
                      type="button"
                      onClick={() => openModal('upgrade')}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Layers className="w-4 h-4" />
                      Upgrade Now
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Premium Features Available</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        title: 'Webhooks',
                        text: 'Automate actions on events and integrate with external services.'
                      },
                      {
                        title: 'Team',
                        text: 'Collaborate with teammates and manage permissions.'
                      },
                      {
                        title: 'File System',
                        text: 'Upload files to the dashboard, download through the API.'
                      },
                      {
                        title: 'Variable Management',
                        text: 'Manage user and application variables.'
                      }
                    ].map((feature) => (
                      <div
                        key={feature.title}
                        className="p-4 rounded-lg border border-custom-1 bg-custom-back relative"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
                            <p className="text-sm text-gray-400">{feature.text}</p>
                          </div>
                          <div className="ml-2 flex-shrink-0">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600/20 text-blue-400 border border-blue-600/30">
                              Premium
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-900/20 border-yellow-700 text-yellow-200 border rounded-lg text-sm">
                  You're currently on the{' '}
                  <b>
                    <u>Tester</u>
                  </b>{' '}
                  plan. Upgrade to Developer or Seller to access premium features.
                </div>
              </div>

              <div className="mt-6 p-4 border rounded-lg bg-yellow-900/20 border-yellow-700 text-sm">
                <b>Disclaimer:</b> We do not store any credit card information, nor do we automatically
                charge your card. You must purchase again to keep your plan active.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change profile picture modal */}
      {modal === 'pfp' && (
        <AccountModal
          title="Change Profile Picture"
          icon={<CircleAlert className="w-5 h-5 text-red-500" />}
          onClose={closeModal}
        >
          <form className="space-y-6" onSubmit={savePfp}>
            <div className="px-6 pb-4">
              <div className="relative w-full mt-2">
                <label className="text-gray-400 text-sm" htmlFor="pfp">
                  Link to your profile picture (URL) <span className="text-red-500">*</span>
                </label>

                <div className="flex items-center">
                  <input
                    type="text"
                    id="pfp"
                    name="pfp"
                    value={pfpInput}
                    onChange={(e) => setPfpInput(e.target.value)}
                    required
                    autoComplete="on"
                    className="peer block px-2.5 pb-2.5 pt-4 w-full text-sm text-white bg-custom-back-1 rounded-lg border border-custom appearance-none focus:outline-none focus:ring-0"
                  />

                  <div className="relative group ml-2 flex-shrink-0">
                    <CircleAlert className="w-4 h-4 text-blue-500 group-hover:text-blue-400 cursor-pointer" />
                    <div className="absolute right-0 z-20 mt-2 hidden w-max max-w-xs group-hover:block">
                      <div className="relative bg-custom-back-1 text-white text-xs rounded px-2 py-1 shadow-lg">
                        We use links for profile pictures, so you can use any image hosting service like
                        Imgur or Discord. Make sure the link ends with an image extension (e.g., .jpg,
                        .png).
                        <div className="absolute -top-1.5 right-2 w-2 h-2 bg-custom-back-1 rotate-45" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-custom-back-1 px-6 py-4">
              <div className="flex space-x-3 justify-end">
                <CancelButton onClick={closeModal} />
                <PrimaryButton>Set new image</PrimaryButton>
              </div>
            </div>
          </form>
        </AccountModal>
      )}

      {/* Enable 2FA modal */}
      {modal === 'enable-tfa' && (
        <AccountModal
          title="Enable Two Factor Authentication"
          icon={<CircleAlert className="w-5 h-5 text-red-500" />}
          onClose={closeModal}
        >
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              submitTwoFactor(true);
            }}
          >
            <div className="px-6 pb-4">
              <div className="relative w-full mt-4">
                <label className="text-sm text-gray-500">
                  Scan this QR code with your authenticator app.
                </label>
                <div className="flex justify-center mt-4 mb-2">
                  <img
                    src={qrUrl}
                    alt="Two factor authentication QR code"
                    className="w-[200px] h-[200px] rounded-lg bg-white p-1"
                  />
                </div>
                <label className="text-sm text-gray-500 mt-2 block">
                  QR code not working? Enter this code manually:{' '}
                  <code className="text-blue-700 break-all">{tfaSecret}</code>
                </label>

                <div className="flex items-center mt-3">
                  <input
                    type="text"
                    id="tfaentry"
                    name="tfaentry"
                    value={tfaCode}
                    onChange={(e) => setTfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Two Factor Authentiation Code"
                    required
                    autoComplete="on"
                    className="peer block px-2.5 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-custom appearance-none focus:outline-none focus:ring-0"
                  />

                  <div className="relative group ml-2 flex-shrink-0">
                    <CircleAlert className="w-4 h-4 text-blue-500 group-hover:text-blue-400 cursor-pointer" />
                    <div className="absolute right-0 z-20 mt-2 hidden w-max max-w-xs group-hover:block">
                      <div className="relative bg-custom-back-1 text-white text-xs rounded px-2 py-1 shadow-lg">
                        The authentication code generated by your authenticator app.
                        <div className="absolute -top-1.5 right-2 w-2 h-2 bg-custom-back-1 rotate-45" />
                      </div>
                    </div>
                  </div>
                </div>
                {tfaError && <p className="text-xs text-red-400 mt-2">{tfaError}</p>}
              </div>
            </div>

            <div className="bg-custom-back-1 px-6 py-4">
              <div className="flex space-x-3 justify-end">
                <CancelButton onClick={closeModal} />
                <PrimaryButton>Enable 2FA</PrimaryButton>
              </div>
            </div>
          </form>
        </AccountModal>
      )}

      {/* Disable 2FA modal */}
      {modal === 'disable-tfa' && (
        <AccountModal
          title="Disable Two Factor Authentication"
          icon={<CircleAlert className="w-5 h-5 text-red-500" />}
          onClose={closeModal}
        >
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              submitTwoFactor(false);
            }}
          >
            <div className="px-6 pb-4">
              <div className="relative w-full mt-4">
                <div className="flex items-center">
                  <input
                    type="text"
                    id="tfaentry-disable"
                    name="tfaentry-disable"
                    value={tfaCode}
                    onChange={(e) => setTfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Two Factor Authentiation Code"
                    required
                    autoComplete="on"
                    className="peer block px-2.5 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-custom appearance-none focus:outline-none focus:ring-0"
                  />

                  <div className="relative group ml-2 flex-shrink-0">
                    <CircleAlert className="w-4 h-4 text-blue-500 group-hover:text-blue-400 cursor-pointer" />
                    <div className="absolute right-0 z-20 mt-2 hidden w-max max-w-xs group-hover:block">
                      <div className="relative bg-custom-back-1 text-white text-xs rounded px-2 py-1 shadow-lg">
                        The authentication code generated by your authenticator app.
                        <div className="absolute -top-1.5 right-2 w-2 h-2 bg-custom-back-1 rotate-45" />
                      </div>
                    </div>
                  </div>
                </div>
                {tfaError && <p className="text-xs text-red-400 mt-2">{tfaError}</p>}
              </div>
            </div>

            <div className="bg-custom-back-1 px-6 py-4">
              <div className="flex space-x-3 justify-end">
                <CancelButton onClick={closeModal} />
                <PrimaryButton>Disable 2FA</PrimaryButton>
              </div>
            </div>
          </form>
        </AccountModal>
      )}

      {/* Security keys modal */}
      {modal === 'fido' && (
        <AccountModal
          title="Existing (FIDO) Security Key(s)"
          icon={<CircleAlert className="w-5 h-5 text-red-500" />}
          onClose={closeModal}
        >
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              closeModal();
            }}
          >
            <div className="px-6 pb-4">
              <div className="relative w-full mt-4">
                {account.securityKeys?.length ? (
                  <div className="space-y-2">
                    {account.securityKeys.map((key, index) => (
                      <div
                        key={`${key.name}-${index}`}
                        className="flex items-center gap-2 bg-custom-back-1 rounded-lg p-3"
                      >
                        <UserLock className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-white break-all">{key.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No Security Keys Found...</p>
                )}
              </div>
            </div>

            <div className="bg-custom-back-1 px-6 py-4">
              <div className="flex space-x-3 justify-end">
                <button
                  type="submit"
                  className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </form>
        </AccountModal>
      )}

      {/* Terminate all sessions modal */}
      {modal === 'terminate-all' && (
        <AccountModal
          title="Terminate All Sessions"
          icon={<TriangleAlert className="w-5 h-5 text-red-500" />}
          onClose={closeModal}
        >
          <div className="px-6 pb-4">
            <p className="text-sm text-gray-400 mb-4">
              Are you sure you want to terminate all other sessions? This will log you out from all other
              devices and browsers.
            </p>
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 mb-4">
              <p className="text-red-300 text-xs mb-2">
                <strong>This action will:</strong>
              </p>
              <ul className="text-red-300 text-xs space-y-1 ml-4">
                <li>• Log you out from all other devices</li>
                <li>• Keep your current session active</li>
                <li>• Require re-authentication on other devices</li>
              </ul>
            </div>
          </div>

          <div className="bg-custom-back-1 px-6 py-4">
            <div className="flex space-x-3 justify-end">
              <CancelButton onClick={closeModal} />
              <PrimaryButton danger type="button" onClick={closeModal}>
                <Trash className="w-4 h-4 inline mr-2" />
                Terminate All Other Sessions
              </PrimaryButton>
            </div>
          </div>
        </AccountModal>
      )}

      {/* Credentials modal */}
      {modal === 'credentials' && (
        <AccountModal
          title="Change Username / Password"
          icon={<Lock className="w-5 h-5 text-blue-500" />}
          onClose={closeModal}
          closeIcon
        >
          {credDone ? (
            <>
              <div className="px-6 pb-4">
                <p className="text-sm text-gray-300">
                  Credentials updated successfully. Please sign in again with your new details.
                </p>
              </div>
              <div className="bg-custom-back-1 px-6 py-4 flex justify-end">
                <PrimaryButton type="button" onClick={logout}>
                  Go to Sign In
                </PrimaryButton>
              </div>
            </>
          ) : (
            <form onSubmit={submitCredentials}>
              <div className="px-6 pb-4 space-y-4">
                {credError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    {credError}
                  </div>
                )}

                <div className="relative">
                  <input
                    type="text"
                    id="cred-username"
                    name="cred-username"
                    value={credForm.username}
                    onChange={(e) => setCredForm({ ...credForm, username: e.target.value })}
                    placeholder=" "
                    className={FLOAT_INPUT}
                  />
                  <label htmlFor="cred-username" className={FLOAT_LABEL}>
                    Username
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="password"
                    id="cred-current"
                    name="cred-current"
                    value={credForm.currentPassword}
                    onChange={(e) => setCredForm({ ...credForm, currentPassword: e.target.value })}
                    placeholder=" "
                    className={FLOAT_INPUT}
                  />
                  <label htmlFor="cred-current" className={FLOAT_LABEL}>
                    Current Password
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="password"
                    id="cred-new"
                    name="cred-new"
                    value={credForm.newPassword}
                    onChange={(e) => setCredForm({ ...credForm, newPassword: e.target.value })}
                    placeholder=" "
                    className={FLOAT_INPUT}
                  />
                  <label htmlFor="cred-new" className={FLOAT_LABEL}>
                    New Password (leave blank to keep)
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="password"
                    id="cred-confirm"
                    name="cred-confirm"
                    value={credForm.confirmPassword}
                    onChange={(e) => setCredForm({ ...credForm, confirmPassword: e.target.value })}
                    placeholder=" "
                    className={FLOAT_INPUT}
                  />
                  <label htmlFor="cred-confirm" className={FLOAT_LABEL}>
                    Confirm New Password
                  </label>
                </div>
              </div>

              <div className="bg-custom-back-1 px-6 py-4">
                <div className="flex space-x-3 justify-end">
                  <CancelButton onClick={closeModal} />
                  <PrimaryButton type="submit" disabled={credSaving}>
                    {credSaving ? 'Saving...' : 'Save Changes'}
                  </PrimaryButton>
                </div>
              </div>
            </form>
          )}
        </AccountModal>
      )}

      {/* Security words modal */}
      {modal === 'security-words' && (
        <AccountModal
          title="Your Security Words"
          icon={<Key className="w-5 h-5 text-green-500" />}
          onClose={closeModal}
        >
          <div className="px-6 pb-4">
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-4">
                <strong className="text-red-400">Important:</strong> Save these words in a secure location.
                You'll need them to recover your account if you forget your password.
              </p>

              <div className="bg-custom-back-1 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-2" id="security-words-list">
                  {words.map((word, index) => (
                    <div
                      key={`${word}-${index}`}
                      className="flex items-center gap-2 bg-custom-back rounded px-2 py-1.5"
                    >
                      <span className="text-xs text-gray-500 w-4">{index + 1}.</span>
                      <span className="text-sm text-white font-mono break-all">{word}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={copyWords}
                className="w-full cursor-pointer inline-flex items-center justify-center gap-x-2 text-white bg-blue-600 hover:bg-blue-700 focus:ring-0 font-medium rounded-lg text-sm px-4 py-2.5 mb-3 transition-all duration-200 transform hover:scale-105"
              >
                <Copy className="w-4 h-4" />
                Copy All Words
              </button>
            </div>
          </div>

          <div className="bg-custom-back-1 px-6 py-4">
            <div className="flex space-x-3 justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                I've Saved These Words
              </button>
            </div>
          </div>
        </AccountModal>
      )}

      {/* Delete account logs modal */}
      {modal === 'delete-acc-logs' && (
        <AccountModal
          title="Delete All Account Logs"
          icon={<TriangleAlert className="w-5 h-5 text-red-500" />}
          onClose={closeModal}
        >
          <div className="px-6 pb-4">
            <p className="text-sm text-gray-400 mb-4">
              Are you sure you want to delete all your account logs? This action will permanently remove
              all login history and activity records.
            </p>
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 mb-4">
              <p className="text-red-300 text-xs mb-2">
                <strong>Warning:</strong> This action cannot be undone!
              </p>
              <ul className="text-red-300 text-xs space-y-1 ml-4">
                <li>• All login history will be permanently deleted</li>
                <li>• Activity records will be removed</li>
                <li>• This data cannot be recovered</li>
              </ul>
            </div>
          </div>

          <div className="bg-custom-back-1 px-6 py-4">
            <div className="flex space-x-3 justify-end">
              <CancelButton onClick={closeModal} />
              <PrimaryButton danger type="button" onClick={deleteAccountLogs}>
                <Trash className="w-4 h-4 inline mr-2" />
                Delete All Logs
              </PrimaryButton>
            </div>
          </div>
        </AccountModal>
      )}

      {/* Delete audit logs modal */}
      {modal === 'delete-audit-logs' && (
        <AccountModal
          title="Delete All Audit Logs"
          icon={<TriangleAlert className="w-5 h-5 text-red-500" />}
          onClose={closeModal}
        >
          <div className="px-6 pb-4">
            <p className="text-sm text-gray-400 mb-4">
              Are you sure you want to delete all audit logs? This action will permanently remove all
              activity records of your managers and resellers.
            </p>
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 mb-4">
              <p className="text-red-300 text-xs mb-2">
                <strong>Warning:</strong> This action cannot be undone!
              </p>
              <ul className="text-red-300 text-xs space-y-1 ml-4">
                <li>• All manager/reseller activity will be permanently deleted</li>
                <li>• Audit records will be removed</li>
                <li>• This data cannot be recovered</li>
              </ul>
            </div>
          </div>

          <div className="bg-custom-back-1 px-6 py-4">
            <div className="flex space-x-3 justify-end">
              <CancelButton onClick={closeModal} />
              <PrimaryButton danger type="button" onClick={deleteAuditLogs}>
                <Trash className="w-4 h-4 inline mr-2" />
                Delete All Logs
              </PrimaryButton>
            </div>
          </div>
        </AccountModal>
      )}

      {/* Upgrade plan modal */}
      {modal === 'upgrade' && (
        <AccountModal
          title="Upgrade Your Plan"
          titleClass="text-xl font-semibold text-white"
          maxWidth="max-w-2xl"
          closeIcon
          onClose={closeModal}
          icon={<Layers className="w-6 h-6 text-blue-500" />}
        >
          <div className="px-6 pb-6">
            <div className="mb-6">
              <div className="flex items-center justify-center">
                <div className="relative inline-flex rounded-lg p-1 bg-custom-back-1 border border-custom-1">
                  <button
                    type="button"
                    onClick={() => setPeriod('monthly')}
                    className={`relative z-10 px-4 py-2 rounded-md font-medium text-sm transition-all ${
                      period === 'monthly' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriod('yearly')}
                    className={`relative z-10 px-4 py-2 rounded-md font-medium text-sm transition-all ${
                      period === 'yearly' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Yearly <span className="text-xs text-green-400 ml-1">(Save 20%)</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative p-6 rounded-lg border ${
                    plan.popular ? 'border-blue-500 bg-blue-600/10' : 'border-custom-1 bg-custom-back-1'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center">
                    <h4 className="text-xl font-bold text-white mb-2">{plan.name}</h4>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-white">
                        {period === 'yearly' ? plan.yearly : plan.monthly}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {period === 'yearly' ? '/year' : '/month'}
                      </span>
                    </div>

                    <ul className="text-sm text-gray-300 mb-6 space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center">
                          <Check className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlan(plan.id);
                        setModal('payment');
                      }}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${plan.button}`}
                    >
                      Upgrade to {plan.name}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
              <div className="flex items-start space-x-3">
                <CircleAlert className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-blue-300 font-medium">Upgrade Information</h4>
                  <p className="text-blue-200 text-sm mt-1">
                    • Crypto payments may not be processed immediately and can take a few minutes.
                    <br />
                    • You can upgrade (forward) to a higher plan at any time.
                    <br />
                    • Plan downgrades require a refund request and staff assistance to revert your account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </AccountModal>
      )}

      {/* Payment method modal */}
      {modal === 'payment' && (
        <AccountModal
          title="Select Payment Method"
          titleClass="text-xl font-semibold text-white"
          closeIcon
          onClose={closeModal}
          icon={<CreditCard className="w-6 h-6 text-green-500" />}
        >
          <div className="px-6 pb-6">
            <p className="text-gray-400 text-sm mb-6">
              Choose your preferred payment method to complete the upgrade:
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setModal('cashapp')}
                className="w-full p-4 rounded-lg border border-custom-1 bg-custom-back-1 hover:bg-custom-back transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">CashApp</h4>
                    <p className="text-gray-400 text-sm">Quick mobile payment</p>
                  </div>
                </div>
              </button>

              <a href="https://paddle.keyauth.cc/" target="_blank" rel="noreferrer">
                <button
                  type="button"
                  className="w-full p-4 rounded-lg border border-custom-1 bg-custom-back-1 hover:bg-custom-back transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h8.418c2.508 0 4.514.893 5.835 2.596 1.206 1.557 1.47 3.129.723 4.316-.373.593-.905 1.107-1.539 1.48 2.378 1.15 3.566 3.547 2.898 6.14-.746 2.896-2.87 4.805-6.64 4.805H7.076zm2.146-7.234h2.866c1.367 0 2.47-.502 2.764-1.564.295-1.062-.367-1.564-1.734-1.564H10.222l-.998 3.128zm1.535-4.8h2.49c1.367 0 2.47-.502 2.764-1.564.295-1.062-.367-1.564-1.734-1.564H11.757l-.998 3.128z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">PayPal / Card</h4>
                      <p className="text-gray-400 text-sm">PayPal or credit/debit card</p>
                    </div>
                  </div>
                </button>
              </a>

              <button
                type="button"
                onClick={() => window.alert('Crypto payments are not configured for this app.')}
                className="w-full p-4 rounded-lg border border-custom-1 bg-custom-back-1 hover:bg-custom-back transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 14.75c-.368 1.477-1.404 2.285-3.047 2.378l-.625 2.51-1.515-.378.608-2.441c-.398-.099-.806-.192-1.213-.29l-.611 2.451-1.516-.378.625-2.507c-.329-.079-.651-.157-.964-.228l-.017.007-2.09-.522.403-1.563s1.115.255 1.096.241c.608.152.718-.331.718-.522l.725-2.906c.043.011.099.027.161.052l-.162-.04.515-2.067c.039-.294-.101-.676-.529-.827.011-.016-1.096-.274-1.096-.274l.217-1.453 2.212.551c.411.103.817.21 1.213.313l.621-2.489 1.514.378-.608 2.437c.406.116.799.232 1.184.355l.604-2.42 1.515.378-.621 2.488c2.551.483 4.465 1.448 4.693 3.474.184 1.633-.284 2.574-1.21 3.188.861.198 1.508.764 1.683 1.934z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Cryptocurrency</h4>
                    <p className="text-gray-400 text-sm">Bitcoin, Ethereum, etc.</p>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-4 p-3 bg-orange-900/20 border border-orange-700 rounded-lg">
              <div className="flex items-start space-x-2">
                <TriangleAlert className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <p className="text-orange-200 text-xs">
                  <strong>Note:</strong> Crypto payments may take a few minutes to process.
                </p>
              </div>
            </div>
          </div>
        </AccountModal>
      )}

      {/* CashApp modal */}
      {modal === 'cashapp' && (
        <AccountModal
          title="CashApp Payment"
          titleClass="text-xl font-semibold text-white"
          closeIcon
          onClose={closeModal}
          icon={
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
          }
        >
          <div className="px-6 pb-6">
            <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
              <div className="flex items-start space-x-3">
                <TriangleAlert className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-yellow-300 font-medium mb-1">Notice!</h4>
                  <p className="text-yellow-200 text-sm">
                    Paying with CashApp does not automatically upgrade you!{' '}
                    <strong>
                      It can take up to 1-2 days to upgrade your account if you decide to purchase via
                      CashApp
                    </strong>
                    .
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mb-6">
              <img
                src="/cashapp-qr.png"
                alt="CashApp QR code"
                className="mx-auto rounded-lg shadow-lg max-w-full h-auto"
              />
            </div>

            <div className="text-center mb-6">
              <h4 className="text-white font-medium mb-2">CashTag</h4>
              <div className="bg-custom-back-1 border border-custom-1 rounded-lg p-3">
                <span className="text-green-400 font-mono text-lg">$KeyAuthLLC</span>
              </div>
            </div>

            <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
              <h4 className="text-blue-300 font-medium mb-2">Amount to Send</h4>
              <div className="text-center">
                <span id="cashapp-amount" className="text-2xl font-bold text-white">
                  {cashappAmount}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-white font-medium mb-3">Instructions:</h4>
              <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
                <li>
                  Scan the QR code or send to <strong className="text-green-400">$KeyAuthLLC</strong>
                </li>
                <li>
                  <strong className="text-red-400">
                    Include your Owner ID ({account.ownerId || '—'}) in the note
                  </strong>
                </li>
                <li>Send the exact amount shown above</li>
                <li>Contact support with a screenshot of your payment for faster processing</li>
              </ol>
            </div>

            <button
              type="button"
              onClick={closeModal}
              className="w-full py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </AccountModal>
      )}
    </div>
  );
}
