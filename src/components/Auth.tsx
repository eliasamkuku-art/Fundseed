import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { X, Mail, Lock, Phone, AlertCircle, Sprout, Chrome } from 'lucide-react';

export default function Auth({ onClose }: { onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getErrorMessage = (err: any) => {
    if (!err) return '';
    const code = err.code || '';
    
    switch (code) {
      case 'auth/popup-closed-by-user':
        return ''; // Return empty string to avoid showing an error to the user
      case 'auth/invalid-credential':
        return 'Barua pepe au neno la siri si sahihi.';
      case 'auth/user-not-found':
        return 'Mtumiaji huyu hayupo.';
      case 'auth/wrong-password':
        return 'Neno la siri si sahihi.';
      case 'auth/email-already-in-use':
        return 'Barua pepe hii tayari inatumiwa na akaunti nyingine.';
      case 'auth/operation-not-allowed':
        return 'Usajili kwa barua pepe haujaruhusiwa. Hakikisha Email/Password imewezeshwa.";';
      case 'auth/weak-password':
        return 'Neno la siri ni dhaifu mno. Tumia herufi angalau 6.';
      case 'auth/invalid-email':
        return 'Barua pepe hii si sahihi.';
      case 'auth/too-many-requests':
        return 'Majaribio mengi yamefeli. Tafadhali jaribu tena baada ya muda kidogo.';
      default:
        return err.message;
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onClose();
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (!phone) {
          throw new Error("Namba ya simu inahitajika ili kukamilisha usajili.");
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Save initial user profile with only email and phone number (Progressive Profiling)
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          userId: user.uid,
          email: user.email || email,
          phoneNumber: phone,
          name: email.split('@')[0], // Placeholder name until updated on checkout or dashboard
          isPaid: false,
          registeredAt: serverTimestamp(),
        });
      }
      onClose();
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 overflow-y-auto max-h-[90vh] scrollbar-none"
      >
        {/* Header decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-emerald-600 to-emerald-400" />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-3 text-emerald-600">
            <Sprout className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-black text-stone-900">{isLogin ? 'Ingia' : 'Jiunge Nasi'}</h2>
          <p className="text-stone-500 text-xs mt-1 text-center leading-tight">
            {isLogin ? 'Karibu tena FundSeed — Pata nafasi za ufadhili.' : 'Ingiza Email na Namba ya Simu kuanza safari yako.'}
          </p>
        </div>

        {/* 1. Google One-Click Login Button */}
        <div className="mb-5">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3.5 border border-stone-200 text-stone-700 bg-white hover:bg-stone-50 font-bold text-xs rounded-2xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Chrome className="h-4 w-4 text-emerald-600 animate-spin-slow" />
            <span>{isLogin ? 'Ingia kwa Google (Msekunde 2)' : 'Jisajili kwa Google (Msekunde 2)'}</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200/80"></div>
          </div>
          <span className="relative bg-white px-3 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">au tumia fomu</span>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-5 p-3.5 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3"
          >
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 leading-tight font-medium">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Barua Pepe</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300" />
              <input 
                type="email" 
                required
                placeholder="mfano@gmail.com" 
                className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs text-stone-900 placeholder:text-stone-300 font-medium" 
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
              />
            </div>
          </div>

          {/* Progressive Profiling: Phone Field Only Shown during Sign Up */}
          {!isLogin && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-1.5"
            >
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Namba ya Simu</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300" />
                <input 
                  type="tel" 
                  required
                  placeholder="07XXXXXXXX au 06XXXXXXXX" 
                  className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs text-stone-900 placeholder:text-stone-300 font-medium" 
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setError('');
                  }}
                />
              </div>
            </motion.div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Neno la Siri</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300" />
              <input 
                type="password" 
                required
                placeholder="******" 
                className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs text-stone-900 placeholder:text-stone-300 font-medium" 
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-md transition-all active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            {isLogin ? 'Ingia Sasa' : 'Kamilisha Usajili'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-stone-100 text-center">
          <p className="text-stone-500 text-xs font-medium">
            {isLogin ? 'Huna akaunti bado?' : 'Tayari una akaunti?'}
            <button 
              className="ml-1.5 font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer" 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              {isLogin ? 'Jisajili Hapa' : 'Ingia Hapa'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
