// Replace with your Firebase project config from console.firebase.google.com
// Steps:
// 1. Go to https://console.firebase.google.com
// 2. Create or select a project
// 3. Add a Web App under Project Settings > General
// 4. Copy the firebaseConfig object and paste it below
// 5. Enable Email/Password auth under Authentication > Sign-in method
// 6. Create Firestore database under Firestore Database
// 7. Enable Storage under Storage

import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAV3cM8B1B1X0RlIF3FAh7xcwXoiolvbr0",
  authDomain: "burnout-57c14.firebaseapp.com",
  projectId: "burnout-57c14",
  storageBucket: "burnout-57c14.firebasestorage.app",
  messagingSenderId: "257981638486",
  appId: "1:257981638486:web:49162b0b5b77a833dc58f7",
  measurementId: "G-85V6N2KEW4"
};

let app: ReturnType<typeof initializeApp>;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// AsyncStorage persistence keeps the user logged in across app restarts
let _auth: ReturnType<typeof initializeAuth>;
try {
  _auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
} catch {
  // Auth already initialized (e.g. hot reload) — reuse the existing instance
  const { getAuth } = require('firebase/auth');
  _auth = getAuth(app);
}

export const auth = _auth;
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
