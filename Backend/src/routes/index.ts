import { Router } from "express";
import authRoutes from "./authRoutes";
import uploadRoutes from "./uploadRoutes";
import analyzeRoutes from "./analyzeRoutes";
import reportRoutes from "./reportRoutes";
import documentRoutes from "./documentRoutes";
import dashboardRoutes from "./dashboardRoutes";
import timelineRoutes from "./timelineRoutes";
import projectsRoutes from "./projectsRoutes";
import activityRoutes from "./activityRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/upload", uploadRoutes);
router.use("/analyze", analyzeRoutes);
router.use("/report", reportRoutes);
router.use("/documents", documentRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/timeline", timelineRoutes);
router.use("/projects", projectsRoutes);
router.use("/activity", activityRoutes);

export default router;
