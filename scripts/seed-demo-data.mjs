/**
 * Seeds the live Firebase project with demo accounts, listings, reviews and favourites.
 *
 * It uses the normal client SDK, exactly like the app: each account registers with
 * email + password and then writes only what firestore.rules allow that user to write.
 * No admin credentials are needed, and the security rules are exercised along the way.
 *
 * Safe to run more than once: existing accounts are signed in, and listings, reviews and
 * favourites that already exist are skipped.
 *
 * Usage (from the project root):
 *   SEED_PHONE=71234567 node scripts/seed-demo-data.mjs
 * Optional: SEED_PASSWORD=... (default below). Firebase values are read from .env.
 */
import { readFileSync } from 'node:fs';

import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';

// ---------- Configuration ----------

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
const PHONE = (process.env.SEED_PHONE ?? '').replace(/\D/g, '').replace(/^675(?=\d{7,8}$)/, '');
if (!/^[0-9]{7,8}$/.test(PHONE)) {
  console.error('Set SEED_PHONE to a PNG number with 7 or 8 digits, e.g. SEED_PHONE=71234567');
  process.exit(1);
}

const app = initializeApp({
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.EXPO_PUBLIC_FIREBASE_APP_ID,
});
const auth = getAuth(app);
const db = getFirestore(app);

// ---------- Demo data ----------

// Real town coordinates; each person gets a small offset so pins do not overlap.
const TOWNS = {
  lae: { latitude: -6.7229, longitude: 147.0002 },
  portMoresby: { latitude: -9.4438, longitude: 147.1803 },
  goroka: { latitude: -6.0832, longitude: 145.3869 },
  mtHagen: { latitude: -5.8571, longitude: 144.2304 },
  madang: { latitude: -5.2246, longitude: 145.7866 },
  kokopo: { latitude: -4.3432, longitude: 152.2697 },
};

function near(town, dLat, dLon) {
  const base = TOWNS[town];
  return {
    latitude: Number((base.latitude + dLat).toFixed(5)),
    longitude: Number((base.longitude + dLon).toFixed(5)),
  };
}

