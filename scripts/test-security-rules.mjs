/**
 * Checks the deployed firestore.rules against the live project, using the demo accounts
 * created by seed-demo-data.mjs. Each check signs in as a real account and attempts an
 * action; the result is compared with what the rules should allow.
 *
 * Nothing is left behind: blocked writes never happen, and the one allowed write
 * (a favourite) is deleted again straight away.
 *
 * Usage (from the project root): node scripts/test-security-rules.mjs
 * Optional: SEED_PASSWORD=... if the demo accounts use a different password.
 */
import { readFileSync } from 'node:fs';

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

function loadDotEnv() {
  const values = {};
  for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match) values[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
  return values;
}

const env = loadDotEnv();
const PASSWORD = process.env.SEED_PASSWORD ?? 'WantokDemo2026';

const app = initializeApp({
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: env.EXPO_PUBLIC_FIREBASE_APP_ID,
});
const auth = getAuth(app);
const db = getFirestore(app);

async function as(email) {
  await signOut(auth);
  const { user } = await signInWithEmailAndPassword(auth, email, PASSWORD);
  return user.uid;
}

// Look up the demo UIDs and one listing per provider (read as a signed-in customer).
const anna = await as('customer.anna@example.com');
const david = await as('customer.david@example.com');
const kila = await as('provider.kila@example.com');
const grace = await as('provider.grace@example.com');

async function firstListingOf(providerId) {
  const snapshot = await getDocs(
    query(
      collection(db, 'services'),
      where('providerId', '==', providerId),
      where('isActive', '==', true),
      limit(1),
    ),
  );
  return snapshot.docs[0];
}

await as('customer.anna@example.com');
const kilaListing = await firstListingOf(kila);
const graceListing = await firstListingOf(grace);

const results = [];

/** Runs `action` and records whether Firebase allowed it, compared with `expected`. */
async function check(description, expected, action) {
  let outcome;
  try {
    await action();
    outcome = 'allowed';
  } catch (error) {
    outcome = error.code === 'permission-denied' ? 'denied' : `error (${error.code})`;
  }
  const pass = outcome === expected;
  results.push({ description, expected, outcome, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${description}: expected ${expected}, got ${outcome}`);
}

// ---------- Customer (Anna) ----------
await as('customer.anna@example.com');
await check("Customer edits a provider's listing", 'denied', () =>
  updateDoc(kilaListing.ref, { title: 'Hacked title', updatedAt: serverTimestamp() }),
);
await check("Customer deletes a provider's listing", 'denied', () => deleteDoc(kilaListing.ref));
await check('Customer creates a listing', 'denied', () =>
  addDoc(collection(db, 'services'), {
    ...kilaListing.data(),
    providerId: anna,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }),
);
await check('Customer changes own role to provider', 'denied', () =>
  updateDoc(doc(db, 'users', anna), { role: 'provider', updatedAt: serverTimestamp() }),
);
await check("Customer reads another customer's profile", 'denied', () =>
  getDoc(doc(db, 'users', david)),
);
await check("Customer edits a provider's profile", 'denied', () =>
  updateDoc(doc(db, 'users', kila), { fullName: 'Changed', updatedAt: serverTimestamp() }),
);
await check('Customer posts a review under another name', 'denied', () =>
  setDoc(doc(db, 'reviews', `${anna}_${grace}`), {
    customerId: anna,
    customerName: 'Someone Else',
    providerId: grace,
    rating: 5,
    comment: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }),
);
await check('Customer reads a provider profile (marketplace)', 'allowed', () =>
  getDoc(doc(db, 'users', kila)).then((snapshot) => {
    if (!snapshot.exists()) throw new Error('missing');
  }),
);
const favouriteRef = doc(db, 'favourites', `${anna}_${grace}`);
const hadFavourite = await getDoc(favouriteRef)
  .then((snapshot) => snapshot.exists())
  .catch(() => false);
if (!hadFavourite) {
  await check('Customer saves a provider as favourite', 'allowed', () =>
    setDoc(favouriteRef, { customerId: anna, providerId: grace, createdAt: serverTimestamp() }),
  );
  await deleteDoc(favouriteRef).catch(() => undefined);
}

// ---------- Provider (Kila) ----------
await as('provider.kila@example.com');
await check("Provider edits another provider's listing", 'denied', () =>
  updateDoc(graceListing.ref, { title: 'Hacked title', updatedAt: serverTimestamp() }),
);
await check('Provider creates a listing owned by someone else', 'denied', () =>
  addDoc(collection(db, 'services'), {
    ...kilaListing.data(),
    providerId: grace,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }),
);
await check('Provider reviews another provider', 'denied', () =>
  setDoc(doc(db, 'reviews', `${kila}_${grace}`), {
    customerId: kila,
    customerName: 'Kila Wari',
    providerId: grace,
    rating: 1,
    comment: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }),
);
await check('Provider edits own listing', 'allowed', () =>
  updateDoc(kilaListing.ref, {
    title: kilaListing.data().title,
    updatedAt: serverTimestamp(),
  }),
);

// ---------- Signed out ----------
await signOut(auth);
await check('Signed-out user reads listings', 'denied', () =>
  getDocs(query(collection(db, 'services'), where('isActive', '==', true), limit(1))),
);

const passed = results.filter((result) => result.pass).length;
console.log(`\n${passed} of ${results.length} checks behaved as expected.`);
process.exit(passed === results.length ? 0 : 1);
