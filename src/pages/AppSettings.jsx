import { useCallback, useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import api from '../services/api';
import {
  Home, ChevronsRight, ChevronRight, FingerprintPattern, FolderDown,
  Blocks, ShieldAlert, Timer, Link as LinkIcon, MessageSquare, MessageSquareQuote,
  Store, DollarSign, UsersRound, ShieldHalf, Shield, Database, MessageSquareDot,
  Wrench, CodeXml, Save, X, Settings, RotateCcw
} from 'lucide-react';
import { InfoTip, ModalFooter, KA_UNITS } from '../components/ui/ka.jsx';

const FLOAT_INPUT =
  'block px-2.5 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-custom appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer';
const FLOAT_INPUT_SOLID =
  'block px-2.5 pb-2.5 pt-4 w-full text-sm text-white bg-custom-back rounded-lg border border-custom appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer';
const FLOAT_LABEL =
  'absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-custom-back-lbl px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1';
const SIMPLE_LABEL = 'text-gray-400 text-sm ml-1 mb-1 block';
const SIMPLE_INPUT =
  'block px-2.5 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-custom appearance-none focus:outline-none focus:ring-0 focus:border-blue-600';
const SELECT_BOX =
  'bg-custom-back border border-custom text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5';
const SELECT_LABEL =
  'absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-custom-back-lbl px-2 left-1';
const CARD = 'bg-custom-back rounded-lg p-4 shadow';
const CARD_HOVER =
  'transition-shadow duration-300 ease-in-out hover:shadow-[0_0_15px_3px_rgba(59,130,246,0.5)]';
const BTN_BLUE =
  'cursor-pointer text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center';
const BTN_RED =
  'cursor-pointer text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center';

const MESSAGE_DEFAULTS = {
  appdisabled: 'This application is disabled',
  tokeninvalid: 'Please provide a valid token for you to proceed',
  hashcheckfail: "This program hash does not match, make sure you're using latest version",
  vpnblocked: 'VPNs are blocked on this application',
  usernametaken: 'Username already taken, choose a different one',
  keynotfound: 'Invalid license key',
  keyused: 'License key has already been used',
  nosublevel: 'There is no subscription created for your key level. Contact application developer.',
  usernamenotfound: 'Invalid username',
  passmismatch: 'Password does not match.',
  hwidmismatch: "HWID doesn't match. Ask for a HWID reset",
  noactivesubs: 'No active subscription(s) found',
  hwidblacked: "You've been blacklisted from our application",
  pausedsub: "Your subscription is paused and can't be used right now",
  sessionunauthed: 'Session is not validated',
  loggedInMsg: 'Logged in!',
  pausedApp: 'Application is currently paused, please wait for the developer to say otherwise.',
  unTooShort: 'Username too short, try longer one.',
  pwLeaked: 'This password has been leaked in a data breach (not from us), please use a different one.',
  chatHitDelay: "Chat slower, you've hit the delay limit",
  userbanned: 'The user is banned',
  keybanned: 'Your license is banned'
};

const BAN_HINT =
  "Did you know, you can add '{reason}' to the response message to show the ban reason? Try it out. i.e: 'Your license is banned due to: {reason}'";

const MESSAGE_FIELDS = [
  { id: 'appdisabled', label: 'Application is Disabled' },
  { id: 'tokeninvalid', label: 'Token Validation Response' },
  { id: 'hashcheckfail', label: 'Mismatch Program Hash' },
  { id: 'vpnblocked', label: 'VPNs are blocked' },
  { id: 'usernametaken', label: 'Username already taken, choose a different one' },
  { id: 'keynotfound', label: 'Invalid License' },
  { id: 'keyused', label: 'License has already been used' },
  { id: 'nosublevel', label: 'There is no subscription created for your license level' },
  { id: 'usernamenotfound', label: 'Invalid Username' },
  { id: 'passmismatch', label: 'Password does not match' },
  {
    id: 'hwidmismatch',
    label: "HWID doesn't match. Ask for a HWID reset, or reset it yourself via the customer panel."
  },
  { id: 'noactivesubs', label: 'No active subscription(s) found for this user' },
  { id: 'hwidblacked', label: "You've been blacklisted from our application" },
  { id: 'pausedsub', label: "Your subscription is paused and can't be used right now." },
  { id: 'sessionunauthed', label: 'Session is not validated' },
  { id: 'loggedInMsg', label: 'Logged in!' },
  {
    id: 'pausedApp',
    label: 'Application is currently paused, please wait for the developer to say otherwise'
  },
  { id: 'unTooShort', label: 'Username too short, try longer one' },
  {
    id: 'pwLeaked',
    label: 'This password has been leaked in a data breach (not from us), please use a different one'
  },
  { id: 'chatHitDelay', label: "Chat slower, you've hit the delay limit" },
  { id: 'userbanned', label: 'The user is banned', hint: true },
  { id: 'keybanned', label: 'Your license is banned', hint: true }
];

const FUNCTION_GROUPS = [
  {
    title: 'Authentication',
    icon: ShieldHalf,
    items: [
      { id: 'loginToggle', bit: 1, title: 'Login', text: 'Login using a username and password' },
      { id: 'registerToggle', bit: 2, title: 'Register', text: 'New user account creation' },
      { id: 'licenseToggle', bit: 4, title: 'License', text: 'Login or register using a license only' },
      { id: 'upgradeToggle', bit: 262144, title: 'Upgrade', text: 'Assign a license to an account' }
    ]
  },
  {
    title: 'Data Management',
    icon: Database,
    items: [
      { id: 'getVarToggle', bit: 32, title: 'Retrieve User Variables', text: 'Access user-specific data' },
      { id: 'setVarToggle', bit: 64, title: 'Set User Variables', text: 'Store user-specific data' },
      {
        id: 'varToggle',
        bit: 131072,
        title: 'Retrieve Global Variable',
        text: 'Retrieve global data across all users and selected app'
      }
    ]
  },
  {
    title: 'Chat Functions',
    icon: MessageSquareDot,
    items: [
      { id: 'chatSendToggle', bit: 16, title: 'Send Messages', text: 'Send messages to users' },
      { id: 'chatGetToggle', bit: 8, title: 'Retrieve Messages', text: 'Retrieve messages from users' }
    ]
  },
  {
    title: 'Security & Moderation',
    icon: Shield,
    items: [
      { id: 'banToggle', bit: 128, title: 'Ban', text: 'Ban users on bannable events' },
      {
        id: 'checkBlackToggle',
        bit: 256,
        title: 'Check Blacklist',
        text: 'Check to see if a user is blacklisted from the application'
      },
      { id: 'sessionToggle', bit: 512, title: 'Session Check', text: 'Session validation' },
      {
        id: 'tfaToggle',
        bit: 524288,
        title: 'Two Factor Authentication (2FA)',
        text: 'Two-factor Authentication'
      }
    ]
  },
  {
    title: 'Utilities',
    icon: Wrench,
    items: [
      { id: 'changeUsernameToggle', bit: 1024, title: 'Change Username', text: 'Username modification' },
      { id: 'fileToggle', bit: 2048, title: 'File (download)', text: 'File download functionality' },
      {
        id: 'fetchOnlineToggle',
        bit: 4096,
        title: 'Fetch Online Users',
        text: 'Fetch the current number/names of online users'
      },
      {
        id: 'forgotPasswordToggle',
        bit: 8192,
        title: 'Forgot Password',
        text: 'Password reset functionality'
      },
      { id: 'fetchStatsToggle', bit: 16384, title: 'Fetch Stats', text: 'Retrieve application and user data' },
      { id: 'logToggle', bit: 32768, title: 'Event Logs (log)', text: 'Application event logging' },
      { id: 'webhookToggle', bit: 65536, title: 'Webhooks', text: 'Webhook functionality' }
    ]
  }
];

const FUNCTION_ALL = 1048575;

const pad = (n) => String(n).padStart(2, '0');

/* MD5 used by the "Add Hash" drag & drop zone (same as KeyAuth's client-side hash). */
const md5 = (bytes) => {
  const shifts = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
  ];
  const K = new Uint32Array(64);
  for (let i = 0; i < 64; i += 1) {
    K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296);
  }

  const length = bytes.length;
  const paddedLength = (((length + 8) >> 6) + 1) * 64;
  const buffer = new Uint8Array(paddedLength);
  buffer.set(bytes);
  buffer[length] = 0x80;

  const view = new DataView(buffer.buffer);
  view.setUint32(paddedLength - 8, (length << 3) >>> 0, true);
  view.setUint32(paddedLength - 4, Math.floor(length / 536870912), true);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;
  const words = new Uint32Array(16);

  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let i = 0; i < 16; i += 1) words[i] = view.getUint32(offset + i * 4, true);

    let A = a0;
    let B = b0;
    let C = c0;
    let D = d0;

    for (let i = 0; i < 64; i += 1) {
      let F;
      let g;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }
      F = (F + A + K[i] + words[g]) >>> 0;
      A = D;
      D = C;
      C = B;
      B = (B + ((F << shifts[i]) | (F >>> (32 - shifts[i])))) >>> 0;
    }

    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  const out = new Uint8Array(16);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, a0, true);
  outView.setUint32(4, b0, true);
  outView.setUint32(8, c0, true);
  outView.setUint32(12, d0, true);
  return Array.from(out).map((b) => pad(b.toString(16))).join('');
};

