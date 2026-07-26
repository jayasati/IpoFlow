import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/client";
import { AppError } from "../errors/AppError";

function mapPrismaError(err: Prisma.PrismaClientKnownRequestError): AppError {
  switch (err.code) {
    case "P2025":
      return new AppError("Resource not found", 404);
    case "P2002":
      return new AppError("A record with these values already exists", 409, err.meta);
    case "P2003":
      return new AppError("This record is referenced by other data and cannot be modified", 409);
    default:
      return new AppError("Database request failed", 500);
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const resolved =
    err instanceof AppError
      ? err
      : err instanceof Prisma.PrismaClientKnownRequestError
        ? mapPrismaError(err)
        : err instanceof ZodError
          ? new AppError("Invalid request data", 400, err.flatten())
          : null;

  if (resolved) {
    if (resolved.statusCode >= 500) {
      console.error(err);
    }
    res.status(resolved.statusCode).json({
      error: resolved.message,
      ...(resolved.details ? { details: resolved.details } : {}),
    });
    return;
  }

  console.error(err);
  const message = err instanceof Error ? err.message : "Internal server error";
  res.status(500).json({ error: message });
}
