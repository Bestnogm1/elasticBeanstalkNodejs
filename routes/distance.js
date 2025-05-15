import { Router } from "express";
import { checkDistance } from "../controllers/distance.js";

export const router = Router();

router.post("/", checkDistance);
