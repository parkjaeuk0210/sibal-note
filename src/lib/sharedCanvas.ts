import { 
  ref, 
  set, 
  onValue, 
  off, 
  push, 
  remove, 
  update,
  DataSnapshot,
  serverTimestamp,
  onDisconnect
} from 'firebase/database';
import { database } from './firebase';
import { 
  SharedCanvas, 
  ShareToken, 
  CanvasParticipant, 
  ParticipantRole,
  PresenceData,
  ShareInvite
} from '../types/sharing';
import { FirebaseNote, FirebaseImage, FirebaseFile } from '../types/firebase';

// Generate unique token
const generateShareToken = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Generate unique color for participant
const generateParticipantColor = (index: number) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
    '#98D8C8', '#FDCB6E', '#6C5CE7', '#A29BFE'
  ];
  return colors[index % colors.length];
};

// Database paths
const getSharedCanvasPath = (canvasId: string) => `shared_canvases/${canvasId}`;
const getSharedNotesPath = (canvasId: string) => `${getSharedCanvasPath(canvasId)}/notes`;
const getSharedImagesPath = (canvasId: string) => `${getSharedCanvasPath(canvasId)}/images`;
const getSharedFilesPath = (canvasId: string) => `${getSharedCanvasPath(canvasId)}/files`;
const getParticipantsPath = (canvasId: string) => `${getSharedCanvasPath(canvasId)}/participants`;
const getPresencePath = (canvasId: string) => `${getSharedCanvasPath(canvasId)}/presence`;
const getShareTokenPath = (token: string) => `share_tokens/${token}`;

