import { Router } from "express";
import { uploadDocument } from "../controllers/uploadController";
import { upload } from "../middleware/upload";

const router = Router();

/**
 * @openapi
 * /api/upload:
 *   post:
 *     summary: Upload a document (PDF, DOCX, PNG, JPG, JPEG)
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       201: { description: File stored }
 */
router.post("/", upload.single("file"), uploadDocument);

export default router;
