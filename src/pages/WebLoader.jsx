import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Button, Input } from '../components/ui/index.jsx';
import { CloudDownload, Upload, ExternalLink, ShieldCheck } from 'lucide-react';

export default function WebLoader() {
  const { selectedApp } = useAppContext();
  const [downloadLink, setDownloadLink] = useState(selectedApp?.webloaderUrl || '');

  return (
    <div className="p-4 space-y-6">
      <div className="mb-4 p-8 bg-custom-back rounded-lg">
        <h1 className="text-xl font-semibold text-white sm:text-2xl">Web Loader</h1>
        <p className="text-xs text-gray-500 mt-1">
          Stream encrypted executable payloads directly into memory via cloud webloader.{' '}
          <a
            href="https://keyauthdocs.apidog.io/dashboard/app/web-loader"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            Learn More <ExternalLink size={12} />
          </a>
        </p>
      </div>

      <div className="bg-custom-back border border-[#1a1a1a] rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <CloudDownload size={16} className="text-blue-400" />
          Cloud Binary Streamer
        </h2>

        <div className="space-y-3">
          <Input
            label="Encrypted Loader Payload URL"
            placeholder="https://cdn.yourdomain.com/binaries/payload.bin"
            value={downloadLink}
            onChange={(e) => setDownloadLink(e.target.value)}
          />
          <Button onClick={() => alert('Loader URL saved!')}>Save Configuration</Button>
        </div>

        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
          <p className="font-bold text-white mb-1">How Web Loader Works:</p>
          Clients authenticate using KeyAuth and call the streaming endpoint. The binary is decrypted dynamically on the fly in memory, so it is never written to disk!
        </div>
      </div>
    </div>
  );
}
