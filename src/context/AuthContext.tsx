import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // AUTH BYPASS — swap null for mock user during rough edits
  const BYPASS_AUTH = true;
  const MOCK_USER = BYPASS_AUTH ? { uid: 'demo-uid', email: 'demo@burnout.app', displayName: 'Demo' } as unknown as FirebaseUser : null;
  const MOCK_PROFILE: User = { id: 'demo-uid', username: 'burnout_demo', bio: 'Built not bought 🔥', profilePhoto: '', vehicles: [], createdAt: new Date() };

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(MOCK_USER);
  const [userProfile, setUserProfile] = useState<User | null>(BYPASS_AUTH ? MOCK_PROFILE : null);
  const [loading, setLoading] = useState(!BYPASS_AUTH);

  async function fetchProfile(uid: string) {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      const data = snap.data();
      setUserProfile({
        id: snap.id,
        username: data.username,
        bio: data.bio || '',
        profilePhoto: data.profilePhoto || '',
        vehicles: data.vehicles || [],
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signup(email: string, password: string, username: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', cred.user.uid), {
      username,
      bio: '',
      profilePhoto: '',
      vehicles: [],
      createdAt: serverTimestamp(),
    });
  }

  async function logout() {
    await signOut(auth);
  }

  async function refreshProfile() {
    if (currentUser) await fetchProfile(currentUser.uid);
  }

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, login, signup, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
