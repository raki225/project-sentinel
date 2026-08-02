import { Router } from "express";
import { listDocuments, deleteDocument } from "../controllers/documentController";

const router = Router();

/**
 * @openapi
 * /api/documents:
 *   get:
 *     summary: List uploaded documents
 *     tags: [Documents]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [uploaded, processing, analyzed, failed] }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [pdf, docx, png, jpg, jpeg] }
 *     responses:
 *       200: { description: Paginated list of documents }
 */
router.get("/", listDocuments);

/**
 * @openapi
 * /api/documents/{id}:
 *   delete:
 *     summary: Delete a document and its report
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Document deleted }
 */
router.delete("/:id", deleteDocument);

export default router;
