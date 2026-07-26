import { useState } from "react";
import { GroupsPanel } from "./GroupsPanel";
import { MembersPanel } from "./MembersPanel";

const TABS = ["members", "groups"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  members: "Members",
  groups: "Participant Groups",
};

export function MembersPage() {
  const [tab, setTab] = useState<Tab>("members");

  return (
    <div>
      <h1 className="text-2xl font-semibold">Members</h1>
      <div className="mt-4 flex gap-2 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              tab === t
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>
      <div className="mt-4">{tab === "members" ? <MembersPanel /> : <GroupsPanel />}</div>
    </div>
  );
}
