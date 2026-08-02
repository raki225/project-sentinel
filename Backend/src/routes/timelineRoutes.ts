import { Router } from "express";
import { getTimeline } from "../controllers/timelineController";

const router = Router();

/**
 * @openapi
 * /api/timeline/{id}:
 *   get:
 *     summary: Get the project timeline for a document
 *     tags: [Timeline]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Timeline data }
 */
router.get("/:id", getTimeline);

export default router;
