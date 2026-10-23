import { createHash, randomUUID } from "node:crypto";
import { errorHandle } from "../utils/error.js";

const readCloudinaryConfig = () => {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (!cloudinaryUrl) {
    throw errorHandle(500, "CLOUDINARY_URL is not configured on the server.");
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(cloudinaryUrl);
  } catch {
    throw errorHandle(500, "CLOUDINARY_URL is invalid.");
  }

  const apiKey = decodeURIComponent(parsedUrl.username);
  const apiSecret = decodeURIComponent(parsedUrl.password);
  const cloudName = parsedUrl.hostname;
  if (
    parsedUrl.protocol !== "cloudinary:" ||
    !apiKey ||
    !apiSecret ||
    !cloudName
  ) {
    throw errorHandle(500, "CLOUDINARY_URL is incomplete or invalid.");
  }

  return { apiKey, apiSecret, cloudName };
};

const getCloudinaryTimestamp = async (cloudName) => {
  let response;
  try {
    response = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
      { method: "OPTIONS", cache: "no-store" },
    );
  } catch {
    throw errorHandle(502, "Could not retrieve the current Cloudinary server time.");
  }

  const serverDate = response.headers.get("date");
  const timestamp = serverDate ? Date.parse(serverDate) : Number.NaN;
  if (!response.ok || !Number.isFinite(timestamp)) {
    throw errorHandle(502, "Cloudinary did not provide a valid server timestamp.");
  }

  return Math.floor(timestamp / 1000);
};

export const createProfilePhotoSignature = async (req, res, next) => {
  try {
    const { apiKey, apiSecret, cloudName } = readCloudinaryConfig();
    const folder = `car-listing-site/profile-photos/${req.firebaseUser.sub}`;
    const publicId = "avatar";
    const timestamp = await getCloudinaryTimestamp(cloudName);
    const params = {
      folder,
      invalidate: "true",
      overwrite: "true",
      public_id: publicId,
      timestamp: String(timestamp),
    };
    const signaturePayload = Object.entries(params)
      .sort(([first], [second]) => first.localeCompare(second))
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
    const signature = createHash("sha1")
      .update(`${signaturePayload}${apiSecret}`)
      .digest("hex");

    return res.status(200).json({
      success: true,
      data: {
        apiKey,
        cloudName,
        folder,
        invalidate: true,
        overwrite: true,
        publicId,
        timestamp,
        signature,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const createCarImageSignature = async (req, res, next) => {
  try {
    const { apiKey, apiSecret, cloudName } = readCloudinaryConfig();
    const folder = `car-listing-site/car-images/${req.firebaseUser.sub}`;
    const publicId = `car_${randomUUID()}`;
    const timestamp = await getCloudinaryTimestamp(cloudName);
    const params = {
      folder,
      public_id: publicId,
      timestamp: String(timestamp),
    };
    const signaturePayload = Object.entries(params)
      .sort(([first], [second]) => first.localeCompare(second))
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
    const signature = createHash("sha1")
      .update(`${signaturePayload}${apiSecret}`)
      .digest("hex");

    return res.status(200).json({
      success: true,
      data: {
        apiKey,
        cloudName,
        folder,
        publicId,
        timestamp,
        signature,
      },
    });
  } catch (error) {
    return next(error);
  }
};
