import { ValidationError } from "../errors/AppError";
import { IpoStatus } from "../generated/prisma/client";

const TRANSITIONS: Record<IpoStatus, IpoStatus[]> = {
  DRAFT: [IpoStatus.OPEN],
  OPEN: [IpoStatus.APPLIED],
  APPLIED: [IpoStatus.ALLOTTED],
  ALLOTTED: [IpoStatus.SOLD],
  SOLD: [IpoStatus.SETTLED],
  SETTLED: [IpoStatus.COMPLETE],
  COMPLETE: [],
};

/** Statuses during which new applications may still be created for an IPO. */
export const APPLICATION_ACCEPTING_STATUSES: IpoStatus[] = [IpoStatus.DRAFT, IpoStatus.OPEN];

export function getAllowedNextStatuses(current: IpoStatus): IpoStatus[] {
  return TRANSITIONS[current];
}

export function assertValidTransition(current: IpoStatus, next: IpoStatus): void {
  const allowed = TRANSITIONS[current];
  if (!allowed.includes(next)) {
    const allowedList = allowed.length > 0 ? allowed.join(", ") : "none (final status)";
    throw new ValidationError(
      `Cannot move IPO from ${current} to ${next}. Allowed next status: ${allowedList}.`,
    );
  }
}
