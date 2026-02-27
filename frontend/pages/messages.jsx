import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import TopNav from '../components/stitch/TopNav';
import api from '../lib/api';

export default function Messages() {
  const router = useRouter();
  const { userId: queryUserId } = router.query;

  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    loadData();
  }, []);

  useEffect(() => {
    if (queryUserId && user) {
      // Check if conversation exists
      const conv = conversations.find(c => c.partnerId === parseInt(queryUserId));
      if (conv) {
        handleSelectConversation(conv);
      } else {
        // Start new conversation with this user
        startNewConversation(parseInt(queryUserId));
      }
    }
  }, [queryUserId, conversations, user]);

  const loadData = async () => {
    try {
      const userData = await api.getMe();
      setUser(userData);

      const convData = await api.getConversations();
      setConversations(convData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setLoading(false);
    }
  };

  const startNewConversation = async (partnerId) => {
    try {
      // Fetch partner's user details
      const response = await api.request(`/api/users/${partnerId}`);
      
      // Create temporary conversation object
      const newConv = {
        partnerId: response.id,
        partnerName: response.name,
        partnerEmail: response.email,
        lastMessage: '',
        lastMessageTime: new Date(),
        lastMessageSenderId: null,
        unreadCount: 0
      };
      
      setSelectedConversation(newConv);
      setMessages([]);
    } catch (error) {
      console.error('Failed to start new conversation:', error);
      alert('Could not start conversation with this user');
    }
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    
    try {
      const msgs = await api.getMessages(conversation.partnerId);
      setMessages(msgs);
      
      // Refresh conversations to update unread count
      const convData = await api.getConversations();
      setConversations(convData);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;
    
    setSending(true);
    try {
      await api.sendMessage(selectedConversation.partnerId, newMessage.trim());
      setNewMessage('');
      
      // Reload messages
      const msgs = await api.getMessages(selectedConversation.partnerId);
      setMessages(msgs);
      
      // Refresh conversations
      const convData = await api.getConversations();
      setConversations(convData);
    } catch (error) {
      alert('Failed to send message: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Less than 1 minute
    if (diff < 60000) return 'Just now';
    
    // Less than 1 hour
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      return `${mins}m ago`;
    }
    
    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }
    
    // Less than 7 days
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days}d ago`;
    }
    
    // More than 7 days - show date
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Messages - SkillSwap</title>
      </Head>

      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <TopNav user={user} />

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-4xl text-primary">chat</span>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Messages</h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Chat with your neighbors and coordinate skill exchanges
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
            {/* Conversations List */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="font-bold text-slate-900 dark:text-white">Conversations</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 block mb-4">
                      forum
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      No messages yet
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">
                      Start a conversation from TownSquare or Community pages
                    </p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.partnerId}
                      onClick={() => handleSelectConversation(conv)}
                      className={`w-full p-4 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left relative ${
                        selectedConversation?.partnerId === conv.partnerId
                          ? 'bg-primary/10 border-l-4 border-l-primary'
                          : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {conv.partnerName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-slate-900 dark:text-white truncate">
                              {conv.partnerName}
                            </p>
                            {conv.unreadCount > 0 && (
                              <span className="ml-2 w-6 h-6 rounded-full bg-primary text-slate-900 text-xs font-bold flex items-center justify-center flex-shrink-0">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                            {conv.lastMessageSenderId === user?.id ? 'You: ' : ''}
                            {conv.lastMessage}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                            {formatTime(conv.lastMessageTime)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Message Thread */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                        {selectedConversation.partnerName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">
                          {selectedConversation.partnerName}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          {selectedConversation.partnerEmail}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/profile?user=${selectedConversation.partnerId}`)}
                      className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      View Profile
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => {
                      const isSent = msg.senderId === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                              isSent
                                ? 'bg-primary text-slate-900'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isSent ? 'text-slate-700' : 'text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="px-6 py-3 rounded-lg bg-primary text-slate-900 font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {sending ? (
                          <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        ) : (
                          <span className="material-symbols-outlined">send</span>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 block mb-4">
                      chat_bubble
                    </span>
                    <p className="text-slate-600 dark:text-slate-400">
                      Select a conversation to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
