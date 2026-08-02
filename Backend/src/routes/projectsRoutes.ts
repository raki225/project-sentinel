import { Router } from "express";
import { getProjectsMap } from "../controllers/mapController";
import { listProjects, getProjectById } from "../controllers/projectController";

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

/**
 * @openapi
 * /api/projects:
 *   get:
 *     summary: List/search/filter projects (real government data, or demo data if none is synced yet)
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: state
 *         schema: { type: string }
 *       - in: query
 *         name: department
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [verified, pending, flagged] }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *     responses:
 *       200: { description: Paginated list of projects }
 */
router.get("/", listProjects);

/**
 * @openapi
 * /api/projects/{id}:
 *   get:
 *     summary: Get a single project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Project detail }
 */
router.get("/:id", getProjectById);

export default router;
