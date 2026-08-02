import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../middleware/errorHandler";
import { isDbConnected } from "../config/database";

import { UserRole } from "../models/User";

function signToken(userId: string, email: string, role: UserRole): string {
  return jwt.sign({ userId, email, role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);
}

// Fallback demo accounts if database is empty or seed is needed
const DEMO_ACCOUNTS: Record<string, { name: string; role: UserRole; department?: string; organization?: string; designation?: string }> = {
  "admin@sentinel.gov": {
    name: "Dr. Rajesh Kumar",
    role: "super_admin",
    department: "Cabinet Secretariat & Infrastructure Oversight",
    organization: "Project Sentinel Command Center",
    designation: "National Platform Director",
  },
  "pwd.hyderabad@gov.in": {
    name: "Er. Vikram Reddy",
    role: "government",
    department: "Public Works Department (PWD)",
    organization: "Telangana Infrastructure Board",
    designation: "Superintending Engineer",
  },
  "vendor@abcinfra.com": {
    name: "Suresh Mehta",
    role: "vendor",
    department: "Contracting & Engineering",
    organization: "ABC Infrastructure Ltd.",
    designation: "Project Director",
  },
  "auditor@sentinel.gov": {
    name: "Ananya Sharma",
    role: "auditor",
    department: "CAG Infrastructure Audit Division",
    organization: "National Audit & Integrity Commission",
    designation: "Chief Forensic Auditor",
  },
  "citizen@example.com": {
    name: "Aarav Patel",
    role: "citizen",
    department: "Public Grievances",
    organization: "Citizen Transparency Portal",
    designation: "Verified Citizen Representative",
  },
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role, department, organization, designation } = req.body;

  if (!isDbConnected()) {
    const demoRole = (role as UserRole) || "government";
    const token = signToken(`demo-${demoRole}`, email, demoRole);
    res.status(201).json({
      success: true,
      token,
      user: {
        id: `demo-${demoRole}`,
        name: name || "Demo User",
        email: email.toLowerCase(),
        role: demoRole,
        department,
        organization,
        designation,
      },
    });
    return;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("An account with this email already exists", 409);
  }

  const user = await User.create({ name, email, password, role, department, organization, designation });
  const token = signToken(user.id, user.email, user.role);

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      organization: user.organization,
      designation: user.designation,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!isDbConnected()) {
    const demo = DEMO_ACCOUNTS[email.toLowerCase()] ?? DEMO_ACCOUNTS["admin@sentinel.gov"];
    const token = signToken(`demo-${demo.role}`, email, demo.role);
    res.status(200).json({
      success: true,
      token,
      user: {
        id: `demo-${demo.role}`,
        name: demo.name,
        email: email.toLowerCase(),
        role: demo.role,
        department: demo.department,
        organization: demo.organization,
        designation: demo.designation,
      },
    });
    return;
  }

  let user = await User.findOne({ email }).select("+password");
  
  if (!user && DEMO_ACCOUNTS[email.toLowerCase()]) {
    const demo = DEMO_ACCOUNTS[email.toLowerCase()];
    const token = signToken(`demo-${demo.role}`, email, demo.role);
    res.status(200).json({
      success: true,
      token,
      user: {
        id: `demo-${demo.role}`,
        name: demo.name,
        email: email.toLowerCase(),
        role: demo.role,
        department: demo.department,
        organization: demo.organization,
        designation: demo.designation,
      },
    });
    return;
  }

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken(user.id, user.email, user.role);

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      organization: user.organization,
      designation: user.designation,
    },
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    throw new AppError("No token provided", 401);
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as { userId: string; email: string; role: UserRole };
    const newToken = signToken(decoded.userId, decoded.email, decoded.role);
    res.status(200).json({
      success: true,
      token: newToken,
    });
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    throw new AppError("Unauthorized", 401);
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as { userId: string; email: string; role: UserRole };
    const demo = DEMO_ACCOUNTS[decoded.email.toLowerCase()] ?? DEMO_ACCOUNTS["admin@sentinel.gov"];

    if (!isDbConnected() || demo) {
      res.status(200).json({
        success: true,
        user: {
          id: decoded.userId,
          name: demo.name,
          email: decoded.email,
          role: decoded.role,
          department: demo.department,
          organization: demo.organization,
          designation: demo.designation,
        },
      });
      return;
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        organization: user.organization,
        designation: user.designation,
      },
    });
  } catch {
    throw new AppError("Invalid token", 401);
  }
});
