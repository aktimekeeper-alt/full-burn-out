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
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
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
