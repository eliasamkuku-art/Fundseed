import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2, Sparkles, AlertCircle, ShieldAlert } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, addDoc, getDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MsaidiziModalProps {
  onKeepOpen?: boolean;
  onClose: () => void;
  contextData?: string;
  isPaid: boolean;
  currentUser: any;
  onUpgradeRequest: () => void;
}

interface Message {
  id?: string;
  role: 'user' | 'model' | 'admin';
  text: string;
  userEmail?: string;
  userName?: string;
  createdAt?: any;
}

export const MsaidiziModal: React.FC<MsaidiziModalProps> = ({ onClose, contextData, isPaid, currentUser, onUpgradeRequest }) => {
  const [dbMessages, setDbMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [questionsRemaining, setQuestionsRemaining] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Listen to Firestore real-time updates for chat lessons of this user
  useEffect(() => {
    if (!currentUser) return;
    
    const sessionId = currentUser.userId || currentUser.uid || currentUser.uid;
    const q = query(
      collection(db, 'chat_messages'),
      where('sessionId', '==', sessionId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          role: data.role,
          text: data.text,
          userEmail: data.userEmail,
          userName: data.userName,
          createdAt: data.createdAt
        } as Message;
      });
      setDbMessages(msgs);
    }, (error) => {
      console.error("Error loading live chat from Firebase:", error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Track remaining questions for today
  useEffect(() => {
    if (!currentUser) return;

    const fetchLimits = async () => {
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const userDocRef = doc(db, 'users', currentUser.userId || currentUser.uid);
        const userSnap = await getDoc(userDocRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const lastQuestionDate = userData.lastQuestionDate || '';
          const questionsAskedToday = userData.questionsAskedToday || 0;
          
          if (lastQuestionDate === todayStr) {
            setQuestionsRemaining(Math.max(0, 100 - questionsAskedToday));
          } else {
            setQuestionsRemaining(100);
          }
        } else {
          setQuestionsRemaining(100);
        }
      } catch (err) {
        console.error("Error fetching usage statistics:", err);
      }
    };

    fetchLimits();
    // Re-run every time messages list updates to re-sync count
  }, [currentUser, dbMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [dbMessages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!isPaid) {
      onUpgradeRequest();
      return;
    }

    if (!currentUser) {
      setErrorState("Tafadhali ingia kwenye akaunti kwanza.");
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setErrorState(null);
    setIsLoading(true);

    try {
      // 1. Enforce severe 100 rate-limit questions daily in database
      const todayStr = new Date().toISOString().split('T')[0];
      const userDocRef = doc(db, 'users', currentUser.userId || currentUser.uid);
      const userSnap = await getDoc(userDocRef);
      
      let questionsAskedToday = 0;
      let lastQuestionDate = '';

      if (userSnap.exists()) {
        const userData = userSnap.data();
        questionsAskedToday = userData.questionsAskedToday || 0;
        lastQuestionDate = userData.lastQuestionDate || '';
      }

      if (lastQuestionDate !== todayStr) {
        questionsAskedToday = 0;
        lastQuestionDate = todayStr;
      }

      if (questionsAskedToday >= 100) {
        setErrorState("Umevuka kikomo cha maswali 100 kwa siku! Karibu tena kesho ili uweze kuruhusiwa kuuliza maswali.");
        setIsLoading(false);
        return;
      }

      // Increment daily questions count
      await updateDoc(userDocRef, {
        questionsAskedToday: questionsAskedToday + 1,
        lastQuestionDate: todayStr
      });
      setQuestionsRemaining(Math.max(0, 100 - (questionsAskedToday + 1)));

      // 2. Add message to the collection so that admin sees it inside operational live support
      const sessionId = currentUser.userId || currentUser.uid;
      const userEmail = currentUser.email || '';
      const userName = currentUser.name || 'User';

      await addDoc(collection(db, 'chat_messages'), {
        sessionId,
        userEmail,
        userName,
        role: 'user',
        text: userMessage,
        createdAt: serverTimestamp()
      });

      // 3. Request Gemini Assistant API response
      // Pass the complete real chat history (up to recent messages)
      const chatHistoryForAPI = dbMessages.slice(-10).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const response = await fetch('/api/msaidizi/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: chatHistoryForAPI,
          contextData
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error;
        } catch (e) {
          errorMessage = 'Imeshindwa kupata majibu kutoka kwa AI';
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // 4. Save AI's response to the database
      await addDoc(collection(db, 'chat_messages'), {
        sessionId,
        userEmail,
        userName,
        role: 'model',
        text: data.text,
        createdAt: serverTimestamp()
      });

    } catch (error: any) {
      console.error(error);
      setErrorState(error.message || "Imeshindwa kusafirisha ujumbe.");
    } finally {
      setIsLoading(false);
    }
  };

  const activeMessages = dbMessages.length > 0 ? dbMessages : [
    {
      role: 'model' as const,
      text: 'Habari! Mimi ni **Fundseed Msaidizi** wako. Una swali gani kuhusu ruzuku nchini Tanzania, mikopo (kama _COSTECH NFAST_), mashindano ya ruzuku ya _TRA Innovation_, ujasiriamali, au jinsi ya kupata msukumo wa mitaji ya biashara?',
    }
  ];

  if (!isPaid) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4 animate-fade-in">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative border border-stone-200">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 text-stone-400 hover:text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-full p-1.5 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-emerald-100 border-2 border-emerald-500/20 rounded-2xl mx-auto flex items-center justify-center rotate-3">
              <Sparkles className="h-8 w-8 text-emerald-600 -rotate-3" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-stone-900 font-display">
                Msaidizi wa AI (VIP)
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Fundseed Msaidizi anapatikana kwa watumiaji wa akaunti za VIP pekee. Boresha akaunti yako ili uweze kuuliza maswali yoyote na kupata usaidizi wa papo hapo kuhusu michakato ya ruzuku.
              </p>
            </div>
            
            <button 
              onClick={onUpgradeRequest}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              Upgrade Kuwa VIP Sasa
            </button>
            <p className="text-[10px] uppercase tracking-wider font-bold text-stone-400">
              Upanuzi kwa 20,000 TZS Tu
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/50 backdrop-blur-sm sm:p-4 animate-fade-in">
      <div className="w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-2xl bg-white sm:rounded-2xl shadow-2xl flex flex-col border border-stone-200 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-100 bg-emerald-50/50 sm:rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center shadow-inner">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 font-display flex items-center gap-2">
                Fundseed Msaidizi
              </h3>
              <p className="text-[11px] font-medium text-stone-500">Live Support & Majibu ya Akili</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 bg-white hover:bg-stone-100 shadow-sm border border-stone-200 rounded-full p-2 transition-all active:scale-95 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8faf9] flex flex-col min-h-0">
          
          {questionsRemaining !== null && questionsRemaining <= 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-800 font-medium shrink-0 shadow-sm">
              <ShieldAlert className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-extrabold block">Ukomo Umefikiwa</strong>
                Umeuliza maswali 100 kwa siku ya leo. Kikomo hiki kitaongezeka upya kesho asubuhi kushughulikia mahitaji yako mapya!
              </div>
            </div>
          )}

          {activeMessages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role !== 'user' && (
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border ${
                  msg.role === 'admin' 
                    ? 'bg-amber-100 border-amber-200' 
                    : 'bg-emerald-100 border-emerald-200'
                }`}>
                  <Bot className={`w-4 h-4 ${msg.role === 'admin' ? 'text-amber-700' : 'text-emerald-600'}`} />
                </div>
              )}
              
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm border ${
                msg.role === 'user' 
                  ? 'bg-stone-900 border-stone-900 text-white rounded-br-none' 
                  : msg.role === 'admin'
                    ? 'bg-amber-50/90 border-amber-200 text-stone-850 rounded-bl-none'
                    : 'bg-white border-stone-200 text-stone-800 rounded-bl-none'
              }`}>
                {msg.role === 'admin' && (
                  <span className="block text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">
                    Msimamizi (Human Live Support)
                  </span>
                )}
                <MarkdownRenderer content={msg.text} />
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-stone-250 border border-stone-300 flex-shrink-0 flex items-center justify-center">
                  <User className="w-4 h-4 text-stone-600" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex-shrink-0 flex items-center justify-center animate-pulse">
                 <Bot className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 sm:p-4 bg-white border-t border-stone-100 sm:rounded-b-2xl shrink-0">
          {errorState && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-650 flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
              <span>{errorState}</span>
            </div>
          )}
          <div className="flex items-end gap-2 bg-stone-50 border border-stone-200 rounded-2xl p-1 shadow-inner focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-300 transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={questionsRemaining !== null && questionsRemaining <= 0}
              placeholder={questionsRemaining !== null && questionsRemaining <= 0 ? "Kikomo cha maswali kimefikiwa kwa leo..." : "Uliza Fundseed Msaidizi hapa..."}
              className="flex-1 max-h-32 min-h-[44px] bg-transparent border-0 focus:ring-0 resize-none p-3 text-sm text-stone-800 placeholder:text-stone-400 disabled:opacity-50"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || (questionsRemaining !== null && questionsRemaining <= 0)}
              className="p-3 mb-1 mr-1 rounded-xl bg-emerald-600 text-white disabled:bg-stone-300 disabled:text-stone-500 hover:bg-emerald-700 transition-colors active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-[10px] text-stone-400 mt-2 font-medium">Msaidizi anaweza kukosea. Tafadhali thibitisha taarifa muhimu.</p>
        </div>

      </div>
    </div>
  );
};
