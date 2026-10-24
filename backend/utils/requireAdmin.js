export const configuredAdminUserIds = () =>
  (process.env.ADMIN_USER_IDS || "")
    .split(",")
    .map((uid) => uid.trim())
    .filter(Boolean);

export const requireAdmin = (req, res, next) => {
  const adminUserIds = configuredAdminUserIds();
  if (!adminUserIds.length) {
    return res.status(503).json({
      success: false,
      message: "Admin access is not configured on the server.",
    });
  }

  if (!adminUserIds.includes(req.firebaseUser.sub)) {
    return res.status(403).json({
      success: false,
      message: "Administrator access is required.",
    });
  }

  return next();
};
