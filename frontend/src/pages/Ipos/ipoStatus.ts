import type { IpoStatus } from "../../types/ipo";

export const IPO_STATUS_OPTIONS: IpoStatus[] = [
  "DRAFT",
  "OPEN",
  "APPLIED",
  "ALLOTTED",
  "SOLD",
  "SETTLED",
  "COMPLETE",
];

/** Mirrors the backend's ipoStateMachine.ts — statuses during which the "Add Applications" action is offered. */
export const APPLICATION_ACCEPTING_STATUSES: IpoStatus[] = ["DRAFT", "OPEN"];

export const IPO_STATUS_BADGE_CLASSES: Record<IpoStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  OPEN: "bg-blue-100 text-blue-700",
  APPLIED: "bg-amber-100 text-amber-700",
  ALLOTTED: "bg-purple-100 text-purple-700",
  SOLD: "bg-indigo-100 text-indigo-700",
  SETTLED: "bg-teal-100 text-teal-700",
  COMPLETE: "bg-emerald-100 text-emerald-700",
};
