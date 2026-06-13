/**
 * Burnout — Seed Script
 * Creates demo users, posts, vehicles, meets, and a group chat in Firestore.
 *
 * Setup:
 *   1. npm install firebase (already in package.json)
 *   2. Edit FIREBASE_CONFIG below with your real project credentials
 *   3. node scripts/seed.js
 *
 * Demo accounts created:
 *   demo@burnout.app   / demo1234  (main test account)
 *   alex@burnout.app   / demo1234
 *   jordan@burnout.app / demo1234
 */

const { initializeApp } = require('firebase/app');
const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} = require('firebase/auth');
const {
  getFirestore, doc, setDoc, addDoc, collection, serverTimestamp, Timestamp,
} = require('firebase/firestore');

// ── PASTE YOUR FIREBASE CONFIG HERE ─────────────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAV3cM8B1B1X0RlIF3FAh7xcwXoiolvbr0",
  authDomain: "burnout-57c14.firebaseapp.com",
  projectId: "burnout-57c14",
  storageBucket: "burnout-57c14.firebasestorage.app",
  messagingSenderId: "257981638486",
  appId: "1:257981638486:web:49162b0b5b77a833dc58f7",
};
// ─────────────────────────────────────────────────────────────────────────────

const app = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);
const db = getFirestore(app);

const DEMO_USERS = [
  { email: 'demo@burnout.app',   password: 'demo1234', username: 'burnout_demo',   bio: 'Built, not bought. 🔥' },
  { email: 'alex@burnout.app',   password: 'demo1234', username: 'alex_rwd',       bio: 'E46 M3 | Track days only' },
  { email: 'jordan@burnout.app', password: 'demo1234', username: 'jordan_jdm',     bio: 'Slammed & stanced 🇯🇵' },
];

async function getOrCreateUser({ email, password, username, bio }) {
  let uid;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    uid = cred.user.uid;
    console.log(`  ✓ Created ${email}`);
  } catch (e) {
    if (e.code === 'auth/email-already-in-use') {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      uid = cred.user.uid;
      console.log(`  ~ Existing ${email}`);
    } else throw e;
  }
  await setDoc(doc(db, 'users', uid), {
    username, bio, profilePhoto: '', vehicles: [], createdAt: serverTimestamp(),
  }, { merge: true });
  return uid;
}

