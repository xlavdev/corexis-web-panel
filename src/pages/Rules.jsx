import { useState } from 'react';
import { Button, Input } from '../components/ui/index.jsx';
import { Scale, Plus, Trash2, ExternalLink } from 'lucide-react';

export default function Rules() {
  const [rules, setRules] = useState([
    { id: '1', name: 'Block Russian IP Range', type: 'IP Filter', action: 'Deny' },
    { id: '2', name: 'Max Sessions per IP', type: 'Rate Limit', action: 'Limit (3)' }
  ]);

  return (
    <div className="p-4 space-y-6">
      <div className="mb-4 p-8 bg-custom-back rounded-lg">
        <h1 className="text-xl font-semibold text-white sm:text-2xl">Security Rules</h1>
        <p className="text-xs text-gray-500 mt-1">
          Define access control rules and client firewall filters.{' '}
          <a
            href="https://keyauthdocs.apidog.io/dashboard/app/rules"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            Learn More <ExternalLink size={12} />
          </a>
        </p>
      </div>

      <div className="bg-custom-back border border-[#1a1a1a] rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[#121212] text-blue-700 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-4 px-4 font-semibold">Rule Name</th>
              <th className="py-4 px-4 font-semibold">Type</th>
              <th className="py-4 px-4 font-semibold">Action</th>
              <th className="py-4 px-4 font-semibold text-right">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1a]">
            {rules.map((r) => (
              <tr key={r.id} className="hover:bg-[#1a1a1a]/50">
                <td className="py-3 px-4 font-semibold text-white">{r.name}</td>
                <td className="py-3 px-4 text-gray-300">{r.type}</td>
                <td className="py-3 px-4">
                  <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-[10px] font-bold border border-red-500/20">
                    {r.action}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => setRules(rules.filter((x) => x.id !== r.id))} className="text-gray-500 hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
