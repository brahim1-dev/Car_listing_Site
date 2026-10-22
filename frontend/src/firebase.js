import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "carlistsite-52ae7.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "carlistsite-52ae7",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "carlistsite-52ae7.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "952018284293",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:952018284293:web:7f71d08ec25d3957d2916c",
};

const firebaseApiKey = firebaseConfig.apiKey?.trim();
const hasFirebaseApiKey =
  firebaseApiKey && firebaseApiKey !== "your-firebase-web-api-key";

export const firebaseConfigError = hasFirebaseApiKey
  ? null
  : "Firebase is not configured. Set VITE_FIREBASE_API_KEY in frontend/.env using the Web API key from your Firebase project, then restart the frontend.";

export const auth = hasFirebaseApiKey
  ? getAuth(
      initializeApp({
        ...firebaseConfig,
        apiKey: firebaseApiKey,
      }),
    )
  : null;

const googleProvider = new GoogleAuthProvider();

const requireAuth = () => {
  if (!auth) {
    throw new Error(firebaseConfigError);
  }

  return auth;
};

export const signUpWithGoogle = async () => {
  const result = await signInWithPopup(requireAuth(), googleProvider);
  return result.user;
};

export const signInWithGoogle = signUpWithGoogle;

export const signUpWithEmail = async (username, email, password) => {
  const result = await createUserWithEmailAndPassword(
    requireAuth(),
    email,
    password,
  );
  await updateProfile(result.user, { displayName: username });
  return result.user;
};

export const signInWithEmail = async (email, password) => {
  const result = await signInWithEmailAndPassword(
    requireAuth(),
    email,
    password,
  );
  return result.user;
};

export const logOut = () => signOut(requireAuth());
