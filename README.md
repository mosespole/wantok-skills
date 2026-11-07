# Wantok Skills

**Connecting Skills. Empowering Communities.**

Wantok Skills is an Android marketplace app that connects people in Papua New Guinea who need a job done with local skilled workers who can do it. Service providers (carpenters, plumbers, electricians, tutors, tailors, photographers and more) register, build a profile and publish service listings. Customers browse and search those listings by name, category and location, see providers on a map, save favourites, and contact a provider directly by phone call or WhatsApp. The app is built with React Native and Expo, and uses Firebase Authentication and Cloud Firestore as its backend.

|                    |                                                            |
| ------------------ | ---------------------------------------------------------- |
| **Student name**   | `[YOUR FULL NAME]`                                         |
| **Student number** | `[YOUR STUDENT NUMBER]`                                    |
| **Course**         | IS325 Mobile App Development, PNG University of Technology |
| **Repository**     | <https://github.com/mosespole/wantok-skills>               |

---

## Features

- Email/password registration with a **Customer** or **Service Provider** role, login, logout, password reset, and sessions that survive closing the app.
- Role-based navigation. Customers get Home, Explore, Map, Favourites and Profile tabs; providers get Dashboard, My Services, Map, Favourites and Profile.
- Full **create, read, update and delete** of service listings in Firestore, including pausing a listing without deleting it.
- Search by keyword, category and location; browse by category.
- Listing and provider detail pages with **Call** and **WhatsApp** buttons.
- Favourites saved to the customer's account in Firestore.
- **Map** of providers using the device's real location.
- **Profile pictures** for all users and a **Past work** gallery for providers (photo, caption, category, optional location, date completed), stored as compressed photos in Firestore.
- **Reviews and 1-5 star ratings**: customers review providers once each; average rating and count shown on profiles and cards.
- Search finds **providers by name, skill or location**, even before they publish a listing.
- Optional listing photos via Firebase Storage (built, but switched off on the free Spark plan).
- Firestore Security Rules enforcing ownership and roles on the server.
- Offline fallback: the latest listings and your profile are cached with AsyncStorage and clearly labelled as saved data.

## Tech stack

| Area           | Technology                                                                              |
| -------------- | --------------------------------------------------------------------------------------- |
| App            | React Native 0.86, Expo SDK 57 (managed workflow), TypeScript, Expo Router              |
| State and data | React Context (auth), TanStack React Query (server data), react-hook-form + zod (forms) |
| Backend        | Firebase JavaScript SDK 13: Authentication, Cloud Firestore (Storage optional)          |
| Device         | expo-location, react-native-maps, expo-image-picker, AsyncStorage                       |
| Build          | EAS Build (APK and AAB)                                                                 |

---

## Setup and run (from a clean clone)

### Prerequisites

- **Node.js 22.13 or newer** (developed on Node 22.22)
- **Expo Go for SDK 57** on an Android phone. The Play Store version may be newer; install the SDK 57 build from <https://expo.dev/go?sdkVersion=57&platform=android&device=true> and turn off auto-update.
- A **Firebase project** with Email/Password sign-in and Cloud Firestore enabled.

### Steps

```bash
git clone https://github.com/mosespole/wantok-skills.git
cd wantok-skills
npm install
```

1. **Create a Firebase web app** in the Firebase console (Project settings → General → Your apps → Web).
2. **Create `.env`** by copying `.env.example` and filling in the values from the Firebase web app config:
   ```bash
   cp .env.example .env
   ```
3. **Enable Firebase services:** Authentication → Sign-in method → Email/Password; Firestore Database → Create database.
4. **Deploy the security rules** (either paste `firestore.rules` into Firestore → Rules → Publish, or use the CLI):
   ```bash
   npx firebase-tools login
   npx firebase-tools deploy --only firestore:rules --project <your-project-id>
   ```
5. **Start the app** and scan the QR code with Expo Go:
   ```bash
   npx expo start
   ```

### Useful scripts

| Command             | Purpose                                    |
| ------------------- | ------------------------------------------ |
| `npm start`         | Start the Expo dev server                  |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`)          |
| `npm run lint`      | ESLint (Expo config + Prettier)            |
| `npm run format`    | Format all files with Prettier             |
| `npm run doctor`    | `expo-doctor` dependency and config checks |

---

## Environment variables

All are read at build time by Expo. `EXPO_PUBLIC_` values are bundled into the app, so they must only ever be **publishable** identifiers. The Firebase web config is designed to be public; data is protected by `firestore.rules` and `storage.rules`. No service-account keys, passwords or private keys are used anywhere in the app.

| Variable                                   | Required | Description                                                                           |
| ------------------------------------------ | -------- | ------------------------------------------------------------------------------------- |
| `EXPO_PUBLIC_FIREBASE_API_KEY`             | Yes      | Firebase web API key                                                                  |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`         | Yes      | e.g. `your-project.firebaseapp.com`                                                   |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID`          | Yes      | Firebase project ID                                                                   |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`      | Yes      | e.g. `your-project.firebasestorage.app`                                               |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes      | Firebase sender ID                                                                    |
| `EXPO_PUBLIC_FIREBASE_APP_ID`              | Yes      | Firebase web app ID                                                                   |
| `EXPO_PUBLIC_FIREBASE_STORAGE_ENABLED`     | No       | `true` to enable photo uploads (needs Firebase Storage, Blaze plan). Default `false`. |

`.env` is git-ignored. The app stops at start-up with a clear "Firebase is not configured" message if a required value is missing.

---

## External APIs and services

| Service                                        | Used for                                                                                          |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Firebase Authentication**                    | Accounts, login, password reset, persistent sessions                                              |
| **Cloud Firestore**                            | `users`, `services` and `favourites` collections                                                  |
| **Device location** (expo-location)            | Real GPS position for the map, "Near you" and pinning listings; reverse geocoding for place names |
| **Google Maps** (react-native-maps)            | Map tiles and markers on Android                                                                  |
| **WhatsApp click-to-chat** (`https://wa.me/…`) | Opening a WhatsApp chat with a provider                                                           |
| **Phone dialler** (`tel:` link)                | Calling a provider                                                                                |
| **Firebase Storage** (optional)                | Profile and listing photos; disabled unless `EXPO_PUBLIC_FIREBASE_STORAGE_ENABLED=true`           |

Full details (endpoints, rate limits and failure handling) are in the technical report: [`docs/technical-report.md`](docs/technical-report.md).

---

## Building the APK and AAB (EAS Build)

Build profiles are defined in [`eas.json`](eas.json):

| Profile       | Output                  | Use                                                              |
| ------------- | ----------------------- | ---------------------------------------------------------------- |
| `development` | Development build (APK) | Requires `expo-dev-client`; not needed when testing with Expo Go |
| `preview`     | **APK**                 | Installable test build for a physical phone                      |
| `production`  | **AAB**                 | Android App Bundle for Google Play                               |

### One-time setup

```bash
npx eas-cli@latest login
npx eas-cli@latest init          # links the project to your Expo account
```

**Firebase values for cloud builds.** `.env` is git-ignored, so EAS Build servers never receive it. Store each Firebase variable as an EAS environment variable for the `preview` and `production` environments, for example:

```bash
npx eas-cli@latest env:create --name EXPO_PUBLIC_FIREBASE_API_KEY --value <value> --environment preview --environment production --visibility plaintext
```

Repeat for every required variable in the table above.

**Google Maps key.** Expo Go shows maps without a key, but a compiled Android build needs a Google Maps API key with **Maps SDK for Android** enabled. `app.config.js` passes `GOOGLE_MAPS_ANDROID_API_KEY` to the `react-native-maps` config plugin, so the key is never committed; store it as a sensitive EAS variable:

```bash
npx eas-cli@latest env:create --name GOOGLE_MAPS_ANDROID_API_KEY --value <key> --environment preview --environment production --visibility sensitive
```

Without it the map in the APK/AAB is blank (see Known limitations).

### Build commands

```bash
npx eas-cli@latest build --platform android --profile preview      # APK
npx eas-cli@latest build --platform android --profile production   # AAB
```

