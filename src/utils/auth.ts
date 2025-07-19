import { signInWithPopup, signOut, signInAnonymously } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return { user: null, error };
  }
};

export const signInAsGuest = async () => {
  try {
    const result = await signInAnonymously(auth);
    return { user: result.user, error: null };
  } catch (error) {
    console.error('Error signing in anonymously:', error);
    return { user: null, error };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error };
  }
};