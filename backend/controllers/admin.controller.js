import CarListing from "../models/listing.model.js";
import User from "../models/user.model.js";
import { getFirebaseAdminAuth } from "../utils/firebaseAdmin.js";
import { configuredAdminUserIds } from "../utils/requireAdmin.js";

const sendValidationError = (res, message) =>
  res.status(400).json({ success: false, message });

const sendAdminServiceError = (error, res, next) => {
  const message = error instanceof Error ? error.message : "";
  if (
    error.code === "app/invalid-credential" ||
    /could not load the default credentials|failed to fetch a valid google oauth2 access token/i.test(
      message,
    )
  ) {
    return res.status(503).json({
      success: false,
      message:
        "Firebase Admin credentials are missing or invalid. In the Firebase Console, open Project settings > Service accounts and generate a private key. Store the JSON file outside the project, set GOOGLE_APPLICATION_CREDENTIALS to its full path in the project-root .env, then restart the backend.",
    });
  }

  if (
    error.code === "auth/insufficient-permission" ||
    error.code === "app/insufficient-permission"
  ) {
    return res.status(503).json({
      success: false,
      message:
        "The Firebase service account is valid but lacks permission to manage Authentication users. Grant it Firebase Authentication Admin permissions in Google Cloud IAM, then restart the backend.",
    });
  }

  return next(error);
};

export const getAdminUsers = async (req, res, next) => {
  const pageToken = req.query.pageToken;
  if (pageToken !== undefined && typeof pageToken !== "string") {
    return sendValidationError(res, "pageToken must be a string.");
  }

  try {
    const auth = getFirebaseAdminAuth();
    const page = await auth.listUsers(100, pageToken || undefined);
    const userIds = page.users.map((user) => user.uid);
    const listingCounts = userIds.length
      ? await CarListing.aggregate([
          { $match: { userId: { $in: userIds } } },
          { $group: { _id: "$userId", count: { $sum: 1 } } },
        ])
      : [];
    const listingCountByUser = new Map(
      listingCounts.map(({ _id, count }) => [_id, count]),
    );

    return res.status(200).json({
      success: true,
      data: page.users.map((user) => ({
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
        createdAt: user.metadata.creationTime || null,
        lastSignInAt: user.metadata.lastSignInTime || null,
        disabled: user.disabled,
        listingCount: listingCountByUser.get(user.uid) || 0,
        canDelete: !configuredAdminUserIds().includes(user.uid),
      })),
      nextPageToken: page.pageToken || null,
    });
  } catch (error) {
    if (error.code === "auth/invalid-page-token") {
      return sendValidationError(res, "The user page token is invalid. Reload the dashboard.");
    }
    return sendAdminServiceError(error, res, next);
  }
};

export const deleteAdminUser = async (req, res, next) => {
  const { uid } = req.params;
  if (!uid || uid.length > 128) {
    return sendValidationError(res, "A valid Firebase user ID is required.");
  }

  if (configuredAdminUserIds().includes(uid)) {
    return res.status(403).json({
      success: false,
      message: "Administrator accounts cannot be deleted from this dashboard.",
    });
  }

  try {
    const auth = getFirebaseAdminAuth();
    let email = "";
    let authUserExists = true;

    try {
      const authUser = await auth.getUser(uid);
      email = authUser.email || "";
    } catch (error) {
      if (error.code !== "auth/user-not-found") {
        throw error;
      }
      authUserExists = false;
    }

    const [listingResult, profileResult] = await Promise.all([
      CarListing.deleteMany({ userId: uid }),
      email ? User.deleteOne({ email }) : Promise.resolve(null),
    ]);

    if (authUserExists) {
      await auth.deleteUser(uid);
    }

    return res.status(200).json({
      success: true,
      message: authUserExists
        ? "User account, profile, and listings deleted."
        : "User listings cleaned up; the Firebase account was already absent.",
      deletedListings: listingResult.deletedCount,
      deletedProfiles: profileResult?.deletedCount || 0,
    });
  } catch (error) {
    return sendAdminServiceError(error, res, next);
  }
};

export const getAdminAccess = (req, res) =>
  res.status(200).json({
    success: true,
    data: { isAdmin: configuredAdminUserIds().includes(req.firebaseUser.sub) },
  });
