import { initializeApp, getApps, getApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import type { Database } from 'firebase/database';
import type { FirebaseConfigParams } from '../types';

const STORAGE_KEY_FIREBASE = 'sierrabim_firebase_config';
const STORAGE_KEY_GMAPS = 'sierrabim_gmaps_key';

// Default config from Vite environment variables or localStorage
export const getStoredFirebaseConfig = (): FirebaseConfigParams => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_FIREBASE);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Error reading stored Firebase config', e);
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || ''
  };
};

export const getStoredGoogleMapsApiKey = (): string => {
  return localStorage.getItem(STORAGE_KEY_GMAPS) || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
};

export const saveAppSettings = (firebaseConfig: FirebaseConfigParams, gmapsApiKey: string) => {
  localStorage.setItem(STORAGE_KEY_FIREBASE, JSON.stringify(firebaseConfig));
  localStorage.setItem(STORAGE_KEY_GMAPS, gmapsApiKey);
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let rtdb: Database | null = null;

export const initFirebase = (config?: FirebaseConfigParams): { 
  isReady: boolean; 
  auth: Auth | null; 
  db: Firestore | null;
  rtdb: Database | null;
} => {
  const currentConfig = config || getStoredFirebaseConfig();

  const isValid = Boolean(
    currentConfig.apiKey &&
    currentConfig.projectId &&
    !currentConfig.apiKey.includes('YOUR_') &&
    !currentConfig.projectId.includes('YOUR_')
  );

  if (!isValid) {
    return { isReady: false, auth: null, db: null, rtdb: null };
  }

  try {
    if (!getApps().length) {
      app = initializeApp(currentConfig);
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
    try {
      rtdb = getDatabase(app);
    } catch {
      rtdb = null;
    }
    return { isReady: true, auth, db, rtdb };
  } catch (err) {
    console.error('Failed to initialize Firebase with provided credentials:', err);
    return { isReady: false, auth: null, db: null, rtdb: null };
  }
};

const initialFirebase = initFirebase();
export const firebaseAuth = initialFirebase.auth;
export const firestoreDb = initialFirebase.db;
export const firebaseRtdb = initialFirebase.rtdb;
export const isFirebaseConfigured = initialFirebase.isReady;
