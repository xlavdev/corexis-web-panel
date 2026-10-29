import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { PageHeader, Button, Badge, Table, Modal, Input } from '../components/ui/index.jsx';
import { Upload, Trash2, Download } from 'lucide-react';
import api from '../services/api';

export default function CloudFiles() {
  const { selectedApp } = useAppContext();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ fileId: '', fileName: '', description: '', fileData: '' });
  const [uploading, setUploading] = useState(false);

  const fetchFiles = async () => {
    if (!selectedApp) return;
    setLoading(true);
    try {
      const res = await api.get(`/apps/${selectedApp._id}/files`);
      if (res.data.success) setFiles(res.data.files);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchFiles(); }, [selectedApp]);

  const handleFileRead = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!form.fileName) setForm((f) => ({ ...f, fileName: file.name }));
    const reader = new FileReader();
    reader.onload = (ev) => setForm((f) => ({ ...f, fileData: ev.target.result.split(',')[1] }));
    reader.readAsDataURL(file);
  };

  const upload = async () => {
    if (!form.fileId || !form.fileName || !form.fileData) return alert('File ID, name, and file are required.');
    setUploading(true);
    try {
      const res = await api.post(`/apps/${selectedApp._id}/files`, form);
      if (res.data.success) { setModal(false); setForm({ fileId: '', fileName: '', description: '', fileData: '' }); fetchFiles(); }
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const deleteFile = async (id) => {
    if (!confirm('Delete this file?')) return;
    await api.delete(`/files/${id}`);
    fetchFiles();
  };

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="p-4 space-y-6">
      <PageHeader
        title="Secure Files"
        subtitle="Files are served to authenticated users only via the API"
        action={<Button onClick={() => setModal(true)}><Upload size={14} /> Upload File</Button>}
      />

      <Table headers={['File ID', 'File Name', 'Size', 'Description', 'Uploaded', 'Action']}>
        {loading ? (
          <tr><td colSpan="6" className="text-center py-8 text-gray-500">Loading...</td></tr>
        ) : files.length === 0 ? (
          <tr><td colSpan="6" className="text-center py-8 text-gray-500">No files uploaded.</td></tr>
        ) : files.map((file) => (
          <tr key={file._id} className="hover:bg-white/[0.03]">
            <td className="px-4 py-3"><span className="font-mono text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">{file.fileId}</span></td>
            <td className="px-4 py-3 text-gray-300 text-sm">{file.fileName}</td>
            <td className="px-4 py-3 text-gray-400 text-xs">{formatSize(file.fileSize)}</td>
            <td className="px-4 py-3 text-gray-500 text-xs">{file.description || '—'}</td>
            <td className="px-4 py-3 text-gray-500 text-xs">{new Date(file.createdAt).toLocaleDateString()}</td>
            <td className="px-4 py-3">
              <Button size="sm" variant="danger" onClick={() => deleteFile(file._id)}><Trash2 size={12} /></Button>
            </td>
          </tr>
        ))}
      </Table>

      <Modal title="Upload Secure File" open={modal} onClose={() => setModal(false)}>
        <div className="space-y-4">
          <Input label="File ID (used in type=file requests)" placeholder="e.g. payload_v2" value={form.fileId}
            onChange={(e) => setForm({ ...form, fileId: e.target.value })} />
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Select File</label>
            <input type="file" onChange={handleFileRead}
              className="w-full text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer" />
          </div>
          <Input label="File Name (override)" placeholder="payload.dll" value={form.fileName}
            onChange={(e) => setForm({ ...form, fileName: e.target.value })} />
          <Input label="Description (optional)" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Button onClick={upload} disabled={uploading} className="w-full justify-center">
            <Upload size={14} />
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
