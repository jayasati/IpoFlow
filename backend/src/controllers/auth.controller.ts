import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";
import { AUTH_COOKIE_NAME } from "../middleware/requireAuth";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE_MS,
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { username, password } = loginSchema.parse(req.body);

  const validUsername = username === env.adminUsername;
  const validPassword = await bcrypt.compare(password, env.adminPasswordHash);

  if (!validUsername || !validPassword) {
    throw new AppError("Invalid username or password", 401);
  }

  const token = jwt.sign({ sub: username }, env.jwtSecret, { expiresIn: "7d" });
  setAuthCookie(res, token);
  res.json({ username });
}

export function logout(_req: Request, res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME);
  res.status(204).send();
}

export function me(req: Request, res: Response): void {
  res.json({ username: req.adminUsername });
}
