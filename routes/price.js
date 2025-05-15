import { Router } from "express";
import { getPrice } from "../controllers/price.js";

export const router = Router();

// Routes
router.post("/", getPrice);
