import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const getFirebaseAdminApp = () => {
  const existingApp = getApps().find((app) => app.name === "marketplace-admin");
  if (existingApp) return existingApp;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const credential = serviceAccountJson
    ? cert(JSON.parse(serviceAccountJson))
    : applicationDefault();

  return initializeApp(
    {
      credential,
      projectId: process.env.FIREBASE_PROJECT_ID,
    },
    "marketplace-admin",
  );
};

export const getFirebaseAdminAuth = () => getAuth(getFirebaseAdminApp());
