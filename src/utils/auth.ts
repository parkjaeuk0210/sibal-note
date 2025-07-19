import { signInWithPopup, signOut, signInAnonymously } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

export const signInWithGoogle = async () => {
  if (!auth || !googleProvider) {
    console.warn('Firebase auth not configured');
    return { user: null, error: new Error('Firebase not configured') };
  }
  
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return { user: null, error };
  }
};

export const signInAsGuest = async () => {
  if (!auth) {
    console.warn('Firebase auth not configured');
    return { user: null, error: new Error('Firebase not configured') };
  }
  
  try {
    const result = await signInAnonymously(auth);
    return { user: result.user, error: null };
  } catch (error) {
    console.error('Error signing in anonymously:', error);
    return { user: null, error };
  }
};

export const logout = async () => {
  if (!auth) {
    console.warn('Firebase auth not configured');
    return { error: new Error('Firebase not configured') };
  }
  
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error };
  }
};