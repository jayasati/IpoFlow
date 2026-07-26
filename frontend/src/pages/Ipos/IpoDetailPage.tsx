import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiError } from "../../api/client";
import { cloneIpo, deleteIpo, getIpo, updateIpoStatus } from "../../api/ipos";
import { Button } from "../../components/ui/Button";
import { useAsyncData } from "../../hooks/useAsyncData";
import type { Ipo, IpoStatus } from "../../types/ipo";
import { IpoApplicationsTab } from "./IpoApplicationsTab";
import { IPO_STATUS_BADGE_CLASSES } from "./ipoStatus";

const TABS = ["overview", "applications", "settlement", "timeline"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  overview: "Overview",
  applications: "Applications",
  settlement: "Settlement",
  timeline: "Timeline",
};

export function IpoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ipoId = Number(id);
  const [tab, setTab] = useState<Tab>("overview");
  const [actionError, setActionError] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const {
    data: ipo,
    setData: setIpo,
    loading,
    error,
    refetch,
  } = useAsyncData<Ipo>(() => getIpo(ipoId), [ipoId], "Failed to load IPO.");

  const handleStatusChange = async (status: IpoStatus) => {
    if (!ipo) return;
    setTransitioning(true);
    setActionError(null);
    try {
      const updated = await updateIpoStatus(ipo.id, status);
      setIpo(updated);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to update status.");
    } finally {
      setTransitioning(false);
    }
  };

  const handleClone = async () => {
    if (!ipo) return;
    try {
      const clone = await cloneIpo(ipo.id);
      navigate(`/ipos/${clone.id}`);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to clone IPO.");
    }
  };

  const handleDelete = async () => {
    if (!ipo) return;
    if (!confirm(`Delete IPO "${ipo.company}"? This cannot be undone.`)) return;
    try {
      await deleteIpo(ipo.id);
      navigate("/ipos");
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to delete IPO.");
    }
  };

  if (loading && !ipo) {
    return <p className="text-sm text-slate-400">Loading…</p>;
  }

  if (error && !ipo) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!ipo) {
    return null;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate("/ipos")}
        className="mb-2 text-sm text-slate-500 hover:text-slate-700"
      >
        ← Back to IPOs
      </button>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{ipo.company}</h1>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${IPO_STATUS_BADGE_CLASSES[ipo.status]}`}
          >
            {ipo.status}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => void handleClone()}>
            Clone
          </Button>
          <Button variant="danger" onClick={() => void handleDelete()}>
            Delete
          </Button>
        </div>
      </div>

      {actionError ? <p className="mt-2 text-sm text-red-600">{actionError}</p> : null}

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

      <div className="mt-4">
        {tab === "overview" ? (
          <div className="grid max-w-xl grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-white p-4 text-sm">
            <div>
              <p className="text-slate-500">Issue Price</p>
              <p className="font-medium text-slate-900">{ipo.issuePrice}</p>
            </div>
            <div>
              <p className="text-slate-500">Lot Size</p>
              <p className="font-medium text-slate-900">{ipo.lotSize}</p>
            </div>
            <div>
              <p className="text-slate-500">Applications</p>
              <p className="font-medium text-slate-900">{ipo._count.applications}</p>
            </div>
            <div>
              <p className="text-slate-500">Created</p>
              <p className="font-medium text-slate-900">
                {new Date(ipo.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="col-span-2">
              <p className="mb-2 text-slate-500">Status</p>
              {ipo.allowedNextStatuses.length === 0 ? (
                <p className="text-slate-400">Final status — no further transitions.</p>
              ) : (
                <div className="flex gap-2">
                  {ipo.allowedNextStatuses.map((next) => (
                    <Button
                      key={next}
                      variant="secondary"
                      disabled={transitioning}
                      onClick={() => void handleStatusChange(next)}
                    >
                      Move to {next}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {tab === "applications" ? (
          <IpoApplicationsTab ipo={ipo} onApplicationsChanged={refetch} />
        ) : null}

        {tab === "settlement" ? (
          <p className="text-sm text-slate-500">
            Settlement will be available in a later milestone.
          </p>
        ) : null}

        {tab === "timeline" ? (
          <p className="text-sm text-slate-500">Timeline will be available in a later milestone.</p>
        ) : null}
      </div>
    </div>
  );
}
