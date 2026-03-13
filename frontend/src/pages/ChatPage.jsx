import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import api from '../utils/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { FiSend, FiArrowLeft } from 'react-icons/fi';

export default function ChatPage() {
  const { chatId } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { socket, notifications } = useSocket();
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => { fetchChats(); }, []);

  useEffect(() => {
    if (chatId) fetchMessages(chatId);
  }, [chatId]);

  // Listen for new messages
  useEffect(() => {
    const newMsgNotifs = notifications.filter(n => n.type === 'message' && n.chatId === chatId);
    if (newMsgNotifs.length > 0) {
      const lastMsg = newMsgNotifs[newMsgNotifs.length - 1];
      setMessages(prev => [...prev, lastMsg.message]);
      scrollToBottom();
    }
  }, [notifications, chatId]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get('/chat');
      setChats(data.chats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (cId) => {
    try {
      const { data } = await api.get(`/chat/${cId}/messages`);
      setMessages(data.messages);
      const chat = chats.find(c => c._id === cId);
      setActiveChat(chat);
      scrollToBottom();
      // Mark as read
      api.put(`/chat/${cId}/read`).catch(() => {});
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !chatId) return;
    try {
      const { data } = await api.post(`/chat/${chatId}/message`, { text: newMessage.trim() });
      setMessages(prev => [...prev, data.message]);
      setNewMessage('');
      scrollToBottom();
    } catch (err) {
      console.error(err);
    }
  };

  const getOtherUser = (chat) => {
    return chat?.participants?.find(p => p._id !== user?._id);
  };

  // Chat list view
  if (!chatId) {
    return (
      <div className="page-container">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('chat')}</h1>
        {loading ? <LoadingSkeleton type="chat" count={5} /> : (
          chats.length === 0 ? (
            <div className="card text-center py-12">
              <span className="text-5xl">💬</span>
              <p className="text-sm text-gray-500 mt-3">{t('noChats')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {chats.map(chat => {
                const other = getOtherUser(chat);
                return (
                  <motion.div key={chat._id} whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/chats/${chat._id}`)}
                    className="card-hover flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {other?.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{other?.name || 'User'}</p>
                        {chat.lastMessage?.timestamp && (
                          <span className="text-[10px] text-gray-400 flex-shrink-0">
                            {new Date(chat.lastMessage.timestamp).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{chat.lastMessage?.text || 'Start chatting...'}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )
        )}
      </div>
    );
  }

  // Chat conversation view
  const otherUser = getOtherUser(activeChat);

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <button onClick={() => navigate('/chats')} className="p-1">
          <FiArrowLeft size={20} />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0">
          {otherUser?.name?.charAt(0) || '?'}
        </div>
        <div>
          <p className="font-semibold text-sm">{otherUser?.name || 'User'}</p>
          <p className="text-xs text-gray-500">{otherUser?.role === 'farmer' ? '🌾 ' + t('farmer') : '👷 ' + t('worker')}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => {
          const isMine = msg.sender === user?._id || msg.sender?._id === user?._id;
          return (
            <motion.div key={msg._id || i}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm
                ${isMine
                  ? 'bg-primary-500 text-white rounded-tr-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-sm'
                }`}>
                <p>{msg.text}</p>
                <p className={`text-[10px] mt-1 ${isMine ? 'text-green-200' : 'text-gray-400'}`}>
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                </p>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={t('typeMessage')}
            className="input-field flex-1"
          />
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleSend}
            disabled={!newMessage.trim()}
            className="w-11 h-11 bg-primary-500 text-white rounded-xl flex items-center justify-center disabled:opacity-50">
            <FiSend size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
