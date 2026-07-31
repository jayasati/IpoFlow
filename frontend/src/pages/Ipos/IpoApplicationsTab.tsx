import { useState } from "react";
import { listApplications, updateAllotment, updateFundingSource } from "../../api/applications";
import { ApiError } from "../../api/client";
import { DataTable } from "../../components/table/DataTable";
import type { Column } from "../../components/table/DataTable";
import { EditableCell } from "../../components/table/EditableCell";
import { Button } from "../../components/ui/Button";
import { useAsyncData } from "../../hooks/useAsyncData";
import type { Application } from "../../types/application";
import type { Ipo } from "../../types/ipo";
import { AddApplicationsModal } from "./AddApplicationsModal";
import { APPLICATION_ACCEPTING_STATUSES } from "./ipoStatus";

interface IpoApplicationsTabProps {
  ipo: Ipo;
  onApplicationsChanged: () => void;
}

export function IpoApplicationsTab({ ipo, onApplicationsChanged }: IpoApplicationsTabProps) {
  const [addOpen, setAddOpen] = useState(false);

  const {
    data: result,
    setData: setResult,
    error,
    setError,
    loading,
    refetch,
  } = useAsyncData(() => listApplications(ipo.id), [ipo.id], "Failed to load applications.");

  const canAddApplications = APPLICATION_ACCEPTING_STATUSES.includes(ipo.status);
  const applications = result?.data ?? [];

  const handleAllotmentSave = async (application: Application, shares: string) => {
    try {
      const updated = await updateAllotment(application.id, Number(shares));
      setResult((prev) =>
        prev ? { data: prev.data.map((a) => (a.id === updated.id ? updated : a)) } : prev,
      );
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update allotment.");
    }
  };

  const handleFundingToggle = async (application: Application) => {
    const next = application.fundingSource === "SELF" ? "OPERATOR" : "SELF";
    try {
      const updated = await updateFundingSource(application.id, next);
      setResult((prev) =>
        prev ? { data: prev.data.map((a) => (a.id === updated.id ? updated : a)) } : prev,
      );
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update funding source.");
    }
  };

  const columns: Column<Application>[] = [
    { key: "member", header: "Member", render: (a) => a.member?.name ?? "—" },
    { key: "lots", header: "Lots", render: (a) => `${a.lots}` },
    {
      key: "shares",
      header: "Shares Allotted",
      render: (a) => (
        <EditableCell
          value={String(a.shares)}
          type="number"
          onSave={(v) => handleAllotmentSave(a, v)}
        />
      ),
    },
    { key: "status", header: "Status", render: (a) => a.status },
    {
      key: "funding",
      header: "Funding",
      render: (a) =>
        a.status === "SETTLED" ? (
          a.fundingSource === "SELF" ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              Self-funded
            </span>
          ) : (
            <span className="text-xs text-slate-400">Operator</span>
          )
        ) : (
          <button
            type="button"
            onClick={() => void handleFundingToggle(a)}
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              a.fundingSource === "SELF"
                ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {a.fundingSource === "SELF" ? "Self-funded" : "Operator"}
          </button>
        ),
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {applications.length} application{applications.length === 1 ? "" : "s"}
        </p>
        {canAddApplications ? (
          <Button onClick={() => setAddOpen(true)}>Add Applications</Button>
        ) : null}
      </div>

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      <div className="mt-3">
        <DataTable
          columns={columns}
          rows={applications}
          getRowId={(a) => a.id}
          loading={loading}
          emptyMessage="No applications yet."
        />
      </div>

      <AddApplicationsModal
        open={addOpen}
        ipoId={ipo.id}
        existingMemberIds={new Set(applications.map((a) => a.memberId))}
        onClose={() => setAddOpen(false)}
        onAdded={() => {
          setAddOpen(false);
          refetch();
          onApplicationsChanged();
        }}
      />
    </div>
  );
}
