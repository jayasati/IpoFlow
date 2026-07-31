import { useState } from "react";
import { listOperatorTransactions } from "../../api/operatorTransactions";
import { DataTable } from "../../components/table/DataTable";
import type { Column } from "../../components/table/DataTable";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
import { useAsyncData } from "../../hooks/useAsyncData";
import type { OperatorTransaction } from "../../types/operatorTransaction";
import { formatCurrency } from "../../utils/format";

const PAGE_SIZE = 20;

const columns: Column<OperatorTransaction>[] = [
  {
    key: "createdAt",
    header: "Date",
    render: (t) => new Date(t.createdAt).toLocaleString(),
  },
  { key: "member", header: "Member", render: (t) => t.member.name },
  { key: "ipo", header: "IPO", render: (t) => t.ipo.company },
  {
    key: "amount",
    header: "Amount",
    render: (t) =>
      Number(t.credit) > 0 ? (
        <span className="text-[#0ca30c]">+{formatCurrency(t.credit)}</span>
      ) : (
        <span className="text-[#d03b3b]">-{formatCurrency(t.debit)}</span>
      ),
  },
  { key: "description", header: "Description", render: (t) => t.description ?? "—" },
];

export function MyAccountPage() {
  const [page, setPage] = useState(1);

  const { data, loading, error } = useAsyncData(
    () => listOperatorTransactions(page, PAGE_SIZE),
    [page],
    "Failed to load your account.",
  );

  const netProfit = Number(data?.netProfit ?? 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold">My Account</h1>
      <p className="mt-1 text-sm text-slate-500">
        Cuts taken and compensation paid on self-funded applications — money that moved between
        you and a member directly, outside the pooled-capital wallet system.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Net profit"
          value={formatCurrency(data?.netProfit ?? "0")}
          tone={netProfit > 0 ? "good" : netProfit < 0 ? "critical" : "neutral"}
        />
        <StatCard label="Transactions" value={data?.total ?? 0} />
      </div>

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={data?.data ?? []}
          getRowId={(t) => t.id}
          loading={loading}
          emptyMessage="No self-funded settlements recorded yet."
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
        <span>
          Page {data?.page ?? 1} of {data?.totalPages ?? 1} ({data?.total ?? 0} transactions)
        </span>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button
            variant="secondary"
            disabled={!data || page >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
