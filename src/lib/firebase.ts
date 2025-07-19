import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Check if Firebase config is available
const hasFirebaseConfig = import.meta.env.VITE_FIREBASE_API_KEY && 
                         import.meta.env.VITE_FIREBASE_AUTH_DOMAIN && 
                         import.meta.env.VITE_FIREBASE_PROJECT_ID;

let app: any = null;
let auth: any = null;
let googleProvider: any = null;
let database: any = null;
let storage: any = null;

if (hasFirebaseConfig) {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  };

  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  database = getDatabase(app);
  storage = getStorage(app);
} else {
  console.warn('Firebase configuration not found. Running in local-only mode.');
}

// Export Firebase services
export { auth, googleProvider, database, storage, app };

// Enable offline persistence for Realtime Database
if (typeof window !== 'undefined' && database) {
  import('firebase/database').then(({ goOffline, goOnline }) => {
    // Handle online/offline state
    window.addEventListener('online', () => goOnline(database));
    window.addEventListener('offline', () => goOffline(database));
  });
}

export default app;