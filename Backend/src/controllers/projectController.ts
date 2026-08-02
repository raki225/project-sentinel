import { Response } from "express";
import mongoose, { FilterQuery } from "mongoose";
import { Project, IProject } from "../models/Project";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthenticatedRequest } from "../types";
import { findProjectsPreferReal } from "../services/projectService";

export const listProjects = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const { state, department, status, q } = req.query;

  const filter: FilterQuery<IProject> = {};
  if (typeof state === "string" && state) filter.state = state;
  if (typeof department === "string" && department) filter.department = department;
  if (typeof status === "string" && status) filter.status = status;
  if (typeof q === "string" && q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ project: rx }, { department: rx }, { state: rx }, { district: rx }, { contractor: rx }];
  }

  const { projects: allMatching, isDemo } = await findProjectsPreferReal(filter);
  const total = allMatching.length;
  const projects = allMatching.slice((page - 1) * limit, page * limit);

  res.status(200).json({
    success: true,
    isDemo,
    projects,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  });
});

export const getProjectById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid project id", 400);
  }

  const project = await Project.findById(id);
  if (!project) {
    throw new AppError("Project not found", 404);
  }

  res.status(200).json({ success: true, project });
});
