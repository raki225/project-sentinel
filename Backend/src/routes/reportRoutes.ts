import { Router } from "express";
import { getReport } from "../controllers/reportController";

const router = Router();

/**
 * @openapi
 * /api/report/{id}:
 *   get:
 *     summary: Get the generated report for a document
 *     tags: [Report]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Report data }
 */
router.get("/:id", getReport);

export default router;
