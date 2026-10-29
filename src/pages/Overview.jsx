import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { StatCard, PageHeader, Badge } from '../components/ui/index.jsx';
import { Users, Key, Activity, ShieldOff, ServerCrash, ListChecks } from 'lucide-react';
import api from '../services/api';

export default function Overview() {
  const { selectedApp } = useAppContext();
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedApp) return;
    setLoading(true);
    api.get(`/apps/${selectedApp._id}/stats`)
      .then((res) => {
        if (res.data.success) {
          setStats(res.data.stats);
          setLogs(res.data.recentLogs || []);
        }
      })
      .finally(() => setLoading(false));
  }, [selectedApp]);

  if (!selectedApp) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <ServerCrash size={48} className="text-gray-600 mb-4" />
        <h2 className="text-white text-xl font-semibold mb-2">No Application Found</h2>
        <p className="text-gray-500 text-sm">Create your first app from the Settings page to get started.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={selectedApp.name}
        subtitle={`Owner ID: ${selectedApp.ownerId} · Version: ${selectedApp.version}`}
        action={
          <Badge color={selectedApp.status === 'enabled' ? 'green' : 'red'}>
            {selectedApp.status === 'enabled' ? '● Online' : '⏸ Paused'}
          </Badge>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Total Users" value={loading ? '...' : stats?.totalUsers} color="violet" />
        <StatCard icon={Key} label="Total Keys" value={loading ? '...' : stats?.totalKeys} color="blue" />
        <StatCard icon={ListChecks} label="Unused Keys" value={loading ? '...' : stats?.unusedKeys} color="green" />
        <StatCard icon={Activity} label="Online Sessions" value={loading ? '...' : stats?.onlineSessions} color="yellow" />
      </div>

      {/* App Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* App Credentials */}
        <div className="bg-[#0f0f17] border border-[#0f0f17] rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4 text-sm">Application Credentials</h3>
          <div className="space-y-3">
            {[
              { label: 'App Name', value: selectedApp.name },
              { label: 'Owner ID', value: selectedApp.ownerId },
              { label: 'App Secret', value: selectedApp.secret?.slice(0, 20) + '...' },
              { label: 'Seller Key', value: selectedApp.sellerKey?.slice(0, 20) + '...' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-1.5 border-b border-[#0f0f17] last:border-0">
                <span className="text-xs text-gray-500">{label}</span>
                <span className="text-xs font-mono text-gray-300 truncate max-w-xs">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* App Config */}
        <div className="bg-[#0f0f17] border border-[#0f0f17] rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4 text-sm">Configuration</h3>
          <div className="space-y-3">
            {[
              { label: 'HWID Lock', value: selectedApp.hwidLock ? 'Enabled' : 'Disabled', color: selectedApp.hwidLock ? 'green' : 'gray' },
              { label: 'Hash Check', value: selectedApp.hashCheck ? 'Enabled' : 'Disabled', color: selectedApp.hashCheck ? 'green' : 'gray' },
              { label: 'Session Timeout', value: `${selectedApp.sessionTimeoutSec}s`, color: 'blue' },
              { label: 'Version', value: selectedApp.version, color: 'violet' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center py-1.5 border-b border-[#0f0f17] last:border-0">
                <span className="text-xs text-gray-500">{label}</span>
                <Badge color={color}>{value}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Logs */}
      <div className="bg-[#0f0f17] border border-[#0f0f17] rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4 text-sm">Recent Logs</h3>
        {logs.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">No logs recorded yet.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {logs.map((log) => (
              <div key={log._id} className="flex items-start gap-3 py-2 border-b border-[#0f0f17] last:border-0">
                <Badge color={log.level === 'error' ? 'red' : log.level === 'warn' ? 'yellow' : 'gray'}>
                  {log.level}
                </Badge>
                <span className="text-xs text-gray-300 flex-1">{log.message}</span>
                <span className="text-xs text-gray-600 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
