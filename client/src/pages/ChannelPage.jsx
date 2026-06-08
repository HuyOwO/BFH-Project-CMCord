import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { messageService, channelService, serverService } from '../services';
import useAuth   from '../hooks/useAuth';
import useSocket from '../hooks/useSocket';

export default function ChannelPage() {
  const { serverId, channelId } = useParams();
  const { user, logout }         = useAuth();
  const socket                   = useSocket();
  const navigate                 = useNavigate();

  const [messages,  setMessages]  = useState([]);
  const [channels,  setChannels]  = useState([]);
  const [server,    setServer]    = useState(null);
  const [input,     setInput]     = useState('');
  const [typing,    setTyping]    = useState([]);
  const bottomRef = useRef(null);

  // Load dữ liệu ban đầu
  useEffect(() => {
    serverService.getOne(serverId).then(setServer);
    channelService.getAll(serverId).then(setChannels);
    messageService.getAll(channelId).then(setMessages);
  }, [serverId, channelId]);

  // Socket: join channel và lắng nghe sự kiện
  useEffect(() => {
    if (!socket) return;
    socket.emit('join_channel', { channelId });
    socket.on('new_message', msg => setMessages(prev => [...prev, msg]));
    socket.on('user_typing', ({ username }) =>
      setTyping(prev => prev.includes(username) ? prev : [...prev, username])
    );
    socket.on('user_stop_typing', ({ userId }) =>
      setTyping(prev => prev.filter(u => u !== userId))
    );
    return () => {
      socket.emit('leave_channel', { channelId });
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, [socket, channelId]);

  // Tự scroll xuống khi có tin nhắn mới
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    socket
      ? socket.emit('send_message', { channelId, content: input.trim() })
      : await messageService.send(channelId, input.trim());
    setInput('');
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    socket?.emit('typing', { channelId });
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const currentChannel = channels.find(c => c._id === channelId);

  return (
    <div className="flex h-screen bg-cm-bg overflow-hidden">
      {/* Server icon bar */}
      <div className="w-[72px] bg-cm-bg flex flex-col items-center py-3 gap-2 border-r border-cm-border">
        <div className="w-12 h-12 rounded-xl bg-cm-accent flex items-center justify-center text-white font-bold text-sm">
          {server?.name?.[0]?.toUpperCase() || '?'}
        </div>
      </div>

      {/* Channel list */}
      <div className="w-60 bg-cm-sidebar flex flex-col">
        <div className="px-4 py-3 border-b border-cm-border font-semibold text-white text-sm truncate">
          {server?.name}
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {channels.map(ch => (
            <button
              key={ch._id}
              onClick={() => navigate(`/channels/${serverId}/${ch._id}`)}
              className={`w-full text-left px-3 py-1.5 rounded text-sm flex items-center gap-1.5 ${
                ch._id === channelId
                  ? 'bg-cm-input text-white'
                  : 'text-cm-muted hover:bg-cm-input hover:text-cm-text'
              }`}
            >
              <span>#</span> {ch.name}
            </button>
          ))}
        </div>
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

      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-cm-surface">
        {/* Header */}
        <div className="px-4 py-3 border-b border-cm-border flex items-center gap-2 shadow-sm">
          <span className="text-cm-muted text-lg">#</span>
          <span className="text-white font-semibold">{currentChannel?.name}</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {messages.map((msg, i) => {
            const showHeader = i === 0 || messages[i - 1].author._id !== msg.author._id;
            return (
              <div key={msg._id} className={`flex gap-3 ${showHeader ? 'mt-4' : 'mt-0.5'} group`}>
                {showHeader ? (
                  <div className="w-10 h-10 rounded-full bg-cm-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {msg.author.username[0].toUpperCase()}
                  </div>
                ) : (
                  <div className="w-10 flex-shrink-0" />
                )}
                <div>
                  {showHeader && (
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-white text-sm font-semibold">{msg.author.username}</span>
                      <span className="text-cm-muted text-xs">{formatTime(msg.createdAt)}</span>
                    </div>
                  )}
                  <p className="text-cm-text text-sm leading-relaxed">{msg.content}</p>
                  {msg.fileUrl && (
                    <a href={msg.fileUrl} target="_blank" rel="noreferrer"
                      className="text-cm-accent text-xs hover:underline mt-1 block">
                      📎 Tải file đính kèm
                    </a>
                  )}
                </div>
              </div>
            );
          })}

          {typing.length > 0 && (
            <p className="text-cm-muted text-xs italic px-2">
              {typing.join(', ')} đang gõ...
            </p>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="px-4 pb-4">
          <div className="bg-cm-input rounded-lg flex items-center px-4 gap-3">
            <input
              value={input}
              onChange={handleTyping}
              onBlur={() => socket?.emit('stop_typing', { channelId })}
              placeholder={`Nhắn tin #${currentChannel?.name || '...'}`}
              className="flex-1 bg-transparent text-cm-text text-sm py-3 outline-none placeholder-cm-muted"
            />
            <button type="submit" className="text-cm-muted hover:text-white transition-colors">
              ➤
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
