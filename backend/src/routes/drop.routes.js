import express from "express";

import {
  createDrop,
  getDrop,
  updateDrop,
  startDrop,
  closeDrop
} from "../controllers/drop.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", requireAuth, requireRole("ADMIN"), createDrop);

router.get("/:dropId", getDrop);

router.patch("/:dropId", requireAuth, requireRole("ADMIN"), updateDrop);

router.post("/:dropId/start", requireAuth, requireRole("ADMIN"), startDrop);

router.post("/:dropId/close", requireAuth, requireRole("ADMIN"), closeDrop);

export default router;