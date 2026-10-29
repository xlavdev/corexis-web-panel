import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { PageHeader, Button, Badge, Table, Modal, Input } from '../components/ui/index.jsx';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function CloudVariables() {
  const { selectedApp } = useAppContext();
  const [vars, setVars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ key: '', value: '' });

  const fetchVars = async () => {
    if (!selectedApp) return;
    setLoading(true);
    try {
      const res = await api.get(`/apps/${selectedApp._id}/variables`);
      if (res.data.success) setVars(res.data.variables);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchVars(); }, [selectedApp]);

  const saveVar = async () => {
    await api.post(`/apps/${selectedApp._id}/variables`, form);
    setModal(false);
    setForm({ key: '', value: '' });
    fetchVars();
  };

  const deleteVar = async (id) => {
    if (!confirm('Delete this variable?')) return;
    await api.delete(`/variables/${id}`);
    fetchVars();
  };

  return (
    <div className="p-4 space-y-6">
      <PageHeader
        title="Cloud Variables"
        subtitle="Global variables accessible from your application"
        action={
          <Button onClick={() => setModal(true)}><Plus size={14} /> Add Variable</Button>
        }
      />

      <Table headers={['Key', 'Value', 'Last Updated', 'Action']}>
        {loading ? (
          <tr><td colSpan="4" className="text-center py-8 text-gray-500">Loading...</td></tr>
        ) : vars.length === 0 ? (
          <tr><td colSpan="4" className="text-center py-8 text-gray-500">No variables found.</td></tr>
        ) : vars.map((v) => (
          <tr key={v._id} className="hover:bg-white/[0.03]">
            <td className="px-4 py-3 font-mono text-sm text-blue-400">{v.key}</td>
            <td className="px-4 py-3 text-gray-300 text-sm truncate max-w-xs">{v.value}</td>
            <td className="px-4 py-3 text-gray-500 text-xs">{new Date(v.updatedAt).toLocaleString()}</td>
            <td className="px-4 py-3">
              <Button size="sm" variant="danger" onClick={() => deleteVar(v._id)}>
                <Trash2 size={12} />
              </Button>
            </td>
          </tr>
        ))}
      </Table>

      <Modal title="Add / Update Variable" open={modal} onClose={() => setModal(false)}>
        <div className="space-y-4">
          <Input label="Variable Key" placeholder="e.g. offsets_version" value={form.key}
            onChange={(e) => setForm({ ...form, key: e.target.value })} />
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Value</label>
            <textarea
              className="w-full bg-custom-back-1 border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              rows={4}
              placeholder="Variable value..."
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
            />
          </div>
          <Button onClick={saveVar} className="w-full justify-center"><Plus size={14} /> Save Variable</Button>
        </div>
      </Modal>
    </div>
  );
}