function Toggle({ id, checked, onChange }) {
  return (
    <label className="toggle-switch mr-5">
      <input id={id} name={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
  );
}

function FloatField({
  id, label, value, onChange, type = 'text', solid = false, readOnly = false,
  prefix, maxLength, max, inputMode, placeholder = ' '
}) {
  return (
    <div className="relative flex-1">
      {prefix && (
        <span className="absolute left-0 top-1/2 z-10 -translate-y-1/2 pl-3 text-gray-400 pointer-events-none select-none">
          {prefix}
        </span>
      )}
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        maxLength={maxLength}
        max={max}
        inputMode={inputMode}
        placeholder={placeholder}
        className={`${solid ? FLOAT_INPUT_SOLID : FLOAT_INPUT} ${prefix ? 'pl-20' : ''}`}
      />
      <label htmlFor={id} className={FLOAT_LABEL}>{label}</label>
    </div>
  );
}

function SettingsCard({ icon, title, children }) {
  return (
    <div className="bg-custom-back-1 rounded-xl p-6 text-white shadow-md w-full">
      <div className="flex items-center gap-2 mb-4">
        <span>{icon}</span>
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function SettingsModal({ title, subtitle, onClose, children, maxWidth = 'max-w-md' }) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex min-h-screen items-center justify-center p-4">
        <div className={`relative w-full ${maxWidth} transform overflow-hidden rounded-lg bg-custom-back shadow-xl`}>
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex items-center space-x-3">
              <div>
                <h3 className="text-lg font-medium text-white">{title}</h3>
                {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
              </div>
            </div>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
              <X className="h-6 w-6" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

const buildForm = (app) => {
  const timeout = app?.sessionTimeoutSec ?? 1800;
  let sessionUnit = 1;
  if (timeout % 604800 === 0) sessionUnit = 604800;
  else if (timeout % 86400 === 0) sessionUnit = 86400;
  else if (timeout % 3600 === 0) sessionUnit = 3600;
  else if (timeout % 60 === 0) sessionUnit = 60;

  return {
    status: (app?.status || 'enabled') === 'enabled',
    hwidLock: app?.hwidLock ?? true,
    forceHwid: app?.forceHwid ?? true,
    blockVpns: app?.blockVpns ?? false,
    hashCheck: app?.hashCheck ?? false,
    blockLeakedPasswords: app?.blockLeakedPasswords ?? true,
    tokenValidation: app?.tokenValidation ?? false,
    version: app?.version || '1.0',
    downloadUrl: app?.downloadUrl || '',
    webloaderUrl: app?.webloaderUrl || '',
    discordWebhook: app?.discordWebhook || '',
    logIp: app?.logIp ?? true,
    minHwidLength: app?.minHwidLength ?? 20,
    hwidCooldownUnit: app?.hwidCooldownUnit ?? 86400,
    hwidCooldownDuration: app?.hwidCooldownDuration ?? 7,
    minUsernameLength: app?.minUsernameLength ?? 1,
    sessionExpiryUnit: sessionUnit,
    sessionExpiryDuration: Math.max(1, Math.round(timeout / sessionUnit)),
    apiDomain: app?.apiCustomDomain || '',
    panelDomain: app?.panelCustomDomain || '',
    panelEnabled: app?.customerPanelEnabled ?? true,
    panelIcon: app?.customerPanelIcon || 'https://cdn.keyauth.cc/front/assets/img/favicon.png',
    messages: { ...MESSAGE_DEFAULTS, ...(app?.messages || {}) },
    functionValue: app?.functionValue ?? FUNCTION_ALL,
    resellerStoreLink: app?.resellerStoreLink || '',
    sellappWebhookSecret: app?.sellappWebhookSecret || '',
    sellappDayProduct: app?.sellappDayProduct || '',
    sellappWeekProduct: app?.sellappWeekProduct || '',
    sellappMonthProduct: app?.sellappMonthProduct || '',
    sellappLifetimeProduct: app?.sellappLifetimeProduct || '',
    shoppyWebhookSecret: app?.shoppyWebhookSecret || '',
    shoppyDayProduct: app?.shoppyDayProduct || '',
    shoppyWeekProduct: app?.shoppyWeekProduct || '',
    shoppyMonthProduct: app?.shoppyMonthProduct || '',
    shoppyLifetimeProduct: app?.shoppyLifetimeProduct || ''
  };
};

export default function AppSettings() {
  const { selectedApp, selectApp, fetchApps } = useAppContext();
  const [tab, setTab] = useState('appconfig');
  const [form, setForm] = useState(() => buildForm(selectedApp));
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);
  const [domainInput, setDomainInput] = useState('');
  const [hashInput, setHashInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setForm(buildForm(selectedApp));
  }, [selectedApp]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const setMessage = (key, value) =>
    setForm((prev) => ({ ...prev, messages: { ...prev.messages, [key]: value } }));

  const sellerUsername = (() => {
    try {
      return JSON.parse(localStorage.getItem('crxs_user'))?.username || 'admin';
    } catch {
      return 'admin';
    }
  })();

  const customerPanelLink =
    selectedApp?.customerPanelLink ||
    `https://corexis.app/panel/${sellerUsername}/${selectedApp?.name || 'app'}`;
  const resellerWebhookLink = `https://corexis.app/api/reseller/?app=${selectedApp?.secret || ''}`;

  const save = useCallback(async () => {
    if (!selectedApp || saving) return;
    setSaving(true);
    try {
      const res = await api.put(`/apps/${selectedApp._id}`, {
        status: form.status ? 'enabled' : 'paused',
        hwidLock: form.hwidLock,
        forceHwid: form.forceHwid,
        blockVpns: form.blockVpns,
        hashCheck: form.hashCheck,
        blockLeakedPasswords: form.blockLeakedPasswords,
        tokenValidation: form.tokenValidation,
        version: form.version,
        downloadUrl: form.downloadUrl,
        webloaderUrl: form.webloaderUrl,
        discordWebhook: form.discordWebhook,
        logIp: form.logIp,
        minHwidLength: Number(form.minHwidLength) || 0,
        hwidCooldownUnit: Number(form.hwidCooldownUnit) || 86400,
        hwidCooldownDuration: Number(form.hwidCooldownDuration) || 0,
        minUsernameLength: Number(form.minUsernameLength) || 1,
        sessionTimeoutSec: (Number(form.sessionExpiryDuration) || 1) * (Number(form.sessionExpiryUnit) || 1),
        messages: form.messages,
        functionValue: Number(form.functionValue) || 0,
        resellerStoreLink: form.resellerStoreLink,
        sellappWebhookSecret: form.sellappWebhookSecret,
        sellappDayProduct: form.sellappDayProduct,
        sellappWeekProduct: form.sellappWeekProduct,
        sellappMonthProduct: form.sellappMonthProduct,
        sellappLifetimeProduct: form.sellappLifetimeProduct,
        shoppyWebhookSecret: form.shoppyWebhookSecret,
        shoppyDayProduct: form.shoppyDayProduct,
        shoppyWeekProduct: form.shoppyWeekProduct,
        shoppyMonthProduct: form.shoppyMonthProduct,
        shoppyLifetimeProduct: form.shoppyLifetimeProduct,
        customerPanelEnabled: form.panelEnabled,
        customerPanelIcon: form.panelIcon,
        apiCustomDomain: form.apiDomain,
        panelCustomDomain: form.panelDomain
      });
      if (res.data.success) {
        selectApp(res.data.app);
        await fetchApps();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }, [form, selectedApp, saving, selectApp, fetchApps]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [save]);

  const closeModal = () => {
    setModal(null);
    setDomainInput('');
    setHashInput('');
    setDragActive(false);
  };

  const submitDomain = async (e) => {
    e.preventDefault();
    if (!selectedApp || busy) return;
    const isApi = modal === 'addApiDomain';
    const value = domainInput.trim();
    if (!value) return;
    setBusy(true);
    try {
      const res = await api.put(`/apps/${selectedApp._id}`, {
        [isApi ? 'apiCustomDomain' : 'panelCustomDomain']: value
      });
      if (res.data.success) {
        selectApp(res.data.app);
        set(isApi ? 'apiDomain' : 'panelDomain', value);
        closeModal();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add domain');
    } finally {
      setBusy(false);
    }
  };

  const removeDomain = async (e) => {
    e.preventDefault();
    if (!selectedApp || busy) return;
    const isApi = modal === 'removeApiDomain';
    setBusy(true);
    try {
      const res = await api.put(`/apps/${selectedApp._id}`, {
        [isApi ? 'apiCustomDomain' : 'panelCustomDomain']: ''
      });
      if (res.data.success) {
        selectApp(res.data.app);
        set(isApi ? 'apiDomain' : 'panelDomain', '');
        closeModal();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove domain');
    } finally {
      setBusy(false);
    }
  };

  const submitHash = async (e) => {
    e.preventDefault();
    if (!selectedApp || busy) return;
    const value = hashInput.trim();
    if (!value) return;
    setBusy(true);
    try {
      const res = await api.put(`/apps/${selectedApp._id}`, { appHash: value });
      if (res.data.success) {
        selectApp(res.data.app);
        closeModal();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add hash');
    } finally {
      setBusy(false);
    }
  };

  const resetHash = async (e) => {
    e.preventDefault();
    if (!selectedApp || busy) return;
    setBusy(true);
    try {
      const res = await api.put(`/apps/${selectedApp._id}`, { appHash: '' });
      if (res.data.success) {
        selectApp(res.data.app);
        closeModal();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reset hashes');
    } finally {
      setBusy(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      setHashInput(md5(new Uint8Array(buffer)));
    } catch {
      alert('Could not read that file.');
    }
  };

  const toggleFunction = (bit) =>
    setForm((prev) => ({ ...prev, functionValue: (prev.functionValue ^ bit) >>> 0 }));

  const toggleAllFunctions = () =>
    setForm((prev) => ({
      ...prev,
      functionValue: prev.functionValue === FUNCTION_ALL ? 0 : FUNCTION_ALL
    }));

  const activeTabBtn =
    'flex-1 min-w-0 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 hover:text-white hover:bg-white/5 text-white bg-white/10';
  const idleTabBtn =
    'flex-1 min-w-0 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 text-white/70 hover:text-white hover:bg-white/5';

  return (
    <div className="p-4 block sm:flex items-center justify-between lg:mt-1.5 rounded-xl">
      <div className="mb-1 w-full mt-2 md:mt-2 rounded-xl">
        {/* Header */}
        <div className="mb-4 p-8 bg-custom-back rounded-lg">
          <nav className="flex mb-5" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
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
            </ol>
          </nav>
          <h1 className="text-xl font-semibold text-white sm:text-2xl">Settings</h1>
          <p className="text-xs text-gray-500">
            Control your application here.{' '}
            <a
              href="https://keyauthdocs.apidog.io/dashboard/app/settings"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline"
            >
              Learn More
            </a>
            . Tip: You can press Ctrl + S to save settings!
          </p>
        </div>

        {/* Application / Seller segmented control */}
        <div className="mb-4 flex justify-center">
          <div className="relative inline-flex rounded-2xl p-1 border border-white/10 bg-custom-back/90 gap-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_2px_10px_rgba(0,0,0,0.25)]">
            <span
              className="absolute top-1 bottom-1 left-0 rounded-xl bg-gray-600/30 ring-1 ring-black/40 shadow-[0_1px_1px_rgba(0,0,0,0.35)] pointer-events-none"
              style={{
                width: '142px',
                transform: 'translateX(4px)',
                transition: 'transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1), width 260ms cubic-bezier(0.2, 0.8, 0.2, 1)'
              }}
            />
            <button
              className="relative z-10 px-7 py-2 rounded-xl font-semibold text-white transition-colors"
              type="button"
              aria-selected="true"
            >
              Application
            </button>
            <button
              className="relative z-10 px-7 py-2 rounded-xl font-semibold text-white/70 hover:text-white transition-colors flex items-center gap-2"
              type="button"
              aria-selected="false"
            >
              <span>Seller</span>
            </button>
          </div>
        </div>

        {/* Main card */}
        <div className="p-4 flex flex-col bg-custom-back rounded-lg">
          <div className="overflow-x-auto">
            <div id="app-content">
              {/* Tabs */}
              <div className="mb-6">
                <div className="block sm:hidden mb-4">
                  <select
                    id="mobile-tab-select"
                    value={tab}
                    onChange={(e) => setTab(e.target.value)}
                    className="w-full bg-custom-back-1 border border-white/10 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="appconfig">Application Configuration</option>
                    <option value="messages">Custom Alert Messages</option>
                    <option value="reseller">Reseller Settings ⭐</option>
                    <option value="customerpanel">Customer Panel Settings ⭐</option>
                    <option value="appfunctions">Function Management</option>
                  </select>
                </div>

                <div className="hidden sm:block">
                  <div className="flex flex-wrap gap-2 p-1 bg-custom-back/50 rounded-xl border border-white/10">
                    <button
                      className={tab === 'appconfig' ? activeTabBtn : idleTabBtn}
                      id="tab-appconfig"
                      type="button"
                      aria-selected={tab === 'appconfig'}
                      role="tab"
                      onClick={() => setTab('appconfig')}
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.55 21H3v-8.55h8.55V21ZM21 21h-8.55v-8.55H21V21Zm-9.45-9.45H3V3h8.55v8.55Zm9.45 0h-8.55V3H21v8.55Z" />
                      </svg>
                      <span className="truncate">App Config</span>
                    </button>

                    <button
                      className={tab === 'messages' ? activeTabBtn : idleTabBtn}
                      id="tab-messages"
                      type="button"
                      aria-selected={tab === 'messages'}
                      role="tab"
                      onClick={() => setTab('messages')}
                    >
                      <MessageSquare className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Messages</span>
                    </button>

                    <button
                      className={tab === 'reseller' ? activeTabBtn : idleTabBtn}
                      id="tab-reseller"
                      type="button"
                      aria-selected={tab === 'reseller'}
                      role="tab"
                      onClick={() => setTab('reseller')}
                    >
                      <MessageSquare className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Reseller</span>
                    </button>

                    <button
                      className={tab === 'customerpanel' ? activeTabBtn : idleTabBtn}
                      id="tab-customerpanel"
                      type="button"
                      aria-selected={tab === 'customerpanel'}
                      role="tab"
                      onClick={() => setTab('customerpanel')}
                    >
                      <UsersRound className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Customer Panel</span>
                    </button>

                    <button
                      className={tab === 'appfunctions' ? activeTabBtn : idleTabBtn}
                      id="tab-appfunctions"
                      type="button"
                      aria-selected={tab === 'appfunctions'}
                      role="tab"
                      onClick={() => setTab('appfunctions')}
                    >
                      <CodeXml className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Functions</span>
                    </button>
                  </div>
                </div>
              </div>

              <form
                method="post"
                onSubmit={(e) => {
                  e.preventDefault();
                  save();
                }}
              >
                <div id="myTabContent">
                  {/* App Config */}
                  <div
                    className={`p-4 rounded-lg grid gap-7 ${tab === 'appconfig' ? '' : 'hidden'}`}
                    id="appconfig-content"
                    role="tabpanel"
                    aria-hidden={tab !== 'appconfig'}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-6">
                        <SettingsCard
                          icon={<ChevronRight />}
                          title="Access Controls"
                        >
                          <div className="space-y-4">
                            {[
                              {
                                id: 'statusinput',
                                key: 'status',
                                title: 'App Status',
                                text: 'Enable or disable the application, preventing users from logging in'
                              },
                              {
                                id: 'hwidinput',
                                key: 'hwidLock',
                                title: 'HWID Lock',
                                text: "Lock users to a value from your user's device which only changes if they reinstall their operating system. Use this to prevent people from sharing your product."
                              },
                              {
                                id: 'forceHwid',
                                key: 'forceHwid',
                                title: 'Force HWID',
                                text: 'Prevent users from logging in with a black HWID (disable this for web based products, i.e. PHP)'
                              },
                              {
                                id: 'vpninput',
                                key: 'blockVpns',
                                title: 'Block VPNs',
                                text: 'Prevent users from logging in from a Virtual Private Network (VPN)'
                              },
                              {
                                id: 'hashinput',
                                key: 'hashCheck',
                                title: 'Hash Check',
                                text: 'Checks whether the application has been modified since the last time you pressed the reset hash button. Used to prevent people from altering/bypassing your application.'
                              },
                              {
                                id: 'blockLeakedPasswords',
                                key: 'blockLeakedPasswords',
                                title: 'Block Leaked Passwords',
                                text: 'Prevent users from registering using a leaked password.'
                              },
                              {
                                id: 'tokeninput',
                                key: 'tokenValidation',
                                title: 'Token Validation',
                                text: 'Prevents users from accessing your program without a valid token. Note: This is not the same as a license. Licenses allow users to login/register, while tokens allow users to access the application entirely.'
                              }
                            ].map((row) => (
                              <div key={row.id} className={`${CARD} flex items-center space-x-4 ${CARD_HOVER}`}>
                                <div className="flex-shrink-0 flex items-center h-full">
                                  <Toggle
                                    id={row.id}
                                    checked={!!form[row.key]}
                                    onChange={(v) => set(row.key, v)}
                                  />
                                </div>
                                <div>
                                  <h3 className="font-bold">{row.title}</h3>
                                  <p>{row.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </SettingsCard>

                        <SettingsCard icon={<FingerprintPattern className="w-5 h-5" />} title="Hash Management">
                          <div className="space-y-4">
                            <div className={`${CARD} ${CARD_HOVER}`}>
                              <button type="button" onClick={() => setModal('addHash')} className={`${BTN_BLUE} w-full`}>
                                Add Hash
                              </button>
                            </div>
                            <div className={`${CARD} ${CARD_HOVER}`}>
                              <h2 className="text-xl font-semibold mb-4">Delete Existing Hashes</h2>
                              <button type="button" onClick={() => setModal('resetHash')} className={`${BTN_RED} w-full`}>
                                <RotateCcw size={14} className="mr-2 inline" />Reset All Hashes
                              </button>
                              <hr className="border-custom mt-5 mb-5" />
                            </div>
                          </div>
                        </SettingsCard>
                      </div>

                      <div className="flex flex-col gap-6">
                        <SettingsCard icon={<FolderDown className="w-5 h-5" />} title="Download & Update">
                          <div className="space-y-4">
                            <div className={`${CARD} flex items-center ${CARD_HOVER}`}>
                              <FloatField
                                id="version"
                                label="Application Version"
                                value={form.version}
                                onChange={(e) => set('version', e.target.value)}
                                solid
                                maxLength={12}
                              />
                            </div>
                            <div className={`${CARD} flex items-center ${CARD_HOVER}`}>
                              <FloatField
                                id="download"
                                label="Auto-Update Download Link"
                                value={form.downloadUrl}
                                onChange={(e) => set('downloadUrl', e.target.value)}
                                type="url"
                                maxLength={125}
                              />
                            </div>
                            <div className={`${CARD} flex items-center ${CARD_HOVER}`}>
                              <FloatField
                                id="webdownload"
                                label="Webloader Download Link"
                                value={form.webloaderUrl}
                                onChange={(e) => set('webloaderUrl', e.target.value)}
                                type="url"
                              />
                            </div>
                          </div>
                        </SettingsCard>

                        <SettingsCard icon={<Blocks className="w-5 h-5" />} title="Logging & Integration">
                          <div className="space-y-4">
                            <div className={`${CARD} flex items-center gap-6 ${CARD_HOVER}`}>
                              <div className="flex items-center gap-2 flex-1">
                                <FloatField
                                  id="webhook"
                                  label="Discord Webhook Link"
                                  value={form.discordWebhook}
                                  onChange={(e) => set('discordWebhook', e.target.value)}
                                />
                                <InfoTip text="Instead of logs being sent to the dashboard, they will be sent to your Discord server." />
                              </div>
                              <div className="relative flex items-center ml-4">
                                <Toggle
                                  id="ipLogging"
                                  checked={form.logIp}
                                  onChange={(v) => set('logIp', v)}
                                />
                                <span className="text-sm text-white font-medium">Log IP</span>
                              </div>
                            </div>
                          </div>
                        </SettingsCard>

                        <SettingsCard icon={<ShieldAlert className="w-5 h-5" />} title="Security & User Restriction">
                          <div className="space-y-4">
                            <div className={`${CARD} flex items-center gap-6 ${CARD_HOVER}`}>
                              <FloatField
                                id="minHwid"
                                label="Minimum HWID Length"
                                value={form.minHwidLength}
                                onChange={(e) => set('minHwidLength', e.target.value)}
                                type="number"
                                inputMode="numeric"
                                max={999}
                                solid
                              />
                            </div>

                            <div className={`${CARD} ${CARD_HOVER}`}>
                              <div className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="relative flex-1 min-w-0">
                                  <select
                                    id="cooldownexpiry"
                                    name="cooldownexpiry"
                                    value={form.hwidCooldownUnit}
                                    onChange={(e) => set('hwidCooldownUnit', Number(e.target.value))}
                                    className={SELECT_BOX}
                                  >
                                    {KA_UNITS.map((unit) => (
                                      <option key={unit.value} value={unit.value}>{unit.label}</option>
                                    ))}
                                  </select>
                                  <label htmlFor="cooldownexpiry" className={SELECT_LABEL}>
                                    HWID Reset Cooldown Unit
                                  </label>
                                </div>
                                <div className="relative flex-1 min-w-0">
                                  <input
                                    type="number"
                                    inputMode="numeric"
                                    name="cooldownduration"
                                    id="cooldownduration"
                                    max="999"
                                    value={form.hwidCooldownDuration}
                                    onChange={(e) => set('hwidCooldownDuration', e.target.value)}
                                    placeholder=" "
                                    className="block w-full h-12 px-2.5 pb-2.5 pt-4 text-sm text-white bg-transparent rounded-lg border border-custom appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                  />
                                  <label htmlFor="cooldownduration" className={FLOAT_LABEL}>
                                    Cooldown Duration
                                  </label>
                                </div>
                              </div>
                            </div>

                            <div className={`${CARD} flex items-center gap-6 ${CARD_HOVER}`}>
                              <FloatField
                                id="minUsernameLength"
                                label="Minimum username length"
                                value={form.minUsernameLength}
                                onChange={(e) => set('minUsernameLength', e.target.value)}
                                type="number"
                                inputMode="numeric"
                              />
                            </div>
                          </div>
                        </SettingsCard>

                        <SettingsCard icon={<Timer className="w-5 h-5" />} title="Session Management">
                          <div className="space-y-4">
                            <div className={`${CARD} ${CARD_HOVER}`}>
                              <div className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="relative flex-1 min-w-0">
                                  <select
                                    id="sessionexpiry"
                                    name="sessionexpiry"
                                    value={form.sessionExpiryUnit}
                                    onChange={(e) => set('sessionExpiryUnit', Number(e.target.value))}
                                    className={SELECT_BOX}
                                  >
                                    {KA_UNITS.slice(0, 5).map((unit) => (
                                      <option key={unit.value} value={unit.value}>{unit.label}</option>
                                    ))}
                                  </select>
                                  <label htmlFor="sessionexpiry" className={SELECT_LABEL}>
                                    Session Expiry Unit
                                  </label>
                                </div>
                                <div className="relative flex-1 min-w-0">
                                  <input
                                    type="number"
                                    inputMode="numeric"
                                    name="sessionduration"
                                    id="sessionduration"
                                    value={form.sessionExpiryDuration}
                                    onChange={(e) => set('sessionExpiryDuration', e.target.value)}
                                    placeholder=" "
                                    className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-custom appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                  />
                                  <label htmlFor="sessionduration" className={FLOAT_LABEL}>
                                    Session Expiry Duration
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </SettingsCard>

                        <SettingsCard icon={<LinkIcon className="w-5 h-5" />} title="Custom Domain - API">
                          <div className="space-y-4">
                            <div className={`${CARD} ${CARD_HOVER}`}>
                              <FloatField
                                id="domainDisplay"
                                label="Current Custom Domain"
                                prefix="https://"
                                value={
                                  form.apiDomain ||
                                  "You do not have a custom domain set up. Click on 'Add Domain' to get started"
                                }
                                readOnly
                                onChange={() => {}}
                              />
                              <div className="w-full mt-2">
                                <div className="flex gap-4 w-full mb-2">
                                  <button
                                    disabled={!form.apiDomain}
                                    type="button"
                                    onClick={() => setModal('removeApiDomain')}
                                    className={`${BTN_RED} w-1/2 disabled:cursor-not-allowed disabled:opacity-60`}
                                  >
                                    Remove Domain
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDomainInput('');
                                      setModal('addApiDomain');
                                    }}
                                    className={`${BTN_BLUE} w-1/2`}
                                  >
                                    Add Domain
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </SettingsCard>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div
                    className={`p-4 rounded-lg grid gap-4 mt-4 ${tab === 'messages' ? '' : 'hidden'}`}
                    id="messages-content"
                    role="tabpanel"
                    aria-hidden={tab !== 'messages'}
                  >
                    <div className="bg-custom-back-1 rounded-xl p-6 text-white shadow-md min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-4">
                        <span><MessageSquareQuote className="w-5 h-5" /></span>
                        <h2 className="text-2xl font-semibold">Alert Messages</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {MESSAGE_FIELDS.map((field) => (
                          <div key={field.id} className={`${CARD} flex items-center ${CARD_HOVER}`}>
                            <div className="relative flex-1">
                              <label className={SIMPLE_LABEL} htmlFor={field.id}>{field.label}</label>
                              <input
                                type="text"
                                maxLength={100}
                                name={field.id}
                                id={field.id}
                                value={form.messages[field.id]}
                                onChange={(e) => setMessage(field.id, e.target.value)}
                                className={SIMPLE_INPUT}
                                autoComplete="on"
                              />
                              {field.hint && (
                                <span className="text-yellow-500 text-xs">{BAN_HINT}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Reseller */}
                  <div
                    className={`p-4 rounded-lg grid gap-4 -mt-8 ${tab === 'reseller' ? '' : 'hidden'}`}
                    id="reseller-content"
                    role="tabpanel"
                    aria-hidden={tab !== 'reseller'}
                  >
                    <div className="mt-4 flex items-start p-4 mb-4 text-yellow-500 bg-transparent border border-yellow-700 rounded-lg" role="alert">
                      <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zM9 9V5a1 1 0 012 0v4a1 1 0 11-2 0zm1 4a1.25 1.25 0 100-2.5A1.25 1.25 0 0010 13z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <h3 className="text-sm font-medium"><b>Notice!</b></h3>
                        <div className="text-xs text-yellow-500">
                          View our{' '}
                          <b>
                            <u>
                              <a href="https://www.youtube.com/watch?v=wAtTwBxPdmU" target="_blank" rel="noreferrer">
                                YouTube video here
                              </a>
                            </u>
                          </b>{' '}
                          to use reseller system.
                          <b>Note:</b> This page is for the reseller system. This allows you to sell license
                          balances to your resellers so that you do not have to manually stock licenses for your
                          team. If you're wanting to setup auto delivery for your actual clients, please purchase
                          the seller subscription, then head over to the settings page -&gt; seller settings.
                        </div>
                      </div>
                    </div>

                    <h1 className="text-xl font-semibold text-white sm:text-2xl" />

                    <div className="bg-custom-back-1 rounded-xl p-6 text-white shadow-md min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-4">
                        <span><Store className="w-5 h-5" /></span>
                        <h2 className="text-2xl font-semibold">Reseller Store Configuration</h2>
                      </div>
                      <div className="space-y-4">
                        <div className={`${CARD} flex items-center ${CARD_HOVER}`}>
                          <div className="relative w-full flex items-center">
                            <FloatField
                              id="resellerstore"
                              label="Reseller Store Link"
                              value={form.resellerStoreLink}
                              onChange={(e) => set('resellerStoreLink', e.target.value)}
                            />
                            <InfoTip text="If you're not using the built-in reseller system, set a link to show to your resellers for them to purchase more balance (licenses)." />
                          </div>
                        </div>

                        <div className={`${CARD} flex items-center ${CARD_HOVER}`}>
                          <div className="relative w-full flex items-center">
                            <div className="relative flex-1">
                              <input
                                type="url"
                                id="resellerstoreWebhookLink"
                                name="resellerstoreWebhookLink"
                                value={resellerWebhookLink}
                                readOnly
                                disabled
                                placeholder=" "
                                className="transition duration-500 block px-2.5 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-custom appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer blur-sm hover:blur-none"
                              />
                              <label htmlFor="resellerstoreWebhookLink" className={FLOAT_LABEL}>
                                Reseller Webhook Link
                              </label>
                            </div>
                            <InfoTip text="This is the same if you're using Shoppy for example, create a webhook with this link for the event 'order:paid'" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 w-full">
                      <div className="bg-custom-back-1 rounded-xl p-6 text-white shadow-md min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-4">
                          <span><DollarSign className="w-5 h-5" /></span>
                          <h2 className="text-xl font-semibold">Sellapp</h2>
                        </div>
                        <div className="space-y-4">
                          {[
                            { id: 'sellappwebhooksecret', key: 'sellappWebhookSecret', label: 'Sellapp Webhook Secret', blur: true, maxLength: 64 },
                            { id: 'sellappdayproduct', key: 'sellappDayProduct', label: 'Sellapp Day Product ID' },
                            { id: 'sellappweekproduct', key: 'sellappWeekProduct', label: 'Sellapp Week Product ID' },
                            { id: 'sellappmonthproduct', key: 'sellappMonthProduct', label: 'Sellapp Month Product ID' },
                            { id: 'sellapplifetimeproduct', key: 'sellappLifetimeProduct', label: 'Sellapp Lifetime Product ID' }
                          ].map((field) => (
                            <div key={field.id} className="relative">
                              <input
                                type="text"
                                id={field.id}
                                name={field.id}
                                value={form[field.key]}
                                onChange={(e) => set(field.key, e.target.value)}
                                maxLength={field.maxLength}
                                placeholder=" "
                                className={`transition duration-500 block px-2.5 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-custom appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer ${field.blur ? 'blur-sm hover:blur-none' : ''}`}
                              />
                              <label htmlFor={field.id} className={FLOAT_LABEL}>{field.label}</label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-custom-back-1 rounded-xl p-6 text-white shadow-md min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-4">
                          <span><DollarSign className="w-5 h-5" /></span>
                          <h2 className="text-xl font-semibold">Shoppy</h2>
                        </div>
                        <div className="space-y-4">
                          {[
                            { id: 'shoppywebhooksecret', key: 'shoppyWebhookSecret', label: 'Shoppy Webhook Secret', blur: true, maxLength: 64 },
                            { id: 'shoppydayproduct', key: 'shoppyDayProduct', label: 'Shoppy Day Product ID' },
                            { id: 'shoppyweekproduct', key: 'shoppyWeekProduct', label: 'Shoppy Week Product ID' },
                            { id: 'shoppymonthproduct', key: 'shoppyMonthProduct', label: 'Shoppy Month Product ID' },
                            { id: 'shoppylifetimeproduct', key: 'shoppyLifetimeProduct', label: 'Shoppy Lifetime Product ID' }
                          ].map((field) => (
                            <div key={field.id} className="relative">
                              <input
                                type="text"
                                id={field.id}
                                name={field.id}
                                value={form[field.key]}
                                onChange={(e) => set(field.key, e.target.value)}
                                maxLength={field.maxLength}
                                placeholder=" "
                                className={`transition duration-500 block px-2.5 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-custom appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer ${field.blur ? 'blur-sm hover:blur-none' : ''}`}
                              />
                              <label htmlFor={field.id} className={FLOAT_LABEL}>{field.label}</label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-custom-back-1 rounded-xl p-6 text-white shadow-md min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-4">
                          <span><DollarSign className="w-5 h-5" /></span>
                          <h2 className="text-xl font-semibold">Payment Provider</h2>
                        </div>
                        <div className="space-y-4">
                          <div className="text-center py-8">
                            <div className="text-gray-400 mb-2">
                              <Settings className="w-12 h-12 mx-auto mb-4" />
                            </div>
                            <p className="text-gray-400 text-sm">
                              Have another payment provider in mind? Submit a suggestion to let us know.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Panel */}
                  <div
                    className={`p-4 rounded-lg grid gap-4 -mt-8 ${tab === 'customerpanel' ? '' : 'hidden'}`}
                    id="customerpanel-content"
                    role="tabpanel"
                    aria-hidden={tab !== 'customerpanel'}
                  >
                    <div className="flex flex-col md:flex-row gap-4 w-full mt-8">
                      <div className="bg-custom-back-1 rounded-xl p-6 text-white shadow-md w-full">
                        <div className="flex items-center gap-2 mb-4">
                          <span><LinkIcon className="w-5 h-5" /></span>
                          <h2 className="text-2xl font-semibold">Custom Domain - Customer Panel</h2>
                        </div>
                        <div className="space-y-4">
                          <div className={`${CARD} ${CARD_HOVER}`}>
                            <FloatField
                              id="domainDisplayPanel"
                              label="Current Custom Domain"
                              prefix="https://"
                              value={
                                form.panelDomain ||
                                "You do not have a custom domain set up. Click on 'Add Domain' to get started"
                              }
                              readOnly
                              onChange={() => {}}
                            />
                            <div className="w-full mt-2">
                              <div className="flex gap-4 w-full mb-2">
                                <button
                                  disabled={!form.panelDomain}
                                  type="button"
                                  onClick={() => setModal('removePanelDomain')}
                                  className={`${BTN_RED} w-1/2 disabled:cursor-not-allowed disabled:opacity-60`}
                                >
                                  Remove Domain
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDomainInput('');
                                    setModal('addPanelDomain');
                                  }}
                                  className={`${BTN_BLUE} w-1/2`}
                                >
                                  Add Domain
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-custom-back-1 rounded-xl p-6 text-white shadow-md w-full">
                        <div className="flex items-center gap-2 mb-4">
                          <span><LinkIcon className="w-5 h-5" /></span>
                          <h2 className="text-2xl font-semibold">Configuration</h2>
                        </div>
                        <div className="space-y-4">
                          <div className={`${CARD} flex items-center ${CARD_HOVER}`}>
                            <Toggle
                              id="panelstatus"
                              checked={form.panelEnabled}
                              onChange={(v) => set('panelEnabled', v)}
                            />
                            <div>
                              <h3 className="font-bold">Enable Customer Panel</h3>
                            </div>
                          </div>

                          <div className={`${CARD} ${CARD_HOVER}`}>
                            <div className="flex items-start relative gap-2">
                              <div className="relative w-full">
                                <input
                                  type="text"
                                  id="customerPanelLink"
                                  value={customerPanelLink}
                                  readOnly
                                  placeholder=" "
                                  className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-custom appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                />
                                <label htmlFor="customerPanelLink" className={FLOAT_LABEL}>
                                  Customer Panel Link
                                </label>
                              </div>
                              <InfoTip text="This is the link your users will use to access their customer panel. Used to reset passwords, change usernames, reset HWID and more." />
                            </div>

                            <div className="flex items-start gap-2 mt-5">
                              <div className="relative w-full">
                                <input
                                  type="url"
                                  id="customerPanelIcon"
                                  name="customerPanelIcon"
                                  value={form.panelIcon}
                                  onChange={(e) => set('panelIcon', e.target.value)}
                                  placeholder=" "
                                  className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-custom appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                />
                                <label htmlFor="customerPanelIcon" className={FLOAT_LABEL}>
                                  Customer Panel Icon
                                </label>
                              </div>
                              <InfoTip text="Image shown on SEO and next to the title in the browser tab." />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Functions */}
                  <div
                    className={`p-4 rounded-lg -mt-8 ${tab === 'appfunctions' ? '' : 'hidden'}`}
                    id="appfunctions-content"
                    role="tabpanel"
                    aria-hidden={tab !== 'appfunctions'}
                  >
                    <div className="mb-4">
                      <div className="mt-4 flex items-start p-4 mb-4 text-yellow-500 bg-transparent border border-yellow-700 rounded-lg" role="alert">
                        <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zM9 9V5a1 1 0 012 0v4a1 1 0 11-2 0zm1 4a1.25 1.25 0 100-2.5A1.25 1.25 0 0010 13z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div>
                          <h3 className="text-sm font-medium"><b>Info:</b></h3>
                          <span className="text-xs text-yellow-500">
                            Permissions Code For Seller API Request: {form.functionValue}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Toggle
                          id="allToggle"
                          checked={Number(form.functionValue) === FUNCTION_ALL}
                          onChange={toggleAllFunctions}
                        />
                        <span className="text-white">Toggle All Functions</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {FUNCTION_GROUPS.map((group) => {
                        const GroupIcon = group.icon;
                        return (
                          <div key={group.title} className="bg-custom-back-1 rounded-xl p-6 text-white shadow-md w-full">
                            <div className="flex items-center gap-2 mb-4">
                              <span><GroupIcon className="w-5 h-5" /></span>
                              <h2 className="text-2xl font-semibold">{group.title}</h2>
                            </div>
                            <div className="space-y-4">
                              {group.items.map((item) => (
                                <div key={item.id} className={`${CARD} flex items-center ${CARD_HOVER}`}>
                                  <Toggle
                                    id={item.id}
                                    checked={(Number(form.functionValue) & item.bit) !== 0}
                                    onChange={() => toggleFunction(item.bit)}
                                  />
                                  <div>
                                    <h3 className="font-bold">{item.title}</h3>
                                    <p>{item.text}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="cursor-pointer inline-flex text-white bg-blue-700 hover:opacity-60 focus:ring-0 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 transition duration-200 disabled:opacity-60"
                    id="updatesettings"
                  >
                    <Save size={16} className="mr-2" />{saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Add API Custom Domain */}
      {modal === 'addApiDomain' && (
        <SettingsModal title="Add API Custom Domain" onClose={closeModal}>
          <form method="POST" className="flex flex-col" onSubmit={submitDomain}>
            <div className="px-6 pb-6">
              <input
                type="text"
                id="domain"
                name="domain"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                className="w-full rounded-lg border border-custom bg-custom-back-1 px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="api.example.com"
                autoComplete="on"
                required
              />
            </div>
            <ModalFooter onCancel={closeModal} submitLabel="Add Domain" disabled={busy} />
          </form>
        </SettingsModal>
      )}

      {/* Remove API Custom Domain */}
      {modal === 'removeApiDomain' && (
        <SettingsModal
          title="Remove Custom Domain"
          subtitle="This action cannot be undone"
          onClose={closeModal}
        >
          <form method="POST" className="flex flex-col" onSubmit={removeDomain}>
            <div className="px-6 pb-6">
              <p className="text-sm text-gray-300 mb-4">
                Are you sure you want to remove this custom domain? You will need to set it up again
                if you want to use it in the future.
              </p>
              <div className="bg-custom-back-1 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1"><b>Domain:</b></p>
                <p className="text-sm text-white break-all">{form.apiDomain || 'N/A'}</p>
              </div>
            </div>
            <ModalFooter onCancel={closeModal} submitLabel="Remove Domain" danger disabled={busy} />
          </form>
        </SettingsModal>
      )}

      {/* Add Customer Panel Custom Domain */}
      {modal === 'addPanelDomain' && (
        <SettingsModal title="Add Customer Panel Custom Domain" onClose={closeModal}>
          <form method="POST" className="flex flex-col" onSubmit={submitDomain}>
            <div className="px-6 pb-6">
              <input
                type="text"
                id="domain"
                name="domain"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                className="w-full rounded-lg border border-custom bg-custom-back-1 px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="panel.example.com"
                autoComplete="on"
                required
              />
            </div>
            <ModalFooter onCancel={closeModal} submitLabel="Add Domain" disabled={busy} />
          </form>
        </SettingsModal>
      )}

      {/* Remove Customer Panel Custom Domain */}
      {modal === 'removePanelDomain' && (
        <SettingsModal
          title="Remove Custom Domain"
          subtitle="This action cannot be undone"
          onClose={closeModal}
        >
          <form method="POST" className="flex flex-col" onSubmit={removeDomain}>
            <div className="px-6 pb-6">
              <p className="text-sm text-gray-300 mb-4">
                Are you sure you want to remove this custom domain? You will need to set it up again
                if you want to use it in the future.
              </p>
              <div className="bg-custom-back-1 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1"><b>Domain:</b></p>
                <p className="text-sm text-white break-all">{form.panelDomain || 'N/A'}</p>
              </div>
            </div>
            <ModalFooter onCancel={closeModal} submitLabel="Remove Domain" danger disabled={busy} />
          </form>
        </SettingsModal>
      )}

      {/* Add Hash */}
      {modal === 'addHash' && (
        <SettingsModal title="Add Hash" onClose={closeModal} maxWidth="max-w-lg">
          <form method="POST" onSubmit={submitHash}>
            <div className="px-6 pb-6">
              <div>
                <input
                  type="text"
                  name="hash"
                  id="hash"
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  required
                  className="w-full rounded-lg border border-custom bg-custom-back-1 px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter program hash or drag & drop a file"
                />
              </div>

              <div
                id="hash-drop-zone"
                className={`mt-4 border-2 border-dashed border-gray-400 rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-blue-500 hover:bg-blue-500/10 ${dragActive ? 'drag-active' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
              >
                <p className="text-gray-300">Drag &amp; drop your program file here</p>
                <p className="text-xs text-gray-500 mt-1">The MD5 hash will be automatically calculated</p>
              </div>
            </div>
            <ModalFooter onCancel={closeModal} submitLabel="Add Hash" disabled={busy} />
          </form>
        </SettingsModal>
      )}

      {/* Reset All Hashes */}
      {modal === 'resetHash' && (
        <SettingsModal title="Reset All Hashes" onClose={closeModal} maxWidth="max-w-lg">
          <form method="POST" onSubmit={resetHash}>
            <div className="px-6 pb-6">
              <p className="text-gray-300 mb-4">
                Are you sure you want to reset all program hashes? This will delete all existing
                hashes and cannot be undone.
              </p>
            </div>
            <ModalFooter onCancel={closeModal} submitLabel="Reset All Hashes" danger disabled={busy} />
          </form>
        </SettingsModal>
      )}
    </div>
  );
}
