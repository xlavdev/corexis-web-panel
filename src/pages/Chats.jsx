import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Button, Input } from '../components/ui/index.jsx';
import { MessageSquare, Send, RefreshCw, ExternalLink } from 'lucide-react';
import api from '../services/api';

export default function Chats() {
  const { selectedApp } = useAppContext();
  const [messages, setMessages] = useState([
    { id: '1', author: 'System', text: 'Welcome to the application live chat room.', time: '12:00 PM' }
  ]);
  const [text, setText] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        author: 'Admin',
        text: text.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setText('');
  };

  return (
    <div className="p-4 space-y-6">
      <div className="mb-4 p-8 bg-custom-back rounded-lg">
        <h1 className="text-xl font-semibold text-white sm:text-2xl">Live Chats</h1>
        <p className="text-xs text-gray-500 mt-1">
          Monitor and chat in real-time with users inside your application.{' '}
          <a
            href="https://keyauthdocs.apidog.io/dashboard/app/chats"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            Learn More <ExternalLink size={12} />
          </a>
        </p>
      </div>

      <div className="bg-custom-back border border-[#1a1a1a] rounded-xl shadow-sm flex flex-col h-[520px]">
        {/* Messages Header */}
        <div className="p-4 border-b border-[#1a1a1a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-blue-400" />
            <span className="text-sm font-bold text-white">#general-channel</span>
          </div>
          <span className="text-xs text-emerald-400 font-semibold">● Active</span>
        </div>

        {/* Message feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="bg-custom-back-1 border border-[#1a1a1a] p-3 rounded-xl max-w-xl">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold ${m.author === 'Admin' ? 'text-blue-400' : 'text-gray-300'}`}>
                  {m.author}
                </span>
                <span className="text-[10px] text-gray-500">{m.time}</span>
              </div>
              <p className="text-xs text-gray-200">{m.text}</p>
            </div>
          ))}
        </div>

        {/* Send box */}
        <form onSubmit={handleSend} className="p-3 border-t border-[#1a1a1a] flex gap-2">
          <Input
            placeholder="Type a broadcast message to all users..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">
            <Send size={14} /> Send
          </Button>
        </form>
      </div>
    </div>
  );
}
