
Project Introduction: Car Marketplace Platform
This project is a Car Marketplace Platform where users can list, sell, or rent cars, and potential buyers or renters can browse these listings and contact sellers directly. The platform provides a seamless and secure experience for users to manage their accounts, listings, and interactions.

Key Features & Functionalities
User Management
User registration with email/password or Google OAuth for passwordless authentication.
Secure login/logout functionality.
Ability for users to update or delete their accounts.
Users can view their account details and manage their personal data.
Car Listings
Users can create, update, or delete car listings for sale or rent.
Listings include detailed information such as make, model, year, condition, price, and images.
Support for specifying additional details like mileage, fuel type, and location.
Categorization of listings into “For Sale” or “For Rent.”
Listings API endpoints:
- `GET /api/listing` — browse up to 100 newest listings; optional `type`, `fuelType`, and `transmission` filters.
- `GET /api/listing/:id` — get one public listing.
- `GET /api/listing/mine` — list the authenticated user's listings.
- `POST /api/listing` — create a listing for the authenticated user.
- `PATCH /api/listing/:id` — update a listing owned by the authenticated user.
- `DELETE /api/listing/:id` — delete a listing owned by the authenticated user.

Send a Firebase ID token in `Authorization: Bearer <Firebase ID token>` for `/mine`, `POST`, `PATCH`, and `DELETE`.
Create listing JSON fields: `name`, `description`, `make`, `year`, `price`, `mileage`, `fuelType` (`Petrol`, `Diesel`, `Electric`, `Hybrid`), `transmission` (`Automatic`, `Manual`, `CVT`), `condition` (`New`, `Used`, `Damaged`), `imageURLs` (non-empty array of HTTP(S) URLs), `location`, and `type` (`Sale`, `Rent`). `model` is optional. `offer` is optional and defaults to `false`.
Authenticated image uploads request a signature from `POST /api/cloudinary/car-image-signature` before uploading directly to Cloudinary.
Search & Browsing
Potential buyers or renters can search for car listings.
Filtering options by criteria such as price, location, car type, condition, and more.
Detailed view of each listing with full specifications and seller contact information.
Secure Interactions
Secure user authentication and authorization for managing personal and listing data.
Token-based authentication for protected routes.
Technical Highlights
Backend Framework: Built using Express.js for robust API routing and middleware management.
Database: Uses MongoDB for scalable and flexible data storage.
Authentication: Secure authentication and authorization with token-based methods and third-party OAuth integration.
Data Validation: Implements strict validation rules for user and listing data.