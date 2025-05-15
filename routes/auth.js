import { Router } from "express";
import { signUp, signIn, me, signOut } from "../controllers/auth.js";
import authenticateToken from "../middleware/authenticateToken.js";

export const router = Router();

// router.post("/find-user", findUser);
// router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.post("/sign-out", signOut);
router.get("/me", authenticateToken, me);
