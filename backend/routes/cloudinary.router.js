import { Router } from "express";
import { createProfilePhotoSignature } from "../controllers/cloudinary.controller.js";
import { requireFirebaseAuth } from "../utils/verifyFirebaseToken.js";

const router = Router();

router.post("/profile-photo-signature", requireFirebaseAuth, createProfilePhotoSignature);

export default router;
