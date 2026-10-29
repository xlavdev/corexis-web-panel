import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Input, Button } from '../components/ui/index.jsx';
import { Webhook, Plus, Send, ExternalLink } from 'lucide-react';

export default function Webhooks() {
  const { selectedApp } = useAppContext();
  const [webhookUrl, setWebhookUrl] = useState(selectedApp?.discordWebhook || '');
  const [testing, setTesting] = useState(false);

  const testWebhook = async () => {
    if (!webhookUrl) return alert('Please enter a Discord Webhook URL first.');
    setTesting(true);
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [
            {
              title: '🚀 Corexis KeyAuth Test Webhook',
              description: `Webhook successfully verified for **${selectedApp?.name || 'COREXIS'}**!`,
              color: 0x7c3aed,
              timestamp: new Date().toISOString()
            }
          ]
        })
      });
      alert('Test webhook sent successfully to Discord!');
    } catch {
      alert('Failed to send webhook. Please check the URL.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="mb-4 p-8 bg-custom-back rounded-lg">
        <h1 className="text-xl font-semibold text-white sm:text-2xl">Webhooks</h1>
        <p className="text-xs text-gray-500 mt-1">
          Receive real-time notifications directly in your Discord or Telegram server.{' '}
          <a
            href="https://keyauthdocs.apidog.io/dashboard/app/webhooks"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            Learn More <ExternalLink size={12} />
          </a>
        </p>
      </div>

      <div className="bg-custom-back border border-[#1a1a1a] rounded-xl p-6 shadow-sm space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Webhook size={16} className="text-blue-400" />
          Discord Integration
        </h2>

        <div className="space-y-3">
          <Input
            label="Discord Webhook URL"
            placeholder="https://discord.com/api/webhooks/..."
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={testWebhook} disabled={testing}>
              <Send size={13} /> {testing ? 'Sending Test...' : 'Send Test Embed'}
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t border-[#1a1a1a] space-y-2">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Trigger Events</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded bg-custom-back-1 text-blue-600 focus:ring-0" />
              <span>New License Redeemed</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded bg-custom-back-1 text-blue-600 focus:ring-0" />
              <span>User Registration</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded bg-custom-back-1 text-blue-600 focus:ring-0" />
              <span>Account / License Banned</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded bg-custom-back-1 text-blue-600 focus:ring-0" />
              <span>Blacklist Triggered</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
