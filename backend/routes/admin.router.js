import { Router } from "express";
import {
  deleteAdminUser,
  getAdminAccess,
  getAdminUsers,
} from "../controllers/admin.controller.js";
import { requireAdmin } from "../utils/requireAdmin.js";
import { requireFirebaseAuth } from "../utils/verifyFirebaseToken.js";

const router = Router();

router.get("/access", requireFirebaseAuth, getAdminAccess);
router.get("/users", requireFirebaseAuth, requireAdmin, getAdminUsers);
router.delete("/users/:uid", requireFirebaseAuth, requireAdmin, deleteAdminUser);

export default router;
