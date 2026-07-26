import { useEffect, useState } from "react";
import { getHealth } from "../../api/health";

export function DashboardPage() {
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    getHealth()
      .then(() => setApiStatus("online"))
      .catch(() => setApiStatus("offline"));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-sm text-slate-500">
        Dashboard cards (Active IPOs, Capital Used, Wallet Outstanding, Profit, Pending Returns)
        will be added in a later milestone.
      </p>
      <p className="mt-4 text-xs text-slate-400">
        API status:{" "}
        <span
          className={
            apiStatus === "online"
              ? "text-emerald-600"
              : apiStatus === "offline"
                ? "text-red-600"
                : "text-slate-400"
          }
        >
          {apiStatus}
        </span>
      </p>
    </div>
  );
}
