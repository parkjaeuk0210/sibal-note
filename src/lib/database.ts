import { 
  ref, 
  set, 
  onValue, 
  off, 
  push, 
  remove, 
  update,
  DataSnapshot,
  serverTimestamp 
} from 'firebase/database';
import { database } from './firebase';
import { FirebaseNote, FirebaseImage, FirebaseFile } from '../types/firebase';

// Cache device ID in memory to avoid repeated localStorage access
let cachedDeviceId: string | null = null;

// Get device ID (stored in localStorage and cached in memory)
const getDeviceId = () => {
  // Return cached value if available
  if (cachedDeviceId) {
    return cachedDeviceId;
  }
  
  // Try to get from localStorage
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    // Use crypto-secure random generation for device ID
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const randomId = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    deviceId = `device_${Date.now()}_${randomId}`;
    localStorage.setItem('deviceId', deviceId);
  }
  
  // Cache the device ID
  cachedDeviceId = deviceId;
  return deviceId;
};

// Database paths
const getUserPath = (userId: string) => `users/${userId}`;
const getNotesPath = (userId: string) => `${getUserPath(userId)}/notes`;
const getImagesPath = (userId: string) => `${getUserPath(userId)}/images`;
const getFilesPath = (userId: string) => `${getUserPath(userId)}/files`;
const getSettingsPath = (userId: string) => `${getUserPath(userId)}/settings`;

// Notes operations
export const saveNote = async (userId: string, note: Omit<FirebaseNote, 'id' | 'userId' | 'deviceId'>) => {
  const notesRef = ref(database, getNotesPath(userId));
  const newNoteRef = push(notesRef);
  const noteData = {
    ...note,
    id: newNoteRef.key!,
    userId,
    deviceId: getDeviceId(),
  };
  await set(newNoteRef, noteData);
  return newNoteRef.key;
};

export const updateNote = async (userId: string, noteId: string, updates: Partial<Omit<FirebaseNote, 'id' | 'userId' | 'deviceId'>>) => {
  const noteRef = ref(database, `${getNotesPath(userId)}/${noteId}`);
  await update(noteRef, {
    ...updates,
    updatedAt: Date.now(),
    // Don't update deviceId on every update to avoid triggering sync loops
  });
};

export const deleteNote = async (userId: string, noteId: string) => {
  const noteRef = ref(database, `${getNotesPath(userId)}/${noteId}`);
  await remove(noteRef);
};

// Images operations
export const saveImage = async (userId: string, image: Omit<FirebaseImage, 'id' | 'userId' | 'deviceId'>) => {
  const imagesRef = ref(database, getImagesPath(userId));
  const newImageRef = push(imagesRef);
  const imageData = {
    ...image,
    id: newImageRef.key!,
    userId,
    deviceId: getDeviceId(),
  };
  await set(newImageRef, imageData);
  return newImageRef.key;
};

export const updateImage = async (userId: string, imageId: string, updates: Partial<Omit<FirebaseImage, 'id' | 'userId' | 'deviceId'>>) => {
  const imageRef = ref(database, `${getImagesPath(userId)}/${imageId}`);
  await update(imageRef, {
    ...updates,
    // Don't update deviceId on every update to avoid triggering sync loops
  });
};

export const deleteImage = async (userId: string, imageId: string) => {
  const imageRef = ref(database, `${getImagesPath(userId)}/${imageId}`);
  await remove(imageRef);
};

// Files operations
export const saveFile = async (userId: string, file: Omit<FirebaseFile, 'id' | 'userId' | 'deviceId'>) => {
  const filesRef = ref(database, getFilesPath(userId));
  const newFileRef = push(filesRef);
  const fileData = {
    ...file,
    id: newFileRef.key!,
    userId,
    deviceId: getDeviceId(),
  };
  await set(newFileRef, fileData);
  return newFileRef.key;
};

export const updateFile = async (userId: string, fileId: string, updates: Partial<Omit<FirebaseFile, 'id' | 'userId' | 'deviceId'>>) => {
  const fileRef = ref(database, `${getFilesPath(userId)}/${fileId}`);
  await update(fileRef, {
    ...updates,
    // Don't update deviceId on every update to avoid triggering sync loops
  });
};

export const deleteFile = async (userId: string, fileId: string) => {
  const fileRef = ref(database, `${getFilesPath(userId)}/${fileId}`);
  await remove(fileRef);
};

// Settings operations
export const saveSettings = async (userId: string, settings: any) => {
  const settingsRef = ref(database, getSettingsPath(userId));
  await set(settingsRef, {
    ...settings,
    lastSyncTime: serverTimestamp(),
  });
};

// Subscribe to changes
export const subscribeToNotes = (
  userId: string, 
  callback: (notes: Record<string, FirebaseNote>) => void
) => {
  const notesRef = ref(database, getNotesPath(userId));
  const unsubscribe = onValue(notesRef, (snapshot: DataSnapshot) => {
    const data = snapshot.val() || {};
    callback(data);
  });
  
  return () => off(notesRef, 'value', unsubscribe);
};

export const subscribeToImages = (
  userId: string, 
  callback: (images: Record<string, FirebaseImage>) => void
) => {
  const imagesRef = ref(database, getImagesPath(userId));
  const unsubscribe = onValue(imagesRef, (snapshot: DataSnapshot) => {
    const data = snapshot.val() || {};
    callback(data);
  });
  
  return () => off(imagesRef, 'value', unsubscribe);
};

export const subscribeToFiles = (
  userId: string, 
  callback: (files: Record<string, FirebaseFile>) => void
) => {
  const filesRef = ref(database, getFilesPath(userId));
  const unsubscribe = onValue(filesRef, (snapshot: DataSnapshot) => {
    const data = snapshot.val() || {};
    callback(data);
  });
  
  return () => off(filesRef, 'value', unsubscribe);
};

export const subscribeToSettings = (
  userId: string, 
  callback: (settings: any) => void
) => {
  const settingsRef = ref(database, getSettingsPath(userId));
  const unsubscribe = onValue(settingsRef, (snapshot: DataSnapshot) => {
    const data = snapshot.val() || {};
    callback(data);
  });
  
  return () => off(settingsRef, 'value', unsubscribe);
};