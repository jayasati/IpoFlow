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
import { getDashboard } from "../../api/dashboard";
import { StatCard } from "../../components/ui/StatCard";
import { useAsyncData } from "../../hooks/useAsyncData";
import { formatCurrency, formatNumber, formatPercent } from "../../utils/format";
import {
  CREDIT_COLOR,
  DEBIT_COLOR,
  IPO_STATUS_COLORS,
  IPO_STATUS_ORDER,
  LEDGER_TYPE_LABELS,
} from "./dashboardColors";

export function DashboardPage() {
  const { data, loading, error } = useAsyncData(getDashboard, [], "Failed to load dashboard.");

  if (loading && !data) {
    return <p className="text-sm text-slate-400">Loading…</p>;
  }
  if (error && !data) {
    return <p className="text-sm text-red-600">{error}</p>;
  }
  if (!data) {
    return null;
  }

  const roiValue = Number(data.roi);
  const profitValue = Number(data.profit);

  const ipoStatusData = IPO_STATUS_ORDER.map((status) => ({
    status,
    count: data.charts.ipoStatusBreakdown.find((entry) => entry.status === status)?.count ?? 0,
  }));

  const ledgerData = data.charts.ledgerBreakdown.map((entry) => ({
    type: LEDGER_TYPE_LABELS[entry.type] ?? entry.type,
    credit: Number(entry.credit),
    debit: Number(entry.debit),
  }));

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        <StatCard label="Active IPOs" value={formatNumber(data.activeIpos)} />
        <StatCard label="Members" value={formatNumber(data.members)} />
        <StatCard label="Capital used" value={formatCurrency(data.capitalUsed)} />
        <StatCard label="Outstanding" value={formatCurrency(data.outstanding)} />
        <StatCard label="Wallet" value={formatCurrency(data.wallet)} />
        <StatCard
          label="Profit"
          value={formatCurrency(data.profit)}
          tone={profitValue > 0 ? "good" : profitValue < 0 ? "critical" : "neutral"}
        />
        <StatCard
          label="ROI"
          value={formatPercent(data.roi)}
          tone={roiValue > 0 ? "good" : roiValue < 0 ? "critical" : "neutral"}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-700">IPOs by status</h2>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ipoStatusData} layout="vertical" margin={{ left: 8, right: 24 }}>
                <CartesianGrid horizontal={false} stroke="#e1e0d9" />
                <XAxis type="number" allowDecimals={false} stroke="#898781" fontSize={12} />
                <YAxis type="category" dataKey="status" stroke="#898781" fontSize={12} width={80} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={20}
                  isAnimationActive={false}
                >
                  {ipoStatusData.map((entry) => (
                    <Cell key={entry.status} fill={IPO_STATUS_COLORS[entry.status]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-700">Credit vs debit by ledger type</h2>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ledgerData} layout="vertical" margin={{ left: 8, right: 24 }}>
                <CartesianGrid horizontal={false} stroke="#e1e0d9" />
                <XAxis type="number" stroke="#898781" fontSize={12} />
                <YAxis type="category" dataKey="type" stroke="#898781" fontSize={12} width={110} />
                <Tooltip
                  formatter={(value) =>
                    formatCurrency(
                      typeof value === "number" || typeof value === "string" ? value : 0,
                    )
                  }
                />
                <Legend />
                <Bar
                  dataKey="credit"
                  name="Credit"
                  fill={CREDIT_COLOR}
                  radius={[0, 4, 4, 0]}
                  maxBarSize={16}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="debit"
                  name="Debit"
                  fill={DEBIT_COLOR}
                  radius={[0, 4, 4, 0]}
                  maxBarSize={16}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
