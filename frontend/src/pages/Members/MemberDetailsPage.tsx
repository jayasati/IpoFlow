import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { listApplicationsByMember } from "../../api/applications";
import { getLedger } from "../../api/ledger";
import { getMember } from "../../api/members";
import { DataTable } from "../../components/table/DataTable";
import type { Column } from "../../components/table/DataTable";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
import { useAsyncData } from "../../hooks/useAsyncData";
import type { Application } from "../../types/application";
import type { LedgerEntry } from "../../types/ledger";
import { formatCurrency } from "../../utils/format";
import { MoneyMovementModal } from "./MoneyMovementModal";

export function MemberDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const memberId = Number(id);
  const [movementType, setMovementType] = useState<
    "sent" | "returned" | "commission" | "adjustment" | null
  >(null);

  const {
    data: member,
    loading: memberLoading,
    error: memberError,
  } = useAsyncData(() => getMember(memberId), [memberId], "Failed to load member.");

  const {
    data: ledgerResult,
    loading: ledgerLoading,
    error: ledgerError,
    refetch: refetchLedger,
  } = useAsyncData(() => getLedger(memberId), [memberId], "Failed to load ledger.");

  const { data: applicationsResult, loading: applicationsLoading } = useAsyncData(
    () => listApplicationsByMember(memberId),
    [memberId],
    "Failed to load IPO history.",
  );

  if (memberLoading && !member) {
    return <p className="text-sm text-slate-400">Loading…</p>;
  }
  if (memberError && !member) {
    return <p className="text-sm text-red-600">{memberError}</p>;
  }
  if (!member) {
    return null;
  }

  const wallet = ledgerResult?.wallet;
  const ledgerEntries = ledgerResult?.data ?? [];
  const applications = applicationsResult?.data ?? [];

  const ledgerColumns: Column<LedgerEntry>[] = [
    { key: "createdAt", header: "Date", render: (e) => new Date(e.createdAt).toLocaleString() },
    { key: "type", header: "Type", render: (e) => e.type },
    {
      key: "credit",
      header: "Credit",
      render: (e) => (Number(e.credit) > 0 ? formatCurrency(e.credit) : "—"),
    },
    {
      key: "debit",
      header: "Debit",
      render: (e) => (Number(e.debit) > 0 ? formatCurrency(e.debit) : "—"),
    },
    { key: "description", header: "Description", render: (e) => e.description ?? "—" },
  ];

  const historyColumns: Column<Application>[] = [
    { key: "company", header: "IPO", render: (a) => a.ipo?.company ?? "—" },
    { key: "lots", header: "Lots", render: (a) => `${a.lots}` },
    { key: "shares", header: "Shares", render: (a) => `${a.shares}` },
    { key: "status", header: "Status", render: (a) => a.status },
  ];

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate("/members")}
        className="mb-2 text-sm text-slate-500 hover:text-slate-700"
      >
        ← Back to Members
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{member.name}</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setMovementType("sent")}>
            Record Money Sent
          </Button>
          <Button variant="secondary" onClick={() => setMovementType("returned")}>
            Record Money Returned
          </Button>
          <Button variant="secondary" onClick={() => setMovementType("commission")}>
            Record Commission
          </Button>
          <Button variant="secondary" onClick={() => setMovementType("adjustment")}>
            Record Adjustment
          </Button>
        </div>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        {member.phone ?? "No phone"} · Commission {member.defaultCommissionRate}%
      </p>

      {ledgerError ? <p className="mt-2 text-sm text-red-600">{ledgerError}</p> : null}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Credit" value={formatCurrency(wallet?.credit ?? "0")} />
        <StatCard label="Debit" value={formatCurrency(wallet?.debit ?? "0")} />
        <StatCard label="Wallet balance" value={formatCurrency(wallet?.balance ?? "0")} />
        <StatCard label="Outstanding" value={formatCurrency(wallet?.outstanding ?? "0")} />
      </div>

      <h2 className="mt-6 text-sm font-semibold text-slate-700">IPO History</h2>
      <div className="mt-2">
        <DataTable
          columns={historyColumns}
          rows={applications}
          getRowId={(a) => a.id}
          loading={applicationsLoading}
          emptyMessage="No IPO applications yet."
        />
      </div>

      <h2 className="mt-6 text-sm font-semibold text-slate-700">Ledger</h2>
      <div className="mt-2">
        <DataTable
          columns={ledgerColumns}
          rows={ledgerEntries}
          getRowId={(e) => e.id}
          loading={ledgerLoading}
          emptyMessage="No ledger entries yet."
        />
      </div>

      <MoneyMovementModal
        open={movementType !== null}
        memberId={memberId}
        type={movementType ?? "sent"}
        onClose={() => setMovementType(null)}
        onRecorded={refetchLedger}
      />
    </div>
  );
}