---

## Screenshots

`[ADD SCREENSHOTS taken from the running app to docs/screenshots/ and update the paths below.]`

| Welcome                                  | Register                                   | Customer Home                      | Explore                                  |
| ---------------------------------------- | ------------------------------------------ | ---------------------------------- | ---------------------------------------- |
| ![Welcome](docs/screenshots/welcome.png) | ![Register](docs/screenshots/register.png) | ![Home](docs/screenshots/home.png) | ![Explore](docs/screenshots/explore.png) |

| Listing details                          | Map                              | Provider dashboard                           | Create listing                                 |
| ---------------------------------------- | -------------------------------- | -------------------------------------------- | ---------------------------------------------- |
| ![Listing](docs/screenshots/listing.png) | ![Map](docs/screenshots/map.png) | ![Dashboard](docs/screenshots/dashboard.png) | ![Create](docs/screenshots/create-listing.png) |

---

## Known limitations

- **Photos are stored inside Firestore**, not Firebase Storage, because the free Spark plan has no Storage. Each photo is shrunk on the phone (profile pictures about 320 px, past-work photos about 1024 px) to fit Firestore's 1 MiB document limit, so image quality is reduced. Optional listing photos (Firebase Storage) stay switched off until `EXPO_PUBLIC_FIREBASE_STORAGE_ENABLED=true`.
- **Reviews are not verified.** Any customer can review any provider once; the app cannot prove the job took place. Ratings are not shown on search results for providers without listings (to avoid one query per provider).
- **Search runs on the phone.** Firestore has no full-text search, so the app downloads up to 300 active listings and filters them locally. This is fine for a small marketplace but would not scale to thousands of listings.
- **The map is blank in the compiled APK/AAB.** A compiled Android build needs a Google Maps API key, and Google requires a billing account (a payment card) to issue one, which was not available for this project. The app is set up to use a key (`app.config.js` reads `GOOGLE_MAPS_ANDROID_API_KEY` at build time), but the submitted builds were made without it. Every other screen works in the APK; the map works fully in Expo Go, which needs no key. The web version shows a message instead of a map.
- **Offline support is read-only and partial.** The latest active listings and your own profile are saved on the phone (AsyncStorage) and shown with an "offline / saved" notice when Firestore cannot be reached. Listing details, provider pages, My Services and Favourites still need a connection, and creating, editing, deleting or favouriting is blocked while offline with a clear message (nothing is queued).
- **Provider emails are visible to signed-in users**, because provider profile documents (readable for the marketplace) include the email field.
- **"Featured" listings** are simply the most complete listings (photo, price, provider photo), not the highest rated. There are no payments or in-app chat; customers contact providers by phone or WhatsApp.
- **A paused listing opened by another user** shows a "no permission" message rather than "not found".
- **Security rules were tested manually**, not with automated emulator tests (Java was not available on the development machine).
- **Early commit history:** the first phases were committed after they were written, so individual early commits do not build on their own; `main` does.

---

## AI assistance

This project was developed with the help of an AI coding assistant, as permitted by Section 9 of the brief.

**Tool used:** Claude Code (Anthropic's command-line coding assistant), using the Claude Opus 5.5 model.

**What it was used for:**

- Inspecting the starting Expo project and checking package compatibility with Expo SDK 57.
- Proposing the architecture (folder structure, Firestore data model, navigation and authentication boundary).
- Generating most of the application source code: screens, components, hooks, Firebase service files and validation.
- Writing the Firestore and Storage Security Rules.
- Debugging, for example the web build crash caused by `react-native-maps` and the Expo Go SDK version mismatch.
- Running type checks, lint and test bundles, and testing the deployed security rules with temporary accounts.
- Drafting this README and the technical report outline.

**What I did myself:** `[DESCRIBE HONESTLY, e.g. chose the project idea, set up Firebase, tested on my phone, reviewed and modified the generated code, fixed issues found in testing, wrote the reflection.]`

`[CONFIRM: I have read and understand the code in this repository and can explain how it works.]`

---

## License

See [LICENSE](LICENSE).
