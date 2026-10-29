import { useState } from 'react';
import { Button, Input } from '../components/ui/index.jsx';
import { Users2, Plus, Trash2, ExternalLink } from 'lucide-react';

export default function Team() {
  const [members, setMembers] = useState([
    { id: '1', email: 'admin@corexis.io', role: 'Owner', status: 'Active' },
    { id: '2', email: 'moderator@corexis.io', role: 'Moderator', status: 'Active' }
  ]);

  return (
    <div className="p-4 space-y-6">
      <div className="mb-4 p-8 bg-custom-back rounded-lg">
        <h1 className="text-xl font-semibold text-white sm:text-2xl">Team Management</h1>
        <p className="text-xs text-gray-500 mt-1">
          Collaborate with developers, moderators, and support agents.{' '}
          <a
            href="https://keyauthdocs.apidog.io/dashboard/app/team"
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
              <th className="py-4 px-4 font-semibold">User Email</th>
              <th className="py-4 px-4 font-semibold">Role</th>
              <th className="py-4 px-4 font-semibold">Status</th>
              <th className="py-4 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1a]">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-[#1a1a1a]/50">
                <td className="py-3 px-4 font-semibold text-white">{m.email}</td>
                <td className="py-3 px-4 text-gray-300 font-medium">{m.role}</td>
                <td className="py-3 px-4">
                  <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/20">
                    {m.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  {m.role !== 'Owner' && (
                    <button onClick={() => setMembers(members.filter((x) => x.id !== m.id))} className="text-gray-500 hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
