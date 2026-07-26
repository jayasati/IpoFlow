import { useState } from "react";
import { listApplications } from "../../api/applications";
import { DataTable } from "../../components/table/DataTable";
import type { Column } from "../../components/table/DataTable";
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
    error,
    loading,
    refetch,
  } = useAsyncData(() => listApplications(ipo.id), [ipo.id], "Failed to load applications.");

  const canAddApplications = APPLICATION_ACCEPTING_STATUSES.includes(ipo.status);
  const applications = result?.data ?? [];

  const columns: Column<Application>[] = [
    { key: "member", header: "Member", render: (a) => a.member.name },
    { key: "lots", header: "Lots", render: (a) => `${a.lots}` },
    { key: "shares", header: "Shares Allotted", render: (a) => `${a.shares}` },
    { key: "status", header: "Status", render: (a) => a.status },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
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
