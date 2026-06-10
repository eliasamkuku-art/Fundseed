import React, { useState, useEffect, useRef } from 'react';
import { Opportunity } from '../types';
import { curatedOpportunities } from '../data';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Trash2, 
  Edit2, 
  Plus, 
  Save, 
  X, 
  MessageSquare, 
  Users, 
  Award, 
  ShieldCheck, 
  RefreshCw, 
  Send, 
  User, 
  Bot, 
  Sparkles, 
  Clock 
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MarkdownRenderer } from './MarkdownRenderer';

const chartData = [
  { name: 'Jumatatu', active: 40 },
  { name: 'Jumanne', active: 30 },
  { name: 'Jumatano', active: 60 },
  { name: 'Alhamisi', active: 80 },
  { name: 'Ijumaa', active: 40 },
  { name: 'Jumamosi', active: 90 },
  { name: 'Jumapili', active: 70 },
];

export default function AdminDashboard({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'opportunities' | 'users' | 'support_chat'>('opportunities');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null);

  // Firestore collections states
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [allChatMessages, setAllChatMessages] = useState<any[]>([]);
  
  // Chat console active state
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  // Load oportunidades
  useEffect(() => {
    const saved = localStorage.getItem('fundseed_all_opportunities');
    if (saved) {
      setOpportunities(JSON.parse(saved));
    } else {
      setOpportunities(curatedOpportunities);
      localStorage.setItem('fundseed_all_opportunities', JSON.stringify(curatedOpportunities));
    }
  }, []);

  // Listen to Firestore users in real-time
  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDbUsers(list);
    }, (error) => {
      console.error("Error fetching live users in admin panel:", error);
    });
    return () => unsubscribe();
  }, []);

  // Listen to all chat messages across the platform
  useEffect(() => {
    const q = query(collection(db, 'chat_messages'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllChatMessages(msgs);
    }, (error) => {
      console.error("Error loading chat messages in admin panel:", error);
    });
    return () => unsubscribe();
  }, []);

  // Scroll active chat thread to bottom
  useEffect(() => {
    if (selectedSessionId) {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedSessionId, allChatMessages]);

  const saveOpportunities = (newOpps: Opportunity[]) => {
    setOpportunities(newOpps);
    localStorage.setItem('fundseed_all_opportunities', JSON.stringify(newOpps));
  };

  const handleDelete = (id: string) => {
    if (confirm('Je, una uhakika unataka kufuta fursa hii?')) {
      saveOpportunities(opportunities.filter(opp => opp.id !== id));
    }
  };

  const handleSave = (opp: Opportunity) => {
    if (editingOpp && editingOpp.id) {
      saveOpportunities(opportunities.map(o => o.id === opp.id ? opp : o));
    } else {
      saveOpportunities([...opportunities, { ...opp, id: `opp-${Date.now()}` }]);
    }
    setEditingOpp(null);
  };

  // Toggle user's VIP subscription status
  const handleToggleVIP = async (userId: string, currentStatus: boolean) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        isPaid: !currentStatus
      });
    } catch (err) {
      console.error("Error updating user subscription status:", err);
      alert("Imeshindwa kusasisha hali ya VIP.");
    }
  };

  // Reset daily limit count
  const handleResetQuestions = async (userId: string) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        questionsAskedToday: 0
      });
      alert("Kikomo cha maswali kimesafirishwa kuwa 0 (Kiko wazi)!");
    } catch (err) {
      console.error("Error resetting daily question limit:", err);
      alert("Imeshindwa kusafisha kikomo cha maswali.");
    }
  };

  // Support Chat Sessions Grouping Logic
  const sessionsMap = new Map<string, { 
    sessionId: string; 
    userEmail: string; 
    userName: string; 
    latestText: string; 
    latestTime: any; 
    messagesCount: number; 
    messages: any[] 
  }>();

  allChatMessages.forEach(msg => {
    const sid = msg.sessionId;
    if (!sid) return;

    if (!sessionsMap.has(sid)) {
      sessionsMap.set(sid, {
        sessionId: sid,
        userEmail: msg.userEmail || '',
        userName: msg.userName || 'Mtumiaji Fundseed',
        latestText: msg.text,
        latestTime: msg.createdAt,
        messagesCount: 1,
        messages: [msg]
      });
    } else {
      const session = sessionsMap.get(sid)!;
      session.messagesCount += 1;
      session.messages.push(msg); // Prepend or append depending on render
    }
  });

  const chatSessions = Array.from(sessionsMap.values());
  const selectedSession = selectedSessionId ? sessionsMap.get(selectedSessionId) : null;
  // Sort chat thread oldest-first for classic chat display flow
  const activeChatThread = selectedSession 
    ? [...selectedSession.messages].sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return aTime - bTime;
      })
    : [];

  // Send admin response
  const handleSendAdminReply = async () => {
    if (!replyInput.trim() || !selectedSessionId || !selectedSession) return;

    try {
      const text = replyInput.trim();
      setReplyInput('');

      await addDoc(collection(db, 'chat_messages'), {
        sessionId: selectedSessionId,
        userEmail: selectedSession.userEmail,
        userName: selectedSession.userName,
        role: 'admin',
        text: text,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error sending admin reply:", err);
      alert("Imeshindwa kutuma ujumbe.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-50 overflow-y-auto p-4 sm:p-8 animate-fade-in flex flex-col">
      <div className="mx-auto w-full max-w-7xl flex flex-col flex-1">
        
        {/* Title area */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200 shrink-0">
          <div>
            <h1 className="text-3xl font-black font-display tracking-tight text-stone-900 flex items-center gap-2">
              Paneli ya Uendeshaji (Admin)
              <span className="align-middle bg-amber-100 text-amber-800 text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">Super Control</span>
            </h1>
            <p className="text-xs text-stone-500 mt-1">Simamia fursa, watumiaji, na jibu meseji za sapoti za live chat kutoka hapa.</p>
          </div>
          <button 
            onClick={onClose} 
            className="self-start sm:self-center bg-stone-900 hover:bg-stone-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow cursor-pointer flex items-center gap-2 active:scale-95"
          >
            <X className="w-4 h-4" />
            Salama Toka (Exit Portal)
          </button>
        </div>
        
        {/* Tabs switcher navbar */}
        <div className="flex gap-2.5 my-6 shrink-0 bg-stone-100 p-1 rounded-2xl w-fit border border-stone-200">
          <button 
            className={`px-4.5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-xs transition-all cursor-pointer ${
              activeTab === 'opportunities' ? 'bg-white text-emerald-800 shadow-sm font-black' : 'text-stone-600 hover:bg-stone-200/50'
            }`} 
            onClick={() => setActiveTab('opportunities')}
          >
            <Award className="w-4 h-4" />
            Fursa za Ruzuku ({opportunities.length})
          </button>
          
          <button 
            className={`px-4.5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-xs transition-all cursor-pointer ${
              activeTab === 'users' ? 'bg-white text-emerald-800 shadow-sm font-black' : 'text-stone-600 hover:bg-stone-200/50'
            }`} 
            onClick={() => setActiveTab('users')}
          >
            <Users className="w-4 h-4" />
            Watumiaji & VIP Controls ({dbUsers.length})
          </button>

          <button 
            className={`px-4.5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-xs transition-all cursor-pointer relative ${
              activeTab === 'support_chat' ? 'bg-white text-emerald-800 shadow-sm font-black' : 'text-stone-600 hover:bg-stone-200/50'
            }`} 
            onClick={() => setActiveTab('support_chat')}
          >
            <MessageSquare className="w-4 h-4" />
            Live Chat Support ({chatSessions.length})
            {chatSessions.length > 0 && (
              <span className="absolute -top-1.5 -right-1 bg-amber-500 text-stone-950 font-black text-[9px] w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
                {chatSessions.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab contents */}
        <div className="flex-1 flex flex-col min-h-0">
          
          {activeTab === 'opportunities' && (
            <div className="space-y-6 flex-1 flex flex-col">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200/60 h-64 shrink-0">
                <h3 className="text-sm font-black text-stone-900 mb-4 font-display uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Ufanyaji Kazi wa Jukwaa (Utembeleaji mteja wa live)
                </h3>
                <ResponsiveContainer width="100%" height="80%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#a0a0a0" fontSize={11} tickLine={false} />
                    <YAxis stroke="#a0a0a0" fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="active" stroke="#059669" strokeWidth={3} dot={{ fill: '#059669', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-between items-center shrink-0">
                <h3 className="text-lg font-extrabold text-stone-900">Kurasa za Fursa Tanzania ({opportunities.length})</h3>
                <button 
                  onClick={() => setEditingOpp({} as Opportunity)}
                  className="flex items-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="mr-1.5 h-4 w-4" /> Kurasa Fursa Mpya
                </button>
              </div>

              {editingOpp && (
                <div className="fixed inset-0 bg-stone-900/55 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in">
                  <div className="bg-white p-6 rounded-2xl w-full max-w-lg border border-stone-200 shadow-2xl relative">
                    <button 
                      onClick={() => setEditingOpp(null)}
                      className="absolute right-4 top-4 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-black text-stone-900 mb-4 font-display">
                      {editingOpp.id ? 'Marekebisho ya Fursa' : 'Ukurasa Mpya wa Ruzuku'}
                    </h2>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Jina la Fursa</label>
                        <input type="text" placeholder="Mfano: TRA Innovation Portal Challenge" className="w-full p-2.5 border rounded-xl text-sm" defaultValue={editingOpp.title} onChange={e => setEditingOpp({...editingOpp, title: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Mtoa Fursa</label>
                        <input type="text" placeholder="Mfano: Tanzania Revenue Authority (TRA)" className="w-full p-2.5 border rounded-xl text-sm" defaultValue={editingOpp.provider} onChange={e => setEditingOpp({...editingOpp, provider: e.target.value})} />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer" onClick={() => handleSave(editingOpp)}>Hifadhi Habari</button>
                        <button className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer" onClick={() => setEditingOpp(null)}>Ghairi</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex-1 min-h-[300px]">
                <table className="w-full border-collapse">
                  <thead className="bg-stone-100/80 border-b border-stone-200">
                    <tr>
                      <th className="p-4 text-left text-xs font-bold text-stone-500 uppercase">Jina ya Fursa</th>
                      <th className="p-4 text-left text-xs font-bold text-stone-500 uppercase">Mtoaji ruzuku</th>
                      <th className="p-4 text-right text-xs font-bold text-stone-500 uppercase">Vitendo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {opportunities.map(opp => (
                      <tr key={opp.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="p-4 text-sm font-semibold text-stone-900">{opp.title}</td>
                        <td className="p-4 text-sm text-stone-500">{opp.provider}</td>
                        <td className="p-4 text-right">
                          <div className="inline-flex gap-2">
                            <button onClick={() => setEditingOpp(opp)} className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded-lg cursor-pointer"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(opp.id)} className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex-1 flex flex-col">
              <div className="p-5 border-b border-stone-100">
                <h3 className="text-lg font-extrabold text-stone-900 leading-none">Wanachama & VIP Superpowers</h3>
                <p className="text-xs text-stone-500 mt-1.5">Simamia akaunti za VIP na weka huru ukomo wa maswali 100 kwa kila mwanachama.</p>
              </div>
              
              <div className="overflow-x-auto flex-1">
                <table className="w-full border-collapse">
                  <thead className="bg-stone-100/80 border-b border-stone-200">
                    <tr>
                      <th className="p-4 text-left text-xs font-bold text-stone-500 uppercase">Jina</th>
                      <th className="p-4 text-left text-xs font-bold text-stone-500 uppercase">Email kuingia</th>
                      <th className="p-4 text-center text-xs font-bold text-stone-500 uppercase">Aina ya Hali</th>
                      <th className="p-4 text-center text-xs font-bold text-stone-500 uppercase">Maswali leo</th>
                      <th className="p-4 text-right text-xs font-bold text-stone-500 uppercase">Vitendo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {dbUsers.map(u => {
                      const isVIP = u.isPaid === true;
                      const questionsCount = u.questionsAskedToday || 0;
                      return (
                        <tr key={u.id} className="hover:bg-stone-50/50 transition-colors">
                          <td className="p-4 text-sm font-semibold text-stone-900">{u.name || 'Watumiaji Applet'}</td>
                          <td className="p-4 text-sm text-stone-600 font-mono">{u.email}</td>
                          <td className="p-4 text-center">
                            {isVIP ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                                <ShieldCheck className="w-3.5 h-3.5" /> VIP PREMIUM
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-500">
                                STANDARD
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                              questionsCount >= 100 ? 'bg-rose-50 text-rose-700 font-black' : 'bg-stone-100 text-stone-600'
                            }`}>
                              {questionsCount} / 100
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="inline-flex gap-2.5">
                              <button 
                                onClick={() => handleToggleVIP(u.id, isVIP)}
                                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                                  isVIP 
                                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200' 
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                                }`}
                              >
                                {isVIP ? 'Weka Standard' : 'Fanya VIP'}
                              </button>
                              <button 
                                onClick={() => handleResetQuestions(u.id)}
                                className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg border border-stone-200 cursor-pointer active:scale-95"
                                title="Reset daily AI question counter"
                              >
                                <RefreshCw className="w-3 h-3" /> Sifirisha 0
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'support_chat' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 bg-white rounded-2xl shadow-sm border border-stone-200 flex-1 min-h-0 divide-x divide-stone-200 overflow-hidden">
              
              {/* Left Column: Chat Sessions List */}
              <div className="lg:col-span-4 flex flex-col min-h-0 bg-stone-50">
                <div className="p-4 border-b border-stone-200 shrink-0 bg-white">
                  <h3 className="font-extrabold text-stone-900 text-sm">Wateja Kwenye Live Chat ({chatSessions.length})</h3>
                  <p className="text-[11px] text-stone-400">Chagua mteja ili kuingia kwenye mazungumzo ya live chat.</p>
                </div>
                
                <div className="flex-1 overflow-y-auto divide-y divide-stone-200">
                  {chatSessions.length === 0 ? (
                    <div className="p-8 text-center text-stone-400 text-xs mt-10">
                      <MessageSquare className="w-8 h-8 mx-auto stroke-1.5 mb-2.5" />
                      Hakuna meseji za sapoti zilizopo kwa sasa.
                    </div>
                  ) : (
                    chatSessions.map((session) => {
                      const isActive = selectedSessionId === session.sessionId;
                      return (
                        <button
                          key={session.sessionId}
                          onClick={() => setSelectedSessionId(session.sessionId)}
                          className={`w-full text-left p-4 transition-all flex gap-3 cursor-pointer ${
                            isActive ? 'bg-emerald-50/80 border-l-4 border-emerald-600' : 'hover:bg-stone-100/50'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white shrink-0 font-bold uppercase shadow-sm">
                            {(session.userName || 'U')[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between items-start gap-1">
                              <h4 className="font-black text-stone-900 text-xs truncate leading-none">{session.userName}</h4>
                              <span className="text-[9px] font-bold text-stone-400 shrink-0 uppercase">
                                {session.messagesCount} meseji
                              </span>
                            </div>
                            <p className="text-[11px] font-mono text-stone-500 truncate leading-none mt-1">{session.userEmail}</p>
                            <p className="text-[11px] text-stone-600 truncate mt-1.5 font-medium italic">
                              "{session.latestText}"
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Chat History and Response Area */}
              <div className="lg:col-span-8 flex flex-col min-h-0 bg-white">
                {selectedSession ? (
                  <div className="flex-1 flex flex-col min-h-0 relative">
                    
                    {/* Thread Header */}
                    <div className="p-4 border-b border-stone-200 shrink-0 bg-stone-50 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-black">
                         {(selectedSession.userName || 'U')[0]}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-stone-900 uppercase text-xs">{selectedSession.userName}</h3>
                          <p className="text-[10px] font-mono text-stone-550">{selectedSession.userEmail}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 bg-amber-50 rounded-lg px-2.5 py-1 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-700" />
                        <span className="text-[10px] text-amber-800 font-bold">Wasilisho la Live Support</span>
                      </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fafcfa]">
                      {activeChatThread.map((msg, idx) => (
                        <div key={idx} className={`flex gap-2.5 ${msg.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                          {msg.role !== 'admin' && (
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border ${
                              msg.role === 'model' ? 'bg-stone-100 border-stone-300' : 'bg-emerald-100 border-emerald-250'
                            }`}>
                              {msg.role === 'model' ? <Bot className="w-4 h-4 text-emerald-700" /> : <User className="w-4 h-4 text-stone-600" />}
                            </div>
                          )}

                          <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm border ${
                            msg.role === 'admin'
                              ? 'bg-amber-500 border-amber-500 text-stone-950 rounded-br-none font-medium'
                              : msg.role === 'model'
                                ? 'bg-stone-50 border-stone-200 text-stone-600 rounded-bl-none'
                                : 'bg-white border-stone-200 text-stone-850 rounded-bl-none'
                          }`}>
                            <span className="block text-[8px] font-black uppercase tracking-widest mb-1.5 opacity-60">
                              {msg.role === 'admin' ? 'Msimamizi (Wewe)' : msg.role === 'model' ? 'AI Assistant System' : 'Mteja / Mjasiriamali'}
                            </span>
                            <MarkdownRenderer content={msg.text} />
                          </div>
                        </div>
                      ))}
                      <div ref={chatMessagesEndRef} />
                    </div>

                    {/* Support Input Controls */}
                    <div className="p-4 border-t border-stone-200 shrink-0 bg-white">
                      <div className="flex items-end gap-2 bg-stone-50 border border-stone-200 rounded-2xl p-1 shadow-inner">
                        <textarea
                          value={replyInput}
                          onChange={(e) => setReplyInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendAdminReply();
                            }
                          }}
                          placeholder={`Jibu ${selectedSession.userName}...`}
                          className="flex-1 max-h-24 min-h-[44px] bg-transparent border-0 focus:ring-0 resize-none p-3 text-sm text-stone-800 placeholder:text-stone-400"
                          rows={1}
                        />
                        <button
                          onClick={handleSendAdminReply}
                          disabled={!replyInput.trim()}
                          className="p-3 mb-1 mr-1 rounded-xl bg-amber-500 text-stone-950 disabled:bg-stone-200 disabled:text-stone-400 hover:bg-amber-400 transition-colors cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400 space-y-4">
                    <div className="w-14 h-14 bg-stone-50 border border-stone-200 rounded-full flex items-center justify-center text-stone-300">
                      <MessageSquare className="w-7 h-7 stroke-1.5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-stone-800 text-sm">Chagua mazungumzo ya wateja</h4>
                      <p className="text-xs text-stone-500 mt-1">Chagua dondoo ya mteja yeyote upande wa kushoto ili uweze kusoma nakala ya soga na kujibu live chat.</p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
