import { Router } from "express";
import { acceptPayment } from "../controllers/stripe.js";

export const router = Router();

// Post
router.post("/", acceptPayment);