async function seed() {
  console.log('\n🔥 Burnout seed script starting...\n');

  // 1. Users
  console.log('Creating users...');
  const [demoUid, alexUid, jordanUid] = await Promise.all(DEMO_USERS.map(getOrCreateUser));

  // 2. Vehicles
  console.log('\nCreating vehicles...');
  const v1 = await addDoc(collection(db, 'vehicles'), {
    ownerId: demoUid,
    make: 'Nissan', model: '370Z', year: 2019, color: 'Midnight Purple',
    mods: [
      { id: 'm1', name: 'Stillen intake', date: '2024-03-10', cost: 450 },
      { id: 'm2', name: 'Berk exhaust', date: '2024-06-01', cost: 1200 },
    ],
    maintenanceLogs: [
      { id: 'ml1', type: 'Oil Change', date: '2025-01-15', mileage: 42000, notes: 'Motul 5W-40 full synthetic' },
    ],
    photos: [], createdAt: serverTimestamp(),
  });
  const v2 = await addDoc(collection(db, 'vehicles'), {
    ownerId: alexUid,
    make: 'BMW', model: 'E46 M3', year: 2003, color: 'Carbon Black',
    mods: [
      { id: 'm1', name: 'Dinan cold air intake', date: '2023-09-01', cost: 380 },
      { id: 'm2', name: 'Bilstein PSS10 coilovers', date: '2023-11-20', cost: 1850 },
    ],
    maintenanceLogs: [], photos: [], createdAt: serverTimestamp(),
  });
  const v3 = await addDoc(collection(db, 'vehicles'), {
    ownerId: jordanUid,
    make: 'Honda', model: 'Civic Type R', year: 2021, color: 'Sonic Grey Pearl',
    mods: [
      { id: 'm1', name: 'Injen cold air intake', date: '2025-02-14', cost: 320 },
    ],
    maintenanceLogs: [], photos: [], createdAt: serverTimestamp(),
  });
  // Link vehicles to user docs
  await setDoc(doc(db, 'users', demoUid), { vehicles: [v1.id] }, { merge: true });
  await setDoc(doc(db, 'users', alexUid), { vehicles: [v2.id] }, { merge: true });
  await setDoc(doc(db, 'users', jordanUid), { vehicles: [v3.id] }, { merge: true });
  console.log('  ✓ 3 vehicles created');

  // 3. Posts
  console.log('\nCreating posts...');
  await addDoc(collection(db, 'posts'), {
    authorId: demoUid, authorUsername: 'burnout_demo', authorPhoto: '',
    content: 'Just finished installing the Berk exhaust. This thing sounds MEAN at 7000rpm 🔊🔥',
    photos: [], likes: [alexUid, jordanUid],
    comments: [
      { id: 'c1', authorId: alexUid, authorUsername: 'alex_rwd', text: 'That exhaust is 🔥🔥', createdAt: Timestamp.now() },
    ],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)),
  });
  await addDoc(collection(db, 'posts'), {
    authorId: alexUid, authorUsername: 'alex_rwd', authorPhoto: '',
    content: 'Track day at Willow Springs. E46 M3 putting down consistent 1:32s. Nothing beats analog steering.',
    photos: [], likes: [demoUid],
    comments: [],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 5 * 60 * 60 * 1000)),
  });
  await addDoc(collection(db, 'posts'), {
    authorId: jordanUid, authorUsername: 'jordan_jdm', authorPhoto: '',
    content: 'New intake on the Type R. Induction sound is insane through the Honda short shifter. Worth every penny.',
    photos: [], likes: [demoUid, alexUid],
    comments: [
      { id: 'c1', authorId: demoUid, authorUsername: 'burnout_demo', text: 'How\'s the fitment?', createdAt: Timestamp.now() },
      { id: 'c2', authorId: jordanUid, authorUsername: 'jordan_jdm', text: 'Perfect drop-in, 30 min install', createdAt: Timestamp.now() },
    ],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)),
  });
  console.log('  ✓ 3 posts created');

  // 4. Meets
  console.log('\nCreating meets...');
  await addDoc(collection(db, 'meets'), {
    title: 'Cars & Coffee — Pasadena',
    description: 'Every Saturday morning. All makes welcome. Coffee, cars, good vibes.',
    location: { lat: 34.1478, lng: -118.1445, address: 'Westfield Santa Anita, Arcadia CA' },
    date: 'Every Saturday 7–10am',
    hostId: demoUid,
    attendees: [demoUid, alexUid],
    isActive: true,
    createdAt: serverTimestamp(),
  });
  await addDoc(collection(db, 'meets'), {
    title: 'Midnight Cruise — PCH',
    description: 'Convoy from Santa Monica pier north on PCH. 10pm sharp.',
    location: { lat: 34.0101, lng: -118.4965, address: 'Santa Monica Pier, CA' },
    date: 'Sat Jun 21 10:00pm',
    hostId: jordanUid,
    attendees: [jordanUid],
    isActive: true,
    createdAt: serverTimestamp(),
  });
  console.log('  ✓ 2 meets created');

  // 5. Group chat
  console.log('\nCreating group chat...');
  const chatRef = await addDoc(collection(db, 'chats'), {
    name: 'SoCal Car Crew 🏁',
    members: [demoUid, alexUid, jordanUid],
    isGroup: true,
    lastMessage: 'Anyone down for the PCH cruise Saturday?',
    lastMessageTime: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
  const msgs = [
    { senderId: alexUid, senderUsername: 'alex_rwd', text: 'Track day at Willow was 🔥 who\'s in next time?' },
    { senderId: demoUid, senderUsername: 'burnout_demo', text: 'I\'m in. Need to sort my brakes first lol' },
    { senderId: jordanUid, senderUsername: 'jordan_jdm', text: 'Anyone down for the PCH cruise Saturday?' },
  ];
  for (const msg of msgs) {
    await addDoc(collection(db, 'chats', chatRef.id, 'messages'), {
      ...msg, chatId: chatRef.id, createdAt: serverTimestamp(),
    });
  }
  console.log('  ✓ Group chat + 3 messages created');

  console.log('\n✅ Seed complete!\n');
  console.log('Demo login: demo@burnout.app / demo1234');
  console.log('Other accounts: alex@burnout.app, jordan@burnout.app (same password)\n');
  process.exit(0);
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
