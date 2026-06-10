
import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Send, MessageCircle } from 'lucide-react';

export default function SupportChat({ user }: { user: any }) {
  const [messages, setMessages] = useState<any[]>(() => {
    try {
      const saved = sessionStorage.getItem('supportChatHistory');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem('supportChatHistory', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  useEffect(() => {
    const sessionId = user?.uid;
    if (!sessionId) return;

    const q = query(
        collection(db, 'chat_messages'), 
        where('sessionId', '==', sessionId),
        where('chatType', '==', 'support'),
        orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("SupportChat onSnapshot error:", error);
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) {
    return (
      <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-xl text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto">
          <MessageCircle className="h-8 w-8 text-stone-400" />
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-stone-900">Tafadhali Ingia</h4>
          <p className="text-xs text-stone-500 max-w-[200px] mx-auto">Unatakiwa kuingia kwenye akaunti yako ili kuanza mazungumzo na timu yetu.</p>
        </div>
      </div>
    );
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await addDoc(collection(db, 'chat_messages'), {
      text: newMessage,
      sessionId: user.uid,
      sender: user.name || 'Anonymous',
      senderEmail: user.email || 'anonymous@fundseed.com',
      chatType: 'support',
      timestamp: serverTimestamp()
    });
    setNewMessage('');
  };

  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xl shadow-stone-100 flex flex-col h-[500px]">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
            <h4 className="text-sm font-bold text-stone-900 leading-tight">Msaada na Support</h4>
            <p className="text-[11px] text-stone-500">Tunajibu ndani ya muda mfupi</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
        {messages.map(msg => (
          <div key={msg.id} className={`flex flex-col ${msg.senderEmail === user.email ? 'items-end' : 'items-start'}`}>
            <div className={`p-4 rounded-2xl max-w-[85%] text-sm ${msg.senderEmail === user.email ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-stone-100 text-stone-800 rounded-bl-none'}`}>
              <p>{msg.text}</p>
            </div>
            <span className="text-[10px] text-stone-500 mt-1 px-1">{msg.sender}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={sendMessage} className="flex gap-2 bg-stone-50 p-2 rounded-2xl border border-stone-200">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Andika ujumbe wako hapa..."
          className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none"
        />
        <button type="submit" className="bg-emerald-600 text-white p-2.5 rounded-xl hover:bg-emerald-700 transition-colors">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
