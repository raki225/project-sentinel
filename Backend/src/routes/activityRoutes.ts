import { Router } from "express";
import { getLiveActivity } from "../controllers/activityController";

const router = Router();

/**
 * @openapi
 * /api/activity/live:
 *   get:
 *     summary: Get recent AI/audit activity, newest first
 *     tags: [Activity]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Recent activity feed }
 */
router.get("/live", getLiveActivity);

export default router;
