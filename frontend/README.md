# Car Listing Site frontend

## Firebase Authentication

The frontend uses Firebase Authentication for email/password and Google
sign-in. In the Firebase Console for the configured project:

1. Enable **Email/Password** and **Google** under Authentication > Sign-in
   method.
2. Add your local and production website origins to Authentication > Settings >
   Authorized domains.
3. Set `VITE_FIREBASE_API_KEY` in `frontend/src/.env` using your Firebase Web
   App API key:

   ```env
   VITE_FIREBASE_API_KEY=your-firebase-web-api-key
   ```

The existing Firebase project settings are used for the remaining web app
configuration. If using a different Firebase project, set
`VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`,
`VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, and
`VITE_FIREBASE_APP_ID` in the same file.

Restart the frontend dev server after changing environment variables. Build the
frontend with `npm run build` from this directory.
