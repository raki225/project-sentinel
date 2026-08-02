import { Router } from "express";
import { register, login, logout, refresh, getProfile } from "../controllers/authController";
import { validateBody } from "../middleware/validate";
import { registerSchema, loginSchema } from "../utils/schemas";

const router = Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/profile", getProfile);

export default router;
