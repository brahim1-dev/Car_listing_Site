import jwt from "jsonwebtoken";

const firebaseProjectId = () => process.env.FIREBASE_PROJECT_ID;
const certificateUrl =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
let certificates;
let certificatesExpireAt = 0;

const getCertificates = async () => {
  if (certificates && Date.now() < certificatesExpireAt) {
    return certificates;
  }

  const response = await fetch(certificateUrl);
  if (!response.ok) {
    throw new Error("Could not retrieve Firebase token verification certificates.");
  }

  const result = await response.json();
  const maxAge = response.headers
    .get("cache-control")
    ?.match(/max-age=(\d+)/)?.[1];

  certificates = result;
  certificatesExpireAt = Date.now() + (Number(maxAge) || 300) * 1000;
  return certificates;
};

export const verifyFirebaseToken = async (token) => {
  const projectId = firebaseProjectId();
  if (!projectId) {
    throw new Error("FIREBASE_PROJECT_ID is not configured.");
  }

  const decoded = jwt.decode(token, { complete: true });
  const keyId = decoded?.header?.kid;
  if (decoded?.header?.alg !== "RS256" || !keyId) {
    throw new Error("Invalid Firebase authentication token.");
  }

  const keys = await getCertificates();
  const certificate = keys[keyId];
  if (!certificate) {
    throw new Error("Firebase authentication token key is not recognized.");
  }

  const payload = jwt.verify(token, certificate, {
    algorithms: ["RS256"],
    audience: projectId,
    issuer: `https://securetoken.google.com/${projectId}`,
  });

  if (typeof payload !== "object" || !payload.sub) {
    throw new Error("Firebase authentication token has no user identity.");
  }

  return payload;
};

export const requireFirebaseAuth = async (req, res, next) => {
  const authorization = req.get("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "A Firebase sign-in token is required.",
    });
  }

  try {
    req.firebaseUser = await verifyFirebaseToken(token);
    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Your sign-in session is invalid or expired. Please sign in again.",
      });
    }
    return next(error);
  }
};
