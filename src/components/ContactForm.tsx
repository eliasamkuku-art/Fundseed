import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ContactForm({ onClose }: { onClose: () => void }) {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'messages'), {
        message,
        createdAt: serverTimestamp(),
      });
      setSent(true);
      setTimeout(onClose, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg">
        <h2 className="mb-4 text-xl font-bold">Wasiliana na Admin</h2>
        {sent ? (
          <p>Ujumbe umetumwa vyema!</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <textarea 
              className="w-full p-2 mb-4 border rounded" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Andika ujumbe wako hapa..."
            />
            <button type="submit" className="w-full p-2 bg-emerald-600 text-white rounded">
              Tuma
            </button>
          </form>
        )}
        <button className="mt-2 text-sm text-stone-600" onClick={onClose}>Funga</button>
      </div>
    </div>
  );
}
