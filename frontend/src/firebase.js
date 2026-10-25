import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAdditionalUserInfo,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateEmail,
  updatePassword,
  updateProfile,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasFirebaseConfig = Object.values(firebaseConfig).every(
  (value) => typeof value === "string" && value.trim(),
);

export const firebaseConfigError = hasFirebaseConfig
  ? null
  : "Firebase is not configured. Set all VITE_FIREBASE_* values in frontend/.env, then restart the frontend.";

export const auth = hasFirebaseConfig
  ? getAuth(initializeApp(firebaseConfig))
  : null;

const googleProvider = new GoogleAuthProvider();
let googleAuthRequest = null;

const requireAuth = () => {
  if (!auth) {
    throw new Error(firebaseConfigError);
  }

  return auth;
};

const authenticateWithGoogle = (allowSignUp) => {
  if (googleAuthRequest) {
    return googleAuthRequest;
  }

  const request = (async () => {
    const result = await signInWithPopup(requireAuth(), googleProvider);

    if (!allowSignUp && getAdditionalUserInfo(result)?.isNewUser) {
      try {
        await deleteUser(result.user);
      } finally {
        await signOut(requireAuth());
      }

      throw new Error("No account exists for this Google account. Please sign up first.");
    }

    return result.user;
  })();

  googleAuthRequest = request.finally(() => {
    googleAuthRequest = null;
  });
  return googleAuthRequest;
};

export const signUpWithGoogle = () => authenticateWithGoogle(true);
export const signInWithGoogle = () => authenticateWithGoogle(false);

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

export const updateAccount = async ({ displayName, email, password }) => {
  const user = requireAuth().currentUser;
  if (!user) {
    throw new Error("You must be signed in to update your account.");
  }

  await updateProfile(user, { displayName });
  if (email !== user.email) {
    await updateEmail(user, email);
  }
  if (password) {
    await updatePassword(user, password);
  }

  return user;
};

export const deleteAccount = async () => {
  const user = requireAuth().currentUser;
  if (!user) {
    throw new Error("You must be signed in to delete your account.");
  }

  await deleteUser(user);
  await signOut(requireAuth());
};

export const logOut = () => signOut(requireAuth());