const PROVIDERS = [
  {
    key: 'kila',
    fullName: 'Kila Wari',
    skillCategory: 'electrical',
    locationName: 'Eriku, Lae',
    coords: near('lae', 0.004, -0.006),
    bio: 'Licensed electrician with 9 years of experience in homes and small shops around Lae. House wiring, fault finding, solar setups and safety checks.',
    listings: [
      {
        title: 'House wiring and electrical repairs',
        category: 'electrical',
        price: 80,
        description:
          'New wiring, extra power points, lights and switch repairs, and fault finding when the power keeps tripping. I bring my own tools and test everything before I leave.',
      },
      {
        title: 'Small solar system installation',
        category: 'electrical',
        price: 450,
        description:
          'Supply and install small solar kits for lights and phone charging in homes and village houses. Includes panel mounting, battery and a short lesson on looking after it.',
      },
    ],
  },
  {
    key: 'grace',
    fullName: 'Grace Tamate',
    skillCategory: 'tailoring',
    locationName: 'Boroko, Port Moresby',
    coords: near('portMoresby', -0.012, 0.01),
    bio: 'Tailor and dressmaker. Meri blouses, school uniforms, church and wedding clothes, and quick alterations.',
    listings: [
      {
        title: 'Meri blouses and custom dresses',
        category: 'tailoring',
        price: 60,
        description:
          'Meri blouses, dresses and laplaps sewn to your measurements. Bring your own material or choose from mine. Group orders for churches and events welcome.',
      },
      {
        title: 'Clothing alterations and repairs',
        category: 'tailoring',
        price: 15,
        description:
          'Take in or let out clothes, shorten trousers, replace zips and buttons, and fix tears. Most small jobs ready within two days.',
      },
    ],
  },
  {
    key: 'john',
    fullName: 'John Kaupa',
    skillCategory: 'carpentry',
    locationName: 'Mt Hagen, Western Highlands',
    coords: near('mtHagen', 0.006, 0.004),
    bio: 'Carpenter and joiner. Furniture, cupboards, doors and small building jobs. Good quality timber and honest prices.',
    listings: [
      {
        title: 'Custom furniture and cupboards',
        category: 'carpentry',
        price: 300,
        description:
          'Beds, tables, kitchen cupboards and built-in wardrobes made to fit your space. Free measuring and quote in Mt Hagen town.',
      },
      {
        title: 'Door, window and floor repairs',
        category: 'carpentry',
        price: null,
        description:
          'Fix sticking doors, broken window frames, loose floorboards and termite damage. Price depends on the job, so call me for a quote.',
      },
    ],
  },
  {
    key: 'mary',
    fullName: 'Mary Sinai',
    skillCategory: 'tutoring',
    locationName: 'North Goroka, Goroka',
    coords: near('goroka', 0.005, -0.003),
    bio: 'Qualified secondary teacher offering after-school tutoring in maths and science for Grades 7 to 12.',
    listings: [
      {
        title: 'Maths and science tutoring (Grades 7-12)',
        category: 'tutoring',
        price: 30,
        description:
          'One-on-one or small group lessons in maths, physics and chemistry. Exam preparation for Grade 10 and 12. Lessons at my home or yours, after school and on Saturdays.',
      },
    ],
  },
  {
    key: 'peter',
    fullName: 'Peter Lalo',
    skillCategory: 'plumbing',
    locationName: 'Gerehu, Port Moresby',
    coords: near('portMoresby', 0.035, -0.02),
    bio: 'Plumber covering Gerehu, Waigani and Boroko. Leaks, blocked drains, water tanks and new bathroom fittings.',
    listings: [
      {
        title: 'Leak repairs and blocked drains',
        category: 'plumbing',
        price: 70,
        description:
          'Fast help with leaking taps and pipes, blocked sinks, toilets and drains. Same-day visits in Gerehu and Waigani when possible.',
      },
      {
        title: 'Water tank and pump installation',
        category: 'plumbing',
        price: 250,
        description:
          'Install rain water tanks, gutters and pressure pumps, and connect them to your house. I can also clean and repair existing tanks.',
        isActive: false,
      },
    ],
  },
  {
    key: 'ruth',
    fullName: 'Ruth Kaipu',
    skillCategory: 'photography',
    locationName: 'Kokopo, East New Britain',
    coords: near('kokopo', -0.004, 0.006),
    bio: 'Photographer for weddings, graduations, events and small business products.',
    listings: [
      {
        title: 'Event and graduation photography',
        category: 'photography',
        price: 200,
        description:
          'Photos for weddings, graduations, birthdays and church events. You receive edited photos on a USB or by download within one week.',
      },
    ],
  },
  {
    key: 'samuel',
    fullName: 'Samuel Kove',
    skillCategory: 'computer-repair',
    locationName: 'Top Town, Lae',
    coords: near('lae', -0.006, 0.008),
    bio: 'Computer and phone technician. Repairs, virus removal, upgrades, and logo and flyer design for small businesses.',
    listings: [
      {
        title: 'Laptop and computer repairs',
        category: 'computer-repair',
        price: 50,
        description:
          'Slow computers, virus removal, Windows reinstall, screen and keyboard replacement, and data recovery. Free check before any work starts.',
      },
      {
        title: 'Logo and flyer design',
        category: 'graphic-design',
        price: 120,
        description:
          'Logos, flyers, posters and Facebook banners for small businesses, churches and events. Two rounds of changes included.',
      },
    ],
  },
  {
    key: 'esther',
    fullName: 'Esther Wamp',
    skillCategory: 'gardening',
    locationName: 'Madang town, Madang',
    coords: near('madang', 0.003, 0.002),
    bio: 'Gardener and landscaper. Lawn care, flower gardens, fruit trees and food gardens.',
    listings: [
      {
        title: 'Lawn mowing and yard cleaning',
        category: 'gardening',
        price: 40,
        description:
          'Grass cutting, weeding, hedge trimming and rubbish removal. Weekly or monthly visits available around Madang town.',
      },
      {
        title: 'Food garden setup',
        category: 'gardening',
        price: null,
        description:
          'Help you plan and plant a vegetable garden with raised beds, compost and local seedlings. Price depends on the garden size.',
      },
    ],
  },
];

const CUSTOMERS = [
  { key: 'anna', fullName: 'Anna Kuman', locationName: 'Lae' },
  { key: 'david', fullName: 'David Pokana', locationName: 'Port Moresby' },
  { key: 'lucy', fullName: 'Lucy Gawi', locationName: 'Goroka' },
  { key: 'tom', fullName: 'Tom Siune', locationName: 'Mt Hagen' },
];

// [customer, provider, stars, comment]
const REVIEWS = [
  [
    'anna',
    'kila',
    5,
    'Fixed our wiring in one afternoon and explained everything. Very professional.',
  ],
  [
    'anna',
    'samuel',
    4,
    'Laptop works fast again. Took one day longer than promised but good price.',
  ],
  ['anna', 'grace', 5, 'Beautiful meri blouses for our church group. Will order again.'],
  ['david', 'peter', 5, 'Came the same day for a burst pipe. Lifesaver!'],
  ['david', 'grace', 4, 'Good alterations and fair price.'],
  ['david', 'kila', 4, 'Solar lights working well at our village house.'],
  ['lucy', 'mary', 5, 'My son passed his Grade 10 maths exam thanks to Mary.'],
  ['lucy', 'john', 4, 'Strong table, nicely finished.'],
  ['lucy', 'ruth', 5, 'Lovely graduation photos, delivered on time.'],
  ['tom', 'john', 5, 'Built our kitchen cupboards exactly as we wanted.'],
  ['tom', 'esther', 4, 'Yard looks great. Would like more frequent visits.'],
  ['tom', 'mary', 4, ''],
  ['anna', 'esther', 3, 'Good work, but arrived late.'],
  ['david', 'samuel', 5, 'Great logo for my shop.'],
  ['lucy', 'peter', 4, 'Fixed the leak quickly.'],
];

