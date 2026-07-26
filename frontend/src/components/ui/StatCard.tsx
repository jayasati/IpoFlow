import type { ReactNode } from "react";

type Tone = "neutral" | "good" | "critical";

interface StatCardProps {
  label: string;
  value: ReactNode;
  tone?: Tone;
}

// Status palette (reserved, never reused for categorical series) - direction of a delta.
const TONE_CLASSES: Record<Tone, string> = {
  neutral: "text-slate-900",
  good: "text-[#0ca30c]",
  critical: "text-[#d03b3b]",
};

export function StatCard({ label, value, tone = "neutral" }: StatCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${TONE_CLASSES[tone]}`}>{value}</p>
    </div>
  );
}
