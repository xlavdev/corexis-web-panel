import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import api from '../services/api';
import { Terminal, Trash2, RefreshCw, AlertCircle, FileText, Clock, Globe } from 'lucide-react';

export default function Logs() {
  const { currentApp } = useAppContext();
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const fetchLogs = async () => {
    if (!currentApp?._id && !currentApp?.id) return;
    const appId = currentApp.id || currentApp._id;
    try {
      setLoading(true);
      const res = await api.get(`/apps/${appId}/logs?limit=100`);
      if (res.data.success) {
        setLogs(res.data.logs || []);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentApp]);

  const handleClearLogs = async () => {
    if (!currentApp?._id && !currentApp?.id) return;
    if (!window.confirm('Are you sure you want to clear all logs for this application?')) return;
    const appId = currentApp.id || currentApp._id;
    try {
      setClearing(true);
      await api.delete(`/apps/${appId}/logs`);
      setLogs([]);
      setTotal(0);
    } catch (err) {
      alert('Failed to clear logs.');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-custom-back border border-[#1a1a1a] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-mono mb-2">
            <Terminal className="w-3.5 h-3.5" />
            <span>APPLICATION EVENT STREAM</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Security &amp; Client Logs</h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time execution logs, authentication events, and client activity for{' '}
            <span className="text-blue-400 font-medium">{currentApp?.name || 'Selected Application'}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchLogs}
            disabled={loading}
            className="cursor-pointer px-3.5 py-2 rounded-xl bg-custom-back-1 hover:bg-[#22222a] border border-[#26262a] text-gray-300 hover:text-white text-xs font-medium flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleClearLogs}
            disabled={clearing || logs.length === 0}
            className="cursor-pointer px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-custom-back border border-[#1a1a1a] rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[#121212] bg-[#121212]/50 text-blue-500 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3.5 px-4 font-semibold">Event Action / Message</th>
              <th className="py-3.5 px-4 font-semibold">User</th>
              <th className="py-3.5 px-4 font-semibold">Client IP</th>
              <th className="py-3.5 px-4 font-semibold text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1a]">
            {loading ? (
              <tr>
                <td colSpan="4" className="py-12 text-center text-gray-500 font-mono">
                  Streaming logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-12 text-center text-gray-500 font-mono">
                  No log entries recorded for this application yet.
                </td>
              </tr>
            ) : (
              logs.map((log, index) => (
                <tr key={log.id || log._id || index} className="hover:bg-[#1a1a1a]/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-zinc-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{log.action || log.message || 'Log Event'}</span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-blue-400">
                    {log.username || 'Anonymous / System'}
                  </td>
                  <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px]">
                    {log.ip || '127.0.0.1'}
                  </td>
                  <td className="py-3.5 px-4 text-right text-gray-500 font-mono text-[11px]">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Just now'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
