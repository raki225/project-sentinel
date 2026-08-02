import { FilterQuery } from "mongoose";
import { Project, IProject } from "../models/Project";

/**
 * Prefers real (non-demo) projects; only falls back to the labeled demo
 * dataset when zero real projects match. This is the server-side mirror of
 * the frontend's existing "Demo mode" fallback in project-map.tsx — once
 * any real government data exists, demo records disappear from every
 * consuming endpoint rather than being mixed in alongside real ones.
 */
export async function findProjectsPreferReal(
  filter: FilterQuery<IProject> = {}
): Promise<{ projects: IProject[]; isDemo: boolean }> {
  const real = await Project.find({ ...filter, isDemo: false }).sort({ createdAt: -1 });
  if (real.length > 0) return { projects: real, isDemo: false };

  const demo = await Project.find({ ...filter, isDemo: true }).sort({ createdAt: -1 });
  return { projects: demo, isDemo: true };
}
