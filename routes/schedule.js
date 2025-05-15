import { Router } from "express";
import { checkDay, updateSchedule } from "../controllers/schedule.js";

export const router = Router();

// Get
router.get("/check-day/:id", checkDay);

// Post
router.post("/update-schedule", updateSchedule);
