import express from "express";

import {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent
} from "../controllers/event.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

// Create
router.post("/", requireAuth, requireRole("ADMIN"), createEvent);

// List
router.get("/", getEvents);

// Single event
router.get("/:eventId", getEvent);

// Update
router.patch("/:eventId", requireAuth, requireRole("ADMIN"), updateEvent);

// Delete
router.delete("/:eventId", requireAuth, requireRole("ADMIN"), deleteEvent);

export default router;