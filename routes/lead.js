import { Router } from "express";
import { acceptLead, acceptCommercialLead } from "../controllers/lead.js";

export const router = Router();

router.post("/", acceptLead);

router.post("/commercial", acceptCommercialLead);
