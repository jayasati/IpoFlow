import { useState } from "react";
import { listApplications } from "../../api/applications";
import { ApiError } from "../../api/client";
import { createSettlement } from "../../api/settlement";
import { DataTable } from "../../components/table/DataTable";
import type { Column } from "../../components/table/DataTable";
import { useAsyncData } from "../../hooks/useAsyncData";
import type { Application } from "../../types/application";
import type { Ipo } from "../../types/ipo";
import { formatCurrency } from "../../utils/format";
import { RecordSaleModal } from "./RecordSaleModal";

interface IpoSettlementTabProps {
  ipo: Ipo;
}

const SELLABLE_STATUSES: Application["status"][] = ["ALLOTTED", "PARTIALLY_SOLD"];

export function IpoSettlementTab({ ipo }: IpoSettlementTabProps) {
  const [saleTarget, setSaleTarget] = useState<Application | null>(null);
  const [settlingId, setSettlingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    data: result,
    loading,
    refetch,
  } = useAsyncData(() => listApplications(ipo.id), [ipo.id], "Failed to load applications.");

  const applications = result?.data ?? [];

  const handleSettle = async (application: Application) => {
    setSettlingId(application.id);
    setError(null);
    setMessage(null);
    try {
      const outcome = await createSettlement(application.id);
      const name = application.member?.name ?? "Member";
      setMessage(
        `${name}: ${outcome.isProfit ? "Profit" : "Loss"} ${formatCurrency(outcome.profitOrLoss)}.`,
      );
      refetch();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to settle application.");
    } finally {
      setSettlingId(null);
    }
  };

  const columns: Column<Application>[] = [
    { key: "member", header: "Member", render: (a) => a.member?.name ?? "—" },
    { key: "shares", header: "Shares Allotted", render: (a) => `${a.shares}` },
    { key: "status", header: "Status", render: (a) => a.status },
    {
      key: "actions",
      header: "",
      render: (a) => (
        <div className="flex gap-3 text-xs font-medium">
          {SELLABLE_STATUSES.includes(a.status) ? (
            <button
              type="button"
              onClick={() => setSaleTarget(a)}
              className="text-slate-600 hover:text-slate-900"
            >
              Record Sale
            </button>
          ) : null}
          {a.status === "SOLD" ? (
            <button
              type="button"
              disabled={settlingId === a.id}
              onClick={() => void handleSettle(a)}
              className="text-slate-600 hover:text-slate-900 disabled:opacity-50"
            >
              {settlingId === a.id ? "Settling…" : "Settle"}
            </button>
          ) : null}
          {a.status === "SETTLED" ? <span className="text-emerald-600">Settled</span> : null}
        </div>
      ),
    },
  ];

  return (
    <div>
      {message ? <p className="mb-2 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}

      <DataTable
        columns={columns}
        rows={applications}
        getRowId={(a) => a.id}
        loading={loading}
        emptyMessage="No applications yet. Add applications first."
      />

      {saleTarget ? (
        <RecordSaleModal
          open={saleTarget !== null}
          applicationId={saleTarget.id}
          onClose={() => setSaleTarget(null)}
          onRecorded={() => {
            setSaleTarget(null);
            refetch();
          }}
        />
      ) : null}
    </div>
  );
}
