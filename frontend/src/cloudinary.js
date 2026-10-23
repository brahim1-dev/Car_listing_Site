import { updateProfile } from "firebase/auth";
import { auth } from "./firebase";

const maxImageSize = 5 * 1024 * 1024;

export const uploadProfilePhoto = async (file) => {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose an image file to use as your profile photo.");
  }
  if (file.size > maxImageSize) {
    throw new Error("Profile photos must be 5 MB or smaller.");
  }
  if (!auth?.currentUser) {
    throw new Error("You must be signed in to update your profile photo.");
  }

  const idToken = await auth.currentUser.getIdToken();
  const signatureResponse = await fetch("/api/cloudinary/profile-photo-signature", {
    method: "POST",
    headers: { Authorization: `Bearer ${idToken}` },
  });
  const signatureResult = await signatureResponse.json();
  if (!signatureResponse.ok) {
    throw new Error(
      signatureResult.message || "Could not authorize the profile photo upload.",
    );
  }

  const {
    apiKey,
    cloudName,
    folder,
    invalidate,
    overwrite,
    publicId,
    signature,
    timestamp,
  } = signatureResult.data;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("folder", folder);
  formData.append("invalidate", String(invalidate));
  formData.append("overwrite", String(overwrite));
  formData.append("public_id", publicId);
  formData.append("signature", signature);
  formData.append("timestamp", String(timestamp));

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
    { method: "POST", body: formData },
  );
  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error?.message || "Cloudinary could not upload the profile photo.",
    );
  }
  if (!result.secure_url) {
    throw new Error("Cloudinary upload did not return a secure image URL.");
  }

  const user = auth.currentUser;
  await updateProfile(user, { photoURL: result.secure_url });
  return user;
};
