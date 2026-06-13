// Replace with your Firebase project config from console.firebase.google.com
// Steps:
// 1. Go to https://console.firebase.google.com
// 2. Create or select a project
// 3. Add a Web App under Project Settings > General
// 4. Copy the firebaseConfig object and paste it below
// 5. Enable Email/Password auth under Authentication > Sign-in method
// 6. Create Firestore database under Firestore Database
// 7. Enable Storage under Storage

import { Platform } from 'react-native';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, browserLocalPersistence, indexedDBLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAV3cM8B1B1X0RlIF3FAh7xcwXoiolvbr0",
  authDomain: "burnout-57c14.firebaseapp.com",
  projectId: "burnout-57c14",
  storageBucket: "burnout-57c14.firebasestorage.app",
  messagingSenderId: "257981638486",
  appId: "1:257981638486:web:49162b0b5b77a833dc58f7",
  measurementId: "G-85V6N2KEW4"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

function buildAuth() {
  if (getApps().length > 1) return getAuth(app);
  if (Platform.OS === 'web') {
    // Web: use IndexedDB persistence (survives page refresh)
    return initializeAuth(app, { persistence: [indexedDBLocalPersistence, browserLocalPersistence] });
  }
  // Native: use AsyncStorage persistence
  const { getReactNativePersistence } = require('firebase/auth');
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
}

let _auth: ReturnType<typeof getAuth>;
try {
  _auth = buildAuth();
} catch {
  _auth = getAuth(app);
}

export const auth = _auth;
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
