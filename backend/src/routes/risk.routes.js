import express from "express";
import { getMyRisk } from "../controllers/risk.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/drops/:dropId/risk", requireAuth, getMyRisk);

export default router;
