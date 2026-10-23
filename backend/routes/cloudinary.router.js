import { Router } from "express";
import {
  createCarImageSignature,
  createProfilePhotoSignature,
} from "../controllers/cloudinary.controller.js";
import { requireFirebaseAuth } from "../utils/verifyFirebaseToken.js";

const router = Router();

router.post("/profile-photo-signature", requireFirebaseAuth, createProfilePhotoSignature);
router.post("/car-image-signature", requireFirebaseAuth, createCarImageSignature);

export default router;
