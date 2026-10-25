# SuuroCars

SuuroCars is a car marketplace for discovering vehicles for sale or rent. Browse detailed listings, compare prices and specifications, explore offers, and contact sellers directly.

## Features

- Firebase email/password and Google authentication.
- Search listings by keywords, vehicle type, price, year, condition, fuel type, transmission, and offers.
- Create, edit, and delete your own car listings.
- Upload listing and profile images through signed Cloudinary uploads, or add car photos with direct HTTP(S) image URLs.
- Browse photo galleries, vehicle details, pricing, seller information, and posting dates.
- Signed-in buyers can prepare a message and open their email app to contact a seller.
- Admin dashboard for reviewing accounts and removing Firebase users and their listings.

## Technology

- **Frontend:** React, Vite, React Router, Swiper
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Authentication:** Firebase Authentication and verified Firebase ID tokens
- **Image uploads:** Cloudinary signed uploads

## Requirements

- Node.js and npm
- MongoDB (local or hosted)
- Firebase project with Authentication enabled
- Cloudinary account for image uploads

## Setup

### 1. Install dependencies

From the repository root:

```bash
npm install
npm --prefix frontend install
```

### 2. Configure the backend

Create a `.env` file in the repository root:

```env
PORT=4000
MONGODB_URI=mongodb+srv://<database-user>:<password>@<cluster-host>/car_listing_site
JWT_SECRET=replace-with-a-long-random-secret
FIREBASE_PROJECT_ID=your-firebase-project-id
CLOUDINARY_URL=cloudinary://your-api-key:your-api-secret@your-cloud-name
```

Use the MongoDB Atlas connection URI for your cluster and replace the placeholders with your database user's credentials. If a password contains URL-reserved characters, percent-encode it before adding it to the URI. In Atlas, allow the backend server's IP address under **Network Access** and grant the database user access to the `car_listing_site` database. `MONGODB_URI` defaults to a local MongoDB URL if omitted. Keep backend secrets in the root `.env`; never put them in frontend environment variables or commit them.

### 3. Configure the frontend

Create `frontend/src/.env`:

```env
VITE_FIREBASE_API_KEY=your-firebase-web-api-key
```

The remaining Firebase web settings use the existing project defaults. For another Firebase project, also set `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, and `VITE_FIREBASE_APP_ID`.

In Firebase Console, enable **Email/Password** and **Google** sign-in providers, and add local and deployed site domains to the Authorized domains list.

### 4. Start the application

Start the backend in one terminal:

```bash
npm run dev
```

Start the frontend in a second terminal:

```bash
npm --prefix frontend run dev
```

Vite serves the frontend and proxies `/api` requests to `http://localhost:4000`.

## Admin dashboard

Admin access is controlled by the backend-only `ADMIN_USER_IDS` comma-separated setting:

```env
ADMIN_USER_IDS=your-firebase-user-uid
```

To let the dashboard list and delete Firebase Authentication accounts:

1. In Firebase Console, open **Project settings → Service accounts** and generate a private key.
2. Store the downloaded JSON file outside this repository.
3. Set `GOOGLE_APPLICATION_CREDENTIALS` in the root `.env` to the full path of that JSON file.
4. Grant the service account permission to manage Firebase Authentication users.
5. Restart the backend and open `/admin` while signed in as an allowlisted user.

Never commit or share the service-account key. Administrator accounts are protected from deletion.

## API overview

All endpoints are relative to `/api`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/listing` | Browse and search public listings. |
| `GET` | `/listing/:id` | Get a public listing. |
| `GET` | `/listing/:id/contact` | Get seller contact as a signed-in non-owner. |
| `GET` | `/listing/mine` | List the authenticated user's listings. |
| `POST` | `/listing` | Create a listing with 1–6 valid HTTP(S) image URLs. |
| `PATCH` | `/listing/:id` | Update an owned listing, including its 1–6 image URLs. |
| `DELETE` | `/listing/:id` | Delete a listing owned by the authenticated user. |
| `POST` | `/cloudinary/car-image-signature` | Request a signed car-image upload. |
| `POST` | `/cloudinary/profile-photo-signature` | Request a signed profile-photo upload. |
| `GET` | `/admin/access` | Check administrator access. |
| `GET` | `/admin/users` | List Firebase users and listing counts (admin only). |
| `DELETE` | `/admin/users/:uid` | Delete a Firebase user and marketplace data (admin only). |

Protected endpoints require a Firebase ID token in the `Authorization: Bearer <token>` header. Listing search supports `q`, `type`, `offer`, `condition`, `transmission`, `fuelType`, `minPrice`, `maxPrice`, `minYear`, `maxYear`, and `sort`.

## Validation

```bash
npm --prefix frontend run lint
npm --prefix frontend run build
```

## Repository

[SuuroCars on GitHub](https://github.com/brahim1-dev/Car_listing_Site)

## Author

[Visit my GitHub profile](https://github.com/brahim1-dev)
