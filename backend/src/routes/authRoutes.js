import express from "express";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

// Endpoints: /api/auth/register iyo /api/auth/login
router.post("/register", register);
router.post("/login", login);

export default router;
