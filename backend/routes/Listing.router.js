import { Router } from "express";
import {
  createListing,
  deleteListing,
  getListing,
  getListingContact,
  getListings,
  getMyListings,
  syncMyListingContact,
  updateListing,
} from "../controllers/listing.controller.js";
import { requireFirebaseAuth } from "../utils/verifyFirebaseToken.js";

const router = Router();

router.get("/", getListings);
router.get("/mine", requireFirebaseAuth, getMyListings);
router.patch("/mine/contact", requireFirebaseAuth, syncMyListingContact);
router.get("/:id/contact", requireFirebaseAuth, getListingContact);
router.get("/:id", getListing);
router.post("/", requireFirebaseAuth, createListing);
router.patch("/:id", requireFirebaseAuth, updateListing);
router.delete("/:id", requireFirebaseAuth, deleteListing);

export default router;