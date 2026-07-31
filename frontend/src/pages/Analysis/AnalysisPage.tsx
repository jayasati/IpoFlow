import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getAnalysis } from "../../api/analysis";
import { DataTable } from "../../components/table/DataTable";
import type { Column } from "../../components/table/DataTable";
import { StatCard } from "../../components/ui/StatCard";
import { useAsyncData } from "../../hooks/useAsyncData";
import { formatCurrency, formatPercent } from "../../utils/format";
import type { IpoAnalysis, MemberAnalysis, MonthlyAnalysis } from "../../types/analysis";
import { CASH_IN_COLOR, CASH_OUT_COLOR, CRITICAL_COLOR, GOOD_COLOR, formatMonthLabel } from "./analysisColors";

function tone(value: string): "good" | "critical" | "neutral" {
  const num = Number(value);
  return num > 0 ? "good" : num < 0 ? "critical" : "neutral";
}

function toneText(value: string): string {
  return tone(value) === "critical" ? "text-[#d03b3b]" : "text-[#0ca30c]";
}

const ipoColumns: Column<IpoAnalysis>[] = [
  { key: "company", header: "IPO", render: (row) => row.company },
  {
    key: "capitalDeployed",
    header: "Capital deployed",
    render: (row) => formatCurrency(row.capitalDeployed),
  },
  {
    key: "operatorNet",
    header: "Your cut",
    render: (row) =>
      Number(row.operatorNet) === 0 ? (
        <span className="text-slate-400">—</span>
      ) : (
        <span className={toneText(row.operatorNet)}>{formatCurrency(row.operatorNet)}</span>
      ),
  },
  {
    key: "netIncome",
    header: "Net profit",
    render: (row) => <span className={toneText(row.netIncome)}>{formatCurrency(row.netIncome)}</span>,
  },
  {
    key: "roi",
    header: "ROI",
    render: (row) => <span className={toneText(row.roi)}>{formatPercent(row.roi)}</span>,
  },
];

const memberColumns: Column<MemberAnalysis>[] = [
  { key: "name", header: "Member", render: (row) => row.name },
  {
    key: "totalProfit",
    header: "Total profit (after commission)",
    render: (row) => (
      <span className={toneText(row.totalProfit)}>{formatCurrency(row.totalProfit)}</span>
    ),
  },
  {
    key: "yourCut",
    header: "Your cut",
    render: (row) =>
      Number(row.yourCut) === 0 ? (
        <span className="text-slate-400">—</span>
      ) : (
        <span className={toneText(row.yourCut)}>{formatCurrency(row.yourCut)}</span>
      ),
  },
  { key: "capitalSent", header: "Capital sent", render: (row) => formatCurrency(row.capitalSent) },
  {
    key: "walletBalance",
    header: "Wallet balance",
    render: (row) => formatCurrency(row.walletBalance),
  },
  {
    key: "outstandingDays",
    header: "Outstanding",
    render: (row) =>
      row.outstandingDays > 0 ? (
        <span className={row.outstandingDays > 30 ? "text-[#d03b3b]" : "text-slate-600"}>
          {row.outstandingDays}d
        </span>
      ) : (
        <span className="text-slate-400">Settled</span>
      ),
  },
];

export function AnalysisPage() {
  const { data, loading, error } = useAsyncData(getAnalysis, [], "Failed to load analysis.");

  if (loading && !data) {
    return <p className="text-sm text-slate-400">Loading…</p>;
  }
  if (error && !data) {
    return <p className="text-sm text-red-600">{error}</p>;
  }
  if (!data) {
    return null;
  }

  const totalNetIncome = data.monthly.reduce((sum, m) => sum + Number(m.netIncome), 0);
  const totalYourCut = data.members.reduce((sum, m) => sum + Number(m.yourCut), 0);

  const cashFlowData = data.monthly.map((m: MonthlyAnalysis) => ({
    month: formatMonthLabel(m.month),
    cashIn: Number(m.cashIn),
    cashOut: -Number(m.cashOut),
  }));

  const incomeData = data.monthly.map((m: MonthlyAnalysis) => ({
    month: formatMonthLabel(m.month),
    netIncome: Number(m.netIncome),
  }));

  return (
    <div>
      <h1 className="text-2xl font-semibold">Analysis</h1>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="Avg monthly cash in" value={formatCurrency(data.avgMonthlyCashIn)} />
        <StatCard
          label="Avg monthly net income"
          value={formatCurrency(data.avgMonthlyNetIncome)}
          tone={tone(data.avgMonthlyNetIncome)}
        />
        <StatCard label="Avg capital deployed" value={formatCurrency(data.avgCapitalDeployed)} />
        <StatCard
          label="Total net income"
          value={formatCurrency(totalNetIncome)}
          tone={totalNetIncome > 0 ? "good" : totalNetIncome < 0 ? "critical" : "neutral"}
        />
        <StatCard
          label="Your cut (self-funded)"
          value={formatCurrency(totalYourCut)}
          tone={totalYourCut > 0 ? "good" : totalYourCut < 0 ? "critical" : "neutral"}
        />
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-slate-700">Member profitability</h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Your total profit from each member after commission — combining pooled-capital income
          and self-funded cuts. Not the member's own trading profit; see their own page for that.
        </p>
        <div className="mt-2">
          <DataTable
            columns={memberColumns}
            rows={data.members}
            getRowId={(row) => row.memberId}
            emptyMessage="No member activity recorded yet."
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-700">Monthly cash flow</h2>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData} margin={{ left: 8, right: 16 }}>
                <CartesianGrid vertical={false} stroke="#e1e0d9" />
                <XAxis dataKey="month" stroke="#898781" fontSize={12} />
                <YAxis stroke="#898781" fontSize={12} />
                <Tooltip
                  formatter={(value) =>
                    formatCurrency(
                      typeof value === "number" || typeof value === "string" ? value : 0,
                    )
                  }
                />
                <Legend />
                <Bar
                  dataKey="cashIn"
                  name="Cash in"
                  fill={CASH_IN_COLOR}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="cashOut"
                  name="Cash out"
                  fill={CASH_OUT_COLOR}
                  radius={[0, 0, 4, 4]}
                  maxBarSize={24}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-700">Monthly income</h2>
          <p className="text-xs text-slate-400">Includes your cut from self-funded settlements.</p>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeData} margin={{ left: 8, right: 16 }}>
                <CartesianGrid vertical={false} stroke="#e1e0d9" />
                <XAxis dataKey="month" stroke="#898781" fontSize={12} />
                <YAxis stroke="#898781" fontSize={12} />
                <Tooltip
                  formatter={(value) =>
                    formatCurrency(
                      typeof value === "number" || typeof value === "string" ? value : 0,
                    )
                  }
                />
                <Bar dataKey="netIncome" name="Net income" radius={[4, 4, 4, 4]} maxBarSize={24} isAnimationActive={false}>
                  {incomeData.map((entry) => (
                    <Cell
                      key={entry.month}
                      fill={entry.netIncome >= 0 ? GOOD_COLOR : CRITICAL_COLOR}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-slate-700">Profit per IPO</h2>
        <div className="mt-2">
          <DataTable
            columns={ipoColumns}
            rows={data.ipos}
            getRowId={(row) => row.ipoId}
            emptyMessage="No IPO activity recorded yet."
          />
        </div>
      </div>
    </div>
  );
}
