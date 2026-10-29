import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { navItems, bottomItems } from '../../config/navigation';
import { ChevronDown, Crown, X, ExternalLink } from 'lucide-react';

function CrownBadge() {
  return (
    <span className="ml-auto text-yellow-400" title="Premium feature">
      <Crown className="w-4 h-4" />
    </span>
  );
}

export default function Sidebar({ open, onClose }) {
  const { apps, selectedApp, selectApp } = useAppContext();
  const [appMenu, setAppMenu] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const appMenuRef = useRef(null);

  useEffect(() => {
    if (!appMenu) return;
    const close = (event) => {
      if (appMenuRef.current && !appMenuRef.current.contains(event.target)) {
        setAppMenu(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [appMenu]);

  const closeMobile = () => onClose && onClose();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        id="sidebar"
        className={`bg-custom-back fixed top-0 left-0 z-50 w-64 h-screen flex flex-col overflow-y-auto sidebar-scroll duration-200 transition-transform -translate-x-full lg:translate-x-0 ${
          open ? 'translate-x-0' : ''
        }`}
        aria-label="Sidebar"
      >
        {/* Logo */}
        <div className="p-4 shrink-0 flex items-center justify-between">
          <NavLink to="/app/manage-apps" className="flex items-center justify-center flex-1">
            <span className="text-2xl font-bold tracking-tight text-white">COREXIS</span>
          </NavLink>
          <button
            onClick={closeMobile}
            className="lg:hidden p-2 rounded-lg hover:bg-custom-back-1 transition-colors duration-200 text-gray-400 hover:text-white"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto px-4 space-y-4">
          {/* App selector */}
          <div className="relative w-full" ref={appMenuRef}>
            <button
              type="button"
              onClick={() => setAppMenu((v) => !v)}
              className="relative overflow-hidden group w-full flex items-center justify-between text-left text-white p-2 rounded-xl transition border border-[#121212] bg-custom-back-1"
            >
              <span className="flex items-center gap-2 relative z-10 text-sm font-semibold uppercase">
                {selectedApp?.name || 'Select Application'}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform relative z-10 ${appMenu ? 'rotate-180' : ''}`}
              />
              <span className="absolute inset-0 bg-blue-700 scale-x-0 origin-left transition-transform duration-300 ease-out group-hover:scale-x-100 rounded-xl z-0" />
            </button>

            {appMenu && (
              <div className="absolute left-0 mt-2 w-full bg-custom-back-1 text-white rounded-xl border border-[#1a1a1a] shadow-lg z-20 overflow-hidden">
                {apps.length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-400">No applications</div>
                )}
                {apps.map((app) => {
                  const active = selectedApp?._id === app._id;
                  return (
                    <button
                      key={app._id}
                      type="button"
                      onClick={() => {
                        selectApp(app);
                        setAppMenu(false);
                        closeMobile();
                      }}
                      className={`cursor-pointer w-full text-left flex items-center justify-between px-4 py-2 text-sm transition ${
                        active ? 'bg-blue-600 text-white' : 'hover:bg-[#1a1a1a]'
                      }`}
                    >
                      <span className="truncate">{app.name}</span>
                      <span
                        className={`h-2 w-2 rounded-full ${
                          app.status === 'paused' ? 'bg-orange-400' : 'bg-green-400'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <hr className="border-[#121212] my-2" />

          {navItems.map(({ to, icon: Icon, label, premium }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeMobile}
              className="sidebar-link flex items-center gap-2 p-2 rounded-lg"
            >
              <span className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {label}
              </span>
              {premium && <CrownBadge />}
            </NavLink>
          ))}

        </div>

        {/* Bottom links */}
        <div className="p-4 border-t border-[#121212] shrink-0">
          {bottomItems.map(({ to, icon: Icon, label, resource }) =>
            resource ? (
              <button
                key={label}
                type="button"
                onClick={() => setResourcesOpen(true)}
                className="mb-2 cursor-pointer w-full relative overflow-hidden group flex items-center text-gray-300 p-2 rounded-lg transition sidebar-link"
              >
                <span className="flex items-center gap-2 relative z-10">
                  <Icon className="w-4 h-4" />
                  {label}
                </span>
              </button>
            ) : (
              <NavLink
                key={label}
                to={to}
                onClick={closeMobile}
                className="mb-2 relative overflow-hidden group w-full flex items-center text-gray-300 p-2 rounded-lg transition sidebar-link"
              >
                <span className="flex items-center gap-2 relative z-10">
                  <Icon className="w-4 h-4" />
                  {label}
                </span>
              </NavLink>
            )
          )}
        </div>
      </aside>

      {resourcesOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-custom-back-1 border border-[#1a1a1a] rounded-xl w-full max-w-md shadow-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
              <h3 className="text-white font-semibold">Resources</h3>
              <button
                type="button"
                onClick={() => setResourcesOpen(false)}
                className="text-gray-400 hover:text-white"
                aria-label="Close resources"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2">
              {[
                { label: 'Documentation', href: 'https://keyauth.readme.io' },
                { label: 'Examples', href: 'https://github.com/keyauth' },
                { label: 'Support Center', href: 'https://keyauth.tawk.help' },
                { label: 'API Reference', href: 'https://keyauth.readme.io/reference' },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between px-4 py-3 rounded-lg text-sm text-gray-300 hover:bg-[#1a1a1a] hover:text-white transition"
                >
                  {link.label}
                  <ExternalLink className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
