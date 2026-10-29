import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ManageApps from './pages/ManageApps';
import Licenses from './pages/Licenses';
import Users from './pages/Users';
import Tokens from './pages/Tokens';
import Subscriptions from './pages/Subscriptions';
import Chats from './pages/Chats';
import Sessions from './pages/Sessions';
import Webhooks from './pages/Webhooks';
import CloudFiles from './pages/CloudFiles';
import CloudVariables from './pages/CloudVariables';
import Rules from './pages/Rules';
import Logs from './pages/Logs';
import WebLoader from './pages/WebLoader';
import Team from './pages/Team';
import AppSettings from './pages/AppSettings';
import AccountSettings from './pages/AccountSettings';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            {/* Public KeyAuth Homepage */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Corexis KeyAuth App Dashboard (/app/...) */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/app/manage-apps" replace />} />
              <Route path="manage-apps" element={<ManageApps />} />
              <Route path="licenses" element={<Licenses />} />
              <Route path="users" element={<Users />} />
              <Route path="tokens" element={<Tokens />} />
              <Route path="subscriptions" element={<Subscriptions />} />
              <Route path="chats" element={<Chats />} />
              <Route path="sessions" element={<Sessions />} />
              <Route path="webhooks" element={<Webhooks />} />
              <Route path="files" element={<CloudFiles />} />
              <Route path="variables" element={<CloudVariables />} />
              <Route path="rules" element={<Rules />} />
              <Route path="logs" element={<Logs />} />
              <Route path="web-loader" element={<WebLoader />} />
              <Route path="team" element={<Team />} />
              <Route path="app-settings" element={<AppSettings />} />
              <Route path="account-settings" element={<AccountSettings />} />
            </Route>

            {/* Backward compatibility for /dashboard */}
            <Route path="/dashboard/*" element={<Navigate to="/app/manage-apps" replace />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
