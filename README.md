# SuuroCars

SuuroCars is a car marketplace for discovering vehicles for sale or rent. Users can search listings, manage their own vehicles, and contact sellers.

## Features

- Firebase email/password and Google authentication.
- Search by keyword, vehicle type, price, year, condition, fuel, transmission, and offers.
- Create, update, and remove vehicle listings.
- Signed Cloudinary uploads for listing and profile photos, or direct HTTP(S) car photo URLs.
- Seller contact details, vehicle specifications, and image galleries.
- Admin dashboard for managing users and listings.

## Stack

- React, Vite, React Router, and Tailwind CSS
- Node.js and Express
- MongoDB and Mongoose
- Firebase Authentication and Cloudinary

## Run locally

Requirements: Node.js, npm, a MongoDB database, a Firebase project, and a Cloudinary account.

1. Install dependencies from the repository root:

   ```bash
   npm ci
   npm ci --prefix frontend
   ```

2. Copy `.env.example` to `.env` in the repository root and fill in the backend values. Copy `frontend/.env.example` to `frontend/.env` and fill in the Firebase web configuration.
3. In Firebase Console, enable Email/Password and Google sign-in and add `localhost` to Authorized domains.
4. Start the backend and Vite in separate terminals:

   ```bash
   npm run dev
   npm --prefix frontend run dev
   ```

Vite proxies `/api` requests to the backend on port `4000`. The backend uses `PORT` when set and otherwise listens on `4000`. For Atlas, allow the backend's network access and give the database user access to the configured database. `MONGODB_URI` falls back to a local MongoDB URL when omitted.

## Deploy to Render

The included `render.yaml` deploys one Node web service. Express serves both the API and the built React app, so the frontend and API share the same origin and Render's assigned port. In Render, choose **New + → Blueprint** and select this repository. Render prompts for values marked as secret or unset; enter the values below. Do not set `PORT` yourself.

`MONGODB_URI`, `JWT_SECRET`, `FIREBASE_PROJECT_ID`, and all six `VITE_FIREBASE_*` values are required. `CLOUDINARY_URL` is required for image uploads. Leave `FIREBASE_SERVICE_ACCOUNT_JSON` blank unless you need admin actions that manage Firebase users; leave `ADMIN_USER_IDS` blank if you are not enabling the admin dashboard. `GOOGLE_CLIENT_ID` is only needed by the backend Google OAuth endpoint. `GOOGLE_APPLICATION_CREDENTIALS` is for a local service-account file and should be left blank on Render.

| Render variable | Value to enter |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas connection string, including database name and credentials. URL-encode reserved characters in the password, and allow Render to connect in Atlas Network Access. |
| `JWT_SECRET` | A newly generated, long random string. |
| `FIREBASE_PROJECT_ID` | The Firebase project ID used by the web app and Authentication. |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Optional for ordinary sign-in and listings; required by admin actions that manage Firebase users. Paste the service-account JSON as one line. |
| `GOOGLE_CLIENT_ID` | OAuth web client ID used by the backend Google sign-in endpoint, if that sign-in path is enabled. |
| `ADMIN_USER_IDS` | Optional comma-separated Firebase user UIDs allowed to use the admin dashboard. |
| `CLOUDINARY_URL` | Cloudinary URL in the form `cloudinary://API_KEY:API_SECRET@CLOUD_NAME`. |
| `VITE_FIREBASE_API_KEY` | Firebase Console → Project settings → Your apps → Web app configuration. This is public client configuration, not a server secret. |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase web app auth domain, usually `PROJECT_ID.firebaseapp.com`. |
| `VITE_FIREBASE_PROJECT_ID` | The same Firebase project ID as `FIREBASE_PROJECT_ID`. |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase web app storage bucket value. |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase web app messaging sender ID. |
| `VITE_FIREBASE_APP_ID` | Firebase web app application ID. |

The `VITE_` values are included in the browser bundle at build time; never put server credentials in them. Add the deployed Render domain to Firebase Authentication's Authorized domains. Keep `FIREBASE_SERVICE_ACCOUNT_JSON` limited to the service account required for Firebase Admin operations. If admin account management is not needed, leave it unset.

## Environment files and credentials

The root `.env` is for backend-only values. `frontend/.env` is for the Firebase web app settings. Both are ignored by Git; the checked-in `.env.example` files contain variable names only. Never commit real `.env` files, database passwords, Cloudinary API secrets, or Firebase service-account keys. `GOOGLE_APPLICATION_CREDENTIALS` can point to a service-account JSON file on a local machine; on Render, use `FIREBASE_SERVICE_ACCOUNT_JSON` instead.

If credentials have been exposed, rotate them in their provider consoles and update the environment variables. Restrict the Firebase web API key to the intended Firebase services and authorized domains.

## Admin setup

Set `ADMIN_USER_IDS` to one or more comma-separated Firebase Authentication UIDs. For listing and deleting Firebase Auth accounts, also configure `FIREBASE_SERVICE_ACCOUNT_JSON` with a service account permitted to manage Firebase Authentication users. Never commit its key. Admin accounts are protected from deletion.

## API

All API endpoints use the `/api` prefix. Protected routes require a Firebase ID token in the `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/listing` | Browse and search public listings. |
| `GET` | `/api/listing/:id` | Get a public listing. |
| `GET` | `/api/listing/:id/contact` | Get seller contact details. |
| `GET` | `/api/listing/mine` | List the authenticated user's listings. |
| `POST` | `/api/listing` | Create a listing with 1-6 image URLs. |
| `PATCH` | `/api/listing/:id` | Update an owned listing, including its image URLs. |
| `DELETE` | `/api/listing/:id` | Delete an owned listing. |
| `POST` | `/api/cloudinary/car-image-signature` | Authorize a car image upload. |
| `POST` | `/api/cloudinary/profile-photo-signature` | Authorize a profile photo upload. |
| `GET` | `/api/admin/access` | Check administrator access. |
| `GET` | `/api/admin/users` | List users and listing counts (admin only). |
| `DELETE` | `/api/admin/users/:uid` | Delete a user and their marketplace data (admin only). |
| `GET` | `/health` | Render health check. |

Listing search supports `q`, `type`, `offer`, `condition`, `transmission`, `fuelType`, `minPrice`, `maxPrice`, `minYear`, `maxYear`, and `sort`.

## Checks

```bash
npm test
npm --prefix frontend run lint
npm run build
```

## Links

- [SuuroCars on GitHub](https://github.com/brahim1-dev/Car_listing_Site)
- [Author's GitHub profile](https://github.com/brahim1-dev)
