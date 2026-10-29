import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { PageHeader, Button, Badge, Table, Modal, Input, Select } from '../components/ui/index.jsx';
import { Plus, Trash2 } from 'lucide-react';
import api from '../services/api';

export default function Blacklist() {
  const { selectedApp } = useAppContext();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ type: 'hwid', value: '', reason: '' });

  const fetch = async () => {
    if (!selectedApp) return;
    setLoading(true);
    try {
      const res = await api.get(`/apps/${selectedApp._id}/blacklists`);
      if (res.data.success) setList(res.data.blacklists);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [selectedApp]);

  const add = async () => {
    if (!form.value) return alert('Value is required');
    await api.post(`/apps/${selectedApp._id}/blacklists`, form);
    setModal(false);
    setForm({ type: 'hwid', value: '', reason: '' });
    fetch();
  };

  const remove = async (id) => {
    if (!confirm('Remove this blacklist entry?')) return;
    await api.delete(`/blacklists/${id}`);
    fetch();
  };

  return (
    <div>
      <PageHeader
        title="Blacklist"
        subtitle="Block HWIDs and IP addresses from accessing your application"
        action={<Button onClick={() => setModal(true)}><Plus size={14} /> Add Entry</Button>}
      />

      <Table headers={['Type', 'Value', 'Reason', 'Added', 'Action']}>
        {loading ? (
          <tr><td colSpan="5" className="text-center py-8 text-gray-500">Loading...</td></tr>
        ) : list.length === 0 ? (
          <tr><td colSpan="5" className="text-center py-8 text-gray-500">No blacklist entries.</td></tr>
        ) : list.map((entry) => (
          <tr key={entry._id} className="hover:bg-white/[0.03]">
            <td className="px-4 py-3"><Badge color={entry.type === 'hwid' ? 'red' : 'yellow'}>{entry.type.toUpperCase()}</Badge></td>
            <td className="px-4 py-3 font-mono text-xs text-gray-300 truncate max-w-xs">{entry.value}</td>
            <td className="px-4 py-3 text-gray-400 text-sm">{entry.reason}</td>
            <td className="px-4 py-3 text-gray-500 text-xs">{new Date(entry.createdAt).toLocaleString()}</td>
            <td className="px-4 py-3">
              <Button size="sm" variant="danger" onClick={() => remove(entry._id)}><Trash2 size={12} /></Button>
            </td>
          </tr>
        ))}
      </Table>

      <Modal title="Add Blacklist Entry" open={modal} onClose={() => setModal(false)}>
        <div className="space-y-4">
          <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="hwid">HWID</option>
            <option value="ip">IP Address</option>
          </Select>
          <Input label="Value" placeholder="HWID or IP address" value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })} />
          <Input label="Reason" placeholder="Reason for blacklisting" value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          <Button onClick={add} className="w-full justify-center"><Plus size={14} /> Add to Blacklist</Button>
        </div>
      </Modal>
    </div>
  );
}
