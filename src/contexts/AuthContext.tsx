import React, { createContext, useContext, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, signInAnonymouslyHelper, isAnonymousUser } from '../lib/firebase';

interface AuthContextType {
  user: User | null | undefined;
  loading: boolean;
  error: Error | undefined;
  signInAnonymously: () => Promise<User | null>;
  isAnonymous: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // If Firebase is not configured, provide default values
  const [user, loading, error] = auth 
    ? useAuthState(auth)
    : [null, false, undefined];

  const signInAnonymously = async (): Promise<User | null> => {
    if (!auth) {
      console.warn('Firebase auth not configured');
      return null;
    }
    
    try {
      const anonymousUser = await signInAnonymouslyHelper();
      return anonymousUser;
    } catch (error) {
      console.error('Anonymous sign in failed:', error);
      throw error;
    }
  };

  const isAnonymous = isAnonymousUser(user);

  return (
    <AuthContext.Provider value={{ user, loading, error, signInAnonymously, isAnonymous }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};