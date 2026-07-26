import type { ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string | number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (key: string) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  sortBy,
  sortOrder,
  onSortChange,
  loading = false,
  emptyMessage = "No records found.",
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full min-w-max text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-2.5 font-medium ${col.sortable ? "cursor-pointer select-none" : ""} ${col.className ?? ""}`}
                onClick={col.sortable && onSortChange ? () => onSortChange(col.key) : undefined}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable && sortBy === col.key ? (
                    <span>{sortOrder === "asc" ? "▲" : "▼"}</span>
                  ) : null}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-slate-400">
                Loading…
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={getRowId(row)} className="hover:bg-slate-50">
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-2 ${col.className ?? ""}`}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
