import { useEffect, useRef, useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ChevronDown, KeyRound, UserRoundCog, LogOut, CreditCard } from 'lucide-react';
import Sidebar from './Sidebar';
import { navItems } from '../../config/navigation';
import { useAuth } from '../../context/AuthContext';

const searchablePages = [
  ...navItems,
  { to: '/app/app-settings', label: 'Settings' },
  { to: '/app/account-settings', label: 'Account Settings' },
  { to: '/app/account-settings#billing', label: 'Billing / Upgrade' }
];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const profileRef = useRef(null);

  const username = user?.username || 'admin';
  const role = (user?.role || 'Administrator').toString();
  const plan = role.toLowerCase() === 'admin' ? 'Administrator' : role;

  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam) {
      const match = navItems.find((p) => p.to.includes(pageParam));
      if (match && location.pathname !== match.to) {
        navigate(match.to, { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    setSidebarOpen(false);
    setProfileOpen(false);
    setQuery('');
  }, [location.pathname]);

  useEffect(() => {
    if (!profileOpen) return;
    const close = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [profileOpen]);

  const suggestions = query.trim()
    ? searchablePages.filter((p) => p.label.toLowerCase().includes(query.trim().toLowerCase()))
    : [];

  const go = (to) => {
    setQuery('');
    navigate(to);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#09090d]">
      <div className="flex flex-1 overflow-hidden pt-16">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Fixed dashboard bar */}
        <div className="bg-custom-back-1 fixed top-0 z-50 px-4 py-3 left-0 right-0 lg:left-64">
          <div className="flex items-center justify-between text-white text-sm font-medium w-full rounded-lg gap-4">
            {/* Search */}
            <div className="relative hidden sm:block w-full max-w-md">
              <div className="flex items-center bg-custom-back rounded-md px-3 py-2">
                <Search className="w-4 h-4 text-gray-400 mr-2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search pages..."
                  className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm"
                  autoComplete="off"
                  aria-label="Search pages"
                />
              </div>

              {suggestions.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 bg-custom-back-1 rounded-md shadow-lg max-h-60 overflow-auto p-1 space-y-1">
                  {suggestions.map((page) => (
                    <li key={page.to}>
                      <button
                        type="button"
                        onClick={() => go(page.to)}
                        className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-300 hover:bg-blue-700 hover:text-white transition"
                      >
                        {page.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setProfileOpen((v) => !v)}
                onKeyDown={(e) => e.key === 'Enter' && setProfileOpen((v) => !v)}
                className="flex items-center bg-custom-back px-3 py-2 rounded-xl gap-3 w-full sm:w-auto justify-between sm:justify-start transition-shadow duration-300 ease-in-out hover:shadow-[0_0_15px_3px_rgba(59,130,246,0.5)] cursor-pointer"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSidebarOpen(true);
                  }}
                  className="lg:hidden p-2 rounded-lg hover:bg-custom-back-1 transition-colors duration-200 text-gray-400 hover:text-white flex-shrink-0"
                  aria-label="Toggle sidebar"
                >
                  <span className="block w-5 h-5">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </span>
                </button>

                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                  <KeyRound className="w-6 h-6 text-white" />
                </div>

                <div className="flex flex-col text-left">
                  <span className="text-sm font-semibold">{username}</span>
                  <span className="text-xs text-gray-300">{plan}</span>
                </div>

                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ml-auto ${
                    profileOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-full min-w-56 bg-custom-back-1 text-white rounded-lg shadow-lg z-50">
                  <span className="cursor-default block px-4 py-2 text-sm font-semibold">{plan}</span>
                  <hr className="border-[#1a1a1a]" />
                  <div className="px-2 py-1">
                    <NavLink
                      to="/app/account-settings"
                      className="mb-1 flex items-center gap-2 w-full py-2 px-4 rounded-md sidebar-link transition text-sm"
                    >
                      <UserRoundCog className="w-4 h-4" />
                      <span>Account Settings</span>
                    </NavLink>
                    <NavLink
                      to="/app/account-settings#billing"
                      className="mb-1 flex items-center gap-2 w-full py-2 px-4 rounded-md sidebar-link transition text-sm"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Billing / Upgrade</span>
                    </NavLink>
                  </div>
                  <hr className="border-[#1a1a1a] my-2" />
                  <div className="px-2 pb-1">
                    <button
                      type="button"
                      onClick={logout}
                      className="mb-1 flex items-center gap-2 w-full py-2 px-4 rounded-md sidebar-link transition text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div id="main-content" className="bg-custom-back-1 w-full lg:ml-64 flex flex-col">
          <main className="flex-grow">
            <Outlet />
          </main>

          <footer className="bg-custom-back rounded-lg shadow m-4">
            <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
              <span className="text-sm text-gray-500 sm:text-center">
                Copyright © 2020 - {new Date().getFullYear()} KeyAuth LLC. All Rights Reserved.
              </span>
              <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-400 sm:mt-0">
                <li>
                  <a
                    href="https://keyauth.cc/terms"
                    target="_blank"
                    rel="noreferrer"
                    className="mr-4 hover:underline hover:text-white md:mr-6"
                  >
                    Terms and Conditions
                  </a>
                </li>
                <li>
                  <a
                    href="https://keyauth.cc/privacy"
                    target="_blank"
                    rel="noreferrer"
                    className="mr-4 hover:underline hover:text-white md:mr-6"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/keyauth"
                    target="_blank"
                    rel="noreferrer"
                    className="mr-4 hover:underline hover:text-white md:mr-6"
                  >
                    Examples
                  </a>
                </li>
                <li>
                  <a
                    href="https://docs.keyauth.cc/"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline hover:text-white"
                  >
                    Docs
                  </a>
                </li>
              </ul>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
