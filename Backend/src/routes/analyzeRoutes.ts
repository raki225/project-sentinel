import { Router } from "express";
import { analyzeDocument } from "../controllers/analyzeController";

const router = Router();

/**
 * @openapi
 * /api/analyze/{id}:
 *   post:
 *     summary: Run OCR/text extraction + AI analysis on an uploaded document
 *     tags: [Analyze]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Structured analysis result }
 */
router.post("/:id", analyzeDocument);

export default router;
