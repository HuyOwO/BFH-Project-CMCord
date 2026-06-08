import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { serverService, channelService } from '../services';
import useAuth from '../hooks/useAuth';

export default function HomePage() {
  const { user, logout }    = useAuth();
  const navigate             = useNavigate();
  const [servers, setServers]     = useState([]);
  const [selected, setSelected]   = useState(null);
  const [channels, setChannels]   = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName]       = useState('');

  useEffect(() => {
    serverService.getAll().then(setServers);
  }, []);

  const selectServer = async (srv) => {
    setSelected(srv);
    const chs = await channelService.getAll(srv._id);
    setChannels(chs);
    if (chs.length > 0) navigate(`/channels/${srv._id}/${chs[0]._id}`);
  };

  const createServer = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const srv = await serverService.create(newName.trim());
    setServers(prev => [...prev, srv]);
    setNewName('');
    setShowCreate(false);
    selectServer(srv);
  };

  return (
    <div className="flex h-screen bg-cm-bg overflow-hidden">
      {/* Server list sidebar */}
      <div className="w-[72px] bg-cm-bg flex flex-col items-center py-3 gap-2 border-r border-cm-border">
        {servers.map(srv => (
          <button
            key={srv._id}
            onClick={() => selectServer(srv)}
            title={srv.name}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all hover:rounded-xl ${
              selected?._id === srv._id ? 'bg-cm-accent rounded-xl' : 'bg-cm-sidebar hover:bg-cm-accent'
            }`}
          >
            {srv.name[0].toUpperCase()}
          </button>
        ))}

        {/* Nút tạo server */}
        <button
          onClick={() => setShowCreate(true)}
          className="w-12 h-12 rounded-full bg-cm-sidebar hover:bg-cm-green hover:rounded-xl text-cm-green hover:text-white flex items-center justify-center text-2xl transition-all"
          title="Tạo server mới"
        >
          +
        </button>
      </div>

      {/* Channel sidebar */}
      <div className="w-60 bg-cm-sidebar flex flex-col">
        <div className="px-4 py-3 border-b border-cm-border font-semibold text-white text-sm">
          {selected ? selected.name : 'Chọn một server'}
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {channels.map(ch => (
            <button
              key={ch._id}
              onClick={() => navigate(`/channels/${selected._id}/${ch._id}`)}
              className="w-full text-left px-3 py-1.5 rounded text-cm-muted hover:bg-cm-input hover:text-cm-text text-sm flex items-center gap-1.5"
            >
              <span className="text-cm-muted">#</span> {ch.name}
            </button>
          ))}
        </div>

        {/* User info */}
        <div className="p-3 bg-cm-bg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-cm-accent flex items-center justify-center text-white text-xs font-bold">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <span className="text-cm-text text-sm font-medium">{user?.username}</span>
          </div>
          <button onClick={logout} className="text-cm-muted hover:text-white text-xs">
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-cm-surface flex items-center justify-center text-cm-muted">
        Chọn một channel để bắt đầu chat
      </div>

      {/* Modal tạo server */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
          <div className="bg-cm-sidebar rounded-lg p-6 w-80 shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-white font-bold text-lg mb-4">Tạo Server mới</h2>
            <form onSubmit={createServer} className="space-y-3">
              <input
                autoFocus value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Tên server..."
                className="w-full bg-cm-input text-cm-text rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cm-accent"
              />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-1.5 text-cm-muted hover:text-white text-sm">
                  Hủy
                </button>
                <button type="submit" className="px-4 py-1.5 bg-cm-accent hover:bg-indigo-500 text-white text-sm rounded">
                  Tạo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
