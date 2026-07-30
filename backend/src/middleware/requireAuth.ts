import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const AUTH_COOKIE_NAME = "ipoflow_token";

declare global {
  namespace Express {
    interface Request {
      adminUsername?: string;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as { sub: string };
    req.adminUsername = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: "Not authenticated" });
  }
}
