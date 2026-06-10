
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const logError = async (error: string, context: string, userId?: string) => {
  try {
    await addDoc(collection(db, 'logs'), {
      error,
      context,
      userId: userId || 'anonymous',
      timestamp: serverTimestamp(),
    });
  } catch (e) {
    console.error("Failed to log error to Firestore:", e);
  }
};