// Create a new shared canvas
export const createSharedCanvas = async (
  userId: string, 
  userEmail: string,
  canvasName: string,
  currentNotes?: FirebaseNote[],
  currentImages?: FirebaseImage[],
  currentFiles?: FirebaseFile[]
) => {
  const canvasRef = ref(database, 'shared_canvases');
  const newCanvasRef = push(canvasRef);
  const canvasId = newCanvasRef.key!;

  const sharedCanvas: SharedCanvas = {
    id: canvasId,
    name: canvasName,
    owner: userId,
    ownerEmail: userEmail,
    participants: {
      [userId]: {
        userId,
        email: userEmail,
        role: 'editor' as ParticipantRole,
        joinedAt: Date.now(),
        lastActiveAt: Date.now(),
        isOnline: true,
        color: generateParticipantColor(0)
      }
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isPublic: false
  };

  await set(newCanvasRef, sharedCanvas);

  // Copy existing notes, images, and files to shared canvas
  if (currentNotes && currentNotes.length > 0) {
    const notesRef = ref(database, getSharedNotesPath(canvasId));
    const notesData: Record<string, FirebaseNote> = {};
    currentNotes.forEach(note => {
      notesData[note.id] = note;
    });
    await set(notesRef, notesData);
  }

  if (currentImages && currentImages.length > 0) {
    const imagesRef = ref(database, getSharedImagesPath(canvasId));
    const imagesData: Record<string, FirebaseImage> = {};
    currentImages.forEach(image => {
      imagesData[image.id] = image;
    });
    await set(imagesRef, imagesData);
  }

  if (currentFiles && currentFiles.length > 0) {
    const filesRef = ref(database, getSharedFilesPath(canvasId));
    const filesData: Record<string, FirebaseFile> = {};
    currentFiles.forEach(file => {
      filesData[file.id] = file;
    });
    await set(filesRef, filesData);
  }

  return canvasId;
};

// Generate share link/token
export const generateShareLink = async (
  canvasId: string, 
  userId: string,
  role: ParticipantRole = 'viewer',
  expiresInHours?: number
) => {
  const token = generateShareToken();
  const shareToken: ShareToken = {
    token,
    canvasId,
    createdBy: userId,
    createdAt: Date.now(),
    expiresAt: expiresInHours ? Date.now() + (expiresInHours * 60 * 60 * 1000) : undefined,
    role,
    used: false
  };

  const tokenRef = ref(database, getShareTokenPath(token));
  await set(tokenRef, shareToken);

  return token;
};

// Join shared canvas using token
export const joinSharedCanvas = async (
  token: string,
  userId: string,
  userEmail: string,
  displayName?: string,
  photoURL?: string
) => {
  const tokenRef = ref(database, getShareTokenPath(token));
  const tokenSnapshot = await new Promise<DataSnapshot>((resolve) => {
    onValue(tokenRef, resolve, { onlyOnce: true });
  });

  const tokenData = tokenSnapshot.val() as ShareToken;
  
  if (!tokenData) {
    throw new Error('Invalid share token');
  }

  if (tokenData.used) {
    throw new Error('Share token has already been used');
  }

  if (tokenData.expiresAt && tokenData.expiresAt < Date.now()) {
    throw new Error('Share token has expired');
  }

  // Get current participants count to assign color
  const participantsRef = ref(database, getParticipantsPath(tokenData.canvasId));
  const participantsSnapshot = await new Promise<DataSnapshot>((resolve) => {
    onValue(participantsRef, resolve, { onlyOnce: true });
  });
  
  const currentParticipants = participantsSnapshot.val() || {};
  const participantCount = Object.keys(currentParticipants).length;

  // Add user as participant
  const participant: CanvasParticipant = {
    userId,
    email: userEmail,
    displayName,
    photoURL,
    role: tokenData.role,
    joinedAt: Date.now(),
    lastActiveAt: Date.now(),
    isOnline: true,
    color: generateParticipantColor(participantCount)
  };

  const participantRef = ref(database, `${getParticipantsPath(tokenData.canvasId)}/${userId}`);
  await set(participantRef, participant);

  // Mark token as used
  await update(tokenRef, {
    used: true,
    usedBy: userId,
    usedAt: Date.now()
  });

  return tokenData.canvasId;
};

// Update participant presence
export const updatePresence = async (
  canvasId: string,
  userId: string,
  presenceData: Partial<PresenceData>
) => {
  const presenceRef = ref(database, `${getPresencePath(canvasId)}/${userId}`);
  
  await update(presenceRef, {
    ...presenceData,
    lastActiveAt: serverTimestamp()
  });

  // Set up onDisconnect to mark user as offline
  onDisconnect(presenceRef).update({
    isOnline: false,
    lastActiveAt: serverTimestamp()
  });
};

// Remove participant from canvas
export const removeParticipant = async (
  canvasId: string,
  participantId: string,
  requesterId: string
) => {
  // Check if requester is owner
  const canvasRef = ref(database, getSharedCanvasPath(canvasId));
  const canvasSnapshot = await new Promise<DataSnapshot>((resolve) => {
    onValue(canvasRef, resolve, { onlyOnce: true });
  });

  const canvasData = canvasSnapshot.val() as SharedCanvas;
  
  if (canvasData.owner !== requesterId) {
    throw new Error('Only the canvas owner can remove participants');
  }

  // Remove participant
  const participantRef = ref(database, `${getParticipantsPath(canvasId)}/${participantId}`);
  await remove(participantRef);

  // Remove presence data
  const presenceRef = ref(database, `${getPresencePath(canvasId)}/${participantId}`);
  await remove(presenceRef);
};

// Update participant role
export const updateParticipantRole = async (
  canvasId: string,
  participantId: string,
  newRole: ParticipantRole,
  requesterId: string
) => {
  // Check if requester is owner
  const canvasRef = ref(database, getSharedCanvasPath(canvasId));
  const canvasSnapshot = await new Promise<DataSnapshot>((resolve) => {
    onValue(canvasRef, resolve, { onlyOnce: true });
  });

  const canvasData = canvasSnapshot.val() as SharedCanvas;
  
  if (canvasData.owner !== requesterId) {
    throw new Error('Only the canvas owner can change participant roles');
  }

  const participantRef = ref(database, `${getParticipantsPath(canvasId)}/${participantId}`);
  await update(participantRef, { role: newRole });
};

// Subscribe to shared canvas changes
export const subscribeToSharedCanvas = (
  canvasId: string,
  callback: (canvas: SharedCanvas | null) => void
) => {
  const canvasRef = ref(database, getSharedCanvasPath(canvasId));
  const unsubscribe = onValue(canvasRef, (snapshot: DataSnapshot) => {
    callback(snapshot.val());
  });
  
  return () => off(canvasRef, 'value', unsubscribe);
};

// Subscribe to shared notes
export const subscribeToSharedNotes = (
  canvasId: string,
  callback: (notes: Record<string, FirebaseNote>) => void
) => {
  const notesRef = ref(database, getSharedNotesPath(canvasId));
  const unsubscribe = onValue(notesRef, (snapshot: DataSnapshot) => {
    const data = snapshot.val() || {};
    callback(data);
  });
  
  return () => off(notesRef, 'value', unsubscribe);
};

// Subscribe to shared images
export const subscribeToSharedImages = (
  canvasId: string,
  callback: (images: Record<string, FirebaseImage>) => void
) => {
  const imagesRef = ref(database, getSharedImagesPath(canvasId));
  const unsubscribe = onValue(imagesRef, (snapshot: DataSnapshot) => {
    const data = snapshot.val() || {};
    callback(data);
  });
  
  return () => off(imagesRef, 'value', unsubscribe);
};

// Subscribe to shared files
export const subscribeToSharedFiles = (
  canvasId: string,
  callback: (files: Record<string, FirebaseFile>) => void
) => {
  const filesRef = ref(database, getSharedFilesPath(canvasId));
  const unsubscribe = onValue(filesRef, (snapshot: DataSnapshot) => {
    const data = snapshot.val() || {};
    callback(data);
  });
  
  return () => off(filesRef, 'value', unsubscribe);
};

// Subscribe to presence updates
export const subscribeToPresence = (
  canvasId: string,
  callback: (presence: Record<string, PresenceData>) => void
) => {
  const presenceRef = ref(database, getPresencePath(canvasId));
  const unsubscribe = onValue(presenceRef, (snapshot: DataSnapshot) => {
    const data = snapshot.val() || {};
    callback(data);
  });
  
  return () => off(presenceRef, 'value', unsubscribe);
};

// CRUD operations for shared canvas items
export const saveSharedNote = async (
  canvasId: string,
  note: Omit<FirebaseNote, 'id' | 'userId' | 'deviceId'>,
  userId: string
) => {
  const notesRef = ref(database, getSharedNotesPath(canvasId));
  const newNoteRef = push(notesRef);
  const noteData = {
    ...note,
    id: newNoteRef.key!,
    userId,
    deviceId: 'shared',
  };
  await set(newNoteRef, noteData);
  return newNoteRef.key;
};

export const updateSharedNote = async (
  canvasId: string,
  noteId: string,
  updates: Partial<Omit<FirebaseNote, 'id' | 'userId' | 'deviceId'>>
) => {
  const noteRef = ref(database, `${getSharedNotesPath(canvasId)}/${noteId}`);
  await update(noteRef, {
    ...updates,
    updatedAt: Date.now(),
  });
};

export const deleteSharedNote = async (canvasId: string, noteId: string) => {
  const noteRef = ref(database, `${getSharedNotesPath(canvasId)}/${noteId}`);
  await remove(noteRef);
};

// Similar functions for images and files
export const saveSharedImage = async (
  canvasId: string,
  image: Omit<FirebaseImage, 'id' | 'userId' | 'deviceId'>,
  userId: string
) => {
  const imagesRef = ref(database, getSharedImagesPath(canvasId));
  const newImageRef = push(imagesRef);
  const imageData = {
    ...image,
    id: newImageRef.key!,
    userId,
    deviceId: 'shared',
  };
  await set(newImageRef, imageData);
  return newImageRef.key;
};

export const updateSharedImage = async (
  canvasId: string,
  imageId: string,
  updates: Partial<Omit<FirebaseImage, 'id' | 'userId' | 'deviceId'>>
) => {
  const imageRef = ref(database, `${getSharedImagesPath(canvasId)}/${imageId}`);
  await update(imageRef, updates);
};

export const deleteSharedImage = async (canvasId: string, imageId: string) => {
  const imageRef = ref(database, `${getSharedImagesPath(canvasId)}/${imageId}`);
  await remove(imageRef);
};

export const saveSharedFile = async (
  canvasId: string,
  file: Omit<FirebaseFile, 'id' | 'userId' | 'deviceId'>,
  userId: string
) => {
  const filesRef = ref(database, getSharedFilesPath(canvasId));
  const newFileRef = push(filesRef);
  const fileData = {
    ...file,
    id: newFileRef.key!,
    userId,
    deviceId: 'shared',
  };
  await set(newFileRef, fileData);
  return newFileRef.key;
};

export const updateSharedFile = async (
  canvasId: string,
  fileId: string,
  updates: Partial<Omit<FirebaseFile, 'id' | 'userId' | 'deviceId'>>
) => {
  const fileRef = ref(database, `${getSharedFilesPath(canvasId)}/${fileId}`);
  await update(fileRef, updates);
};

export const deleteSharedFile = async (canvasId: string, fileId: string) => {
  const fileRef = ref(database, `${getSharedFilesPath(canvasId)}/${fileId}`);
  await remove(fileRef);
};