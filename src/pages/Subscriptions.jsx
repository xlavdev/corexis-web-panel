import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Modal, Input, Button } from '../components/ui/index.jsx';
import { CreditCard, Plus, Trash2, ExternalLink } from 'lucide-react';
import api from '../services/api';

export default function Subscriptions() {
  const { selectedApp } = useAppContext();
  const [subs, setSubs] = useState([
    { id: '1', name: 'default', level: 1 },
    { id: '2', name: 'VIP', level: 2 },
    { id: '3', name: 'Enterprise', level: 3 }
  ]);
  const [createModal, setCreateModal] = useState(false);
  const [newSub, setNewSub] = useState({ name: '', level: 1 });

  return (
    <div className="p-4 space-y-6">
      <div className="mb-4 p-8 bg-custom-back rounded-lg">
        <h1 className="text-xl font-semibold text-white sm:text-2xl">Subscriptions</h1>
        <p className="text-xs text-gray-500 mt-1">
          Subscriptions define the levels and permissions granted to license keys.{' '}
          <a
            href="https://keyauthdocs.apidog.io/dashboard/app/subscriptions"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            Learn More <ExternalLink size={12} />
          </a>
        </p>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setCreateModal(true)}>
          <Plus size={14} /> Create Subscription
        </Button>
      </div>

      <div className="bg-custom-back border border-[#1a1a1a] rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[#121212] text-blue-700 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-4 px-4 font-semibold">Subscription Name</th>
              <th className="py-4 px-4 font-semibold">Level</th>
              <th className="py-4 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1a]">
            {subs.map((s) => (
              <tr key={s.id} className="hover:bg-[#1a1a1a]/50">
                <td className="py-3 px-4 font-semibold text-white">{s.name}</td>
                <td className="py-3 px-4">
                  <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-[11px] font-bold border border-blue-500/20">
                    Level {s.level}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => setSubs(subs.filter((x) => x.id !== s.id))}
                    className="p-1.5 text-gray-500 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create Subscription">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubs([...subs, { id: Date.now().toString(), name: newSub.name, level: newSub.level }]);
            setCreateModal(false);
            setNewSub({ name: '', level: 1 });
          }}
          className="space-y-4"
        >
          <Input
            label="Subscription Name"
            placeholder="e.g. Premium, Beta"
            value={newSub.name}
            onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
            required
          />
          <Input
            label="Level Number"
            type="number"
            min={1}
            value={newSub.level}
            onChange={(e) => setNewSub({ ...newSub, level: parseInt(e.target.value) || 1 })}
            required
          />
          <Button type="submit" className="w-full justify-center">Create Subscription</Button>
        </form>
      </Modal>
    </div>
  );
}