// [customer, provider]
const FAVOURITES = [
  ['anna', 'kila'],
  ['anna', 'grace'],
  ['david', 'peter'],
  ['lucy', 'mary'],
  ['lucy', 'ruth'],
  ['tom', 'john'],
];

// ---------- Helpers ----------

const emailFor = (role, key) => `${role}.${key}@example.com`;

/** Registers the account, or signs in if it already exists. Leaves the user signed in. */
async function signInOrRegister(email, fullName) {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, PASSWORD);
    await updateProfile(credential.user, { displayName: fullName });
    return { user: credential.user, created: true };
  } catch (error) {
    if (error.code !== 'auth/email-already-in-use') throw error;
    const credential = await signInWithEmailAndPassword(auth, email, PASSWORD);
    return { user: credential.user, created: false };
  }
}

/** Creates users/{uid} with the same fields the app writes at registration. */
async function ensureProfile(user, profile) {
  const reference = doc(db, 'users', user.uid);
  if ((await getDoc(reference)).exists()) return false;
  await setDoc(reference, {
    uid: user.uid,
    email: user.email,
    profileImageUrl: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...profile,
  });
  return true;
}

const uids = { provider: {}, customer: {} };
const counts = { accounts: 0, listings: 0, reviews: 0, favourites: 0 };

// ---------- Seeding ----------

async function seedProviders() {
  for (const provider of PROVIDERS) {
    const { user, created } = await signInOrRegister(
      emailFor('provider', provider.key),
      provider.fullName,
    );
    uids.provider[provider.key] = user.uid;
    if (created) counts.accounts++;

    await ensureProfile(user, {
      fullName: provider.fullName,
      phoneNumber: PHONE,
      role: 'provider',
      bio: provider.bio,
      skillCategory: provider.skillCategory,
      locationName: provider.locationName,
      latitude: provider.coords.latitude,
      longitude: provider.coords.longitude,
    });

    const existing = await getDocs(
      query(collection(db, 'services'), where('providerId', '==', user.uid)),
    );
    const existingTitles = new Set(existing.docs.map((d) => d.data().title));
    for (const listing of provider.listings) {
      if (existingTitles.has(listing.title)) continue;
      await addDoc(collection(db, 'services'), {
        providerId: user.uid,
        title: listing.title,
        category: listing.category,
        description: listing.description,
        locationName: provider.locationName,
        latitude: provider.coords.latitude,
        longitude: provider.coords.longitude,
        contactNumber: PHONE,
        startingPrice: listing.price,
        imageUrl: null,
        isActive: listing.isActive ?? true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      counts.listings++;
    }
    console.log(`provider ${provider.fullName}: ok`);
    await signOut(auth);
  }
}

async function seedCustomers() {
  for (const customer of CUSTOMERS) {
    const { user, created } = await signInOrRegister(
      emailFor('customer', customer.key),
      customer.fullName,
    );
    uids.customer[customer.key] = user.uid;
    if (created) counts.accounts++;

    await ensureProfile(user, {
      fullName: customer.fullName,
      phoneNumber: PHONE,
      role: 'customer',
      bio: '',
      skillCategory: '',
      locationName: customer.locationName,
      latitude: null,
      longitude: null,
    });

    for (const [customerKey, providerKey, rating, comment] of REVIEWS) {
      if (customerKey !== customer.key) continue;
      const providerId = uids.provider[providerKey];
      const reference = doc(db, 'reviews', `${user.uid}_${providerId}`);
      if ((await getDoc(reference)).exists()) continue;
      await setDoc(reference, {
        customerId: user.uid,
        customerName: customer.fullName,
        providerId,
        rating,
        comment,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      counts.reviews++;
    }

    for (const [customerKey, providerKey] of FAVOURITES) {
      if (customerKey !== customer.key) continue;
      const providerId = uids.provider[providerKey];
      const reference = doc(db, 'favourites', `${user.uid}_${providerId}`);
      try {
        if ((await getDoc(reference)).exists()) continue;
      } catch {
        // Reading a favourite that does not exist yet is denied by the rules; create it.
      }
      await setDoc(reference, { customerId: user.uid, providerId, createdAt: serverTimestamp() });
      counts.favourites++;
    }
    console.log(`customer ${customer.fullName}: ok`);
    await signOut(auth);
  }
}

try {
  await seedProviders();
  await seedCustomers();
  console.log('\nDone.', counts);
  console.log(`Demo password for every account: ${PASSWORD}`);
  console.log('Logins: provider.<name>@example.com and customer.<name>@example.com');
  process.exit(0);
} catch (error) {
  console.error('\nSeeding stopped:', error.code ?? '', error.message);
  process.exit(1);
}
