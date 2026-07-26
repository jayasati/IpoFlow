import { useEffect, useState } from "react";
import { getHealth } from "./api/health";

function App() {
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    getHealth()
      .then(() => setApiStatus("online"))
      .catch(() => setApiStatus("offline"));
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 text-slate-900">
      <h1 className="text-3xl font-semibold">IPOFlow</h1>
      <p className="text-sm text-slate-500">
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

export default App;
