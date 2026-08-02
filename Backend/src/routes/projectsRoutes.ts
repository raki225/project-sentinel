import { Router } from "express";
import { getProjectsMap } from "../controllers/mapController";

const router = Router();

/**
 * @openapi
 * /api/projects/map:
 *   get:
 *     summary: Get geocoded project points for map rendering
 *     tags: [Projects]
 *     responses:
 *       200: { description: List of project map points }
 */
router.get("/map", getProjectsMap);

export default router;
