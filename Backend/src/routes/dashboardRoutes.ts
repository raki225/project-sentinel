import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboardController";

const router = Router();

/**
 * @openapi
 * /api/dashboard:
 *   get:
 *     summary: Get aggregate dashboard statistics
 *     tags: [Dashboard]
 *     responses:
 *       200: { description: Dashboard statistics }
 */
router.get("/", getDashboardStats);

export default router;
