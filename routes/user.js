import { Router } from "express";
import { allUsers, getUserBookings } from "../controllers/user.js";

export const router = Router();

// Routes
router.post("/bookings", getUserBookings);

// Protected Routes
router.get("/", allUsers);
