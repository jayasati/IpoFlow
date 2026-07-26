import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError } from "../../api/client";
import { cloneIpo, deleteIpo, listIpos, updateIpo } from "../../api/ipos";
import { DataTable } from "../../components/table/DataTable";
import type { Column } from "../../components/table/DataTable";
import { EditableCell } from "../../components/table/EditableCell";
import { Button } from "../../components/ui/Button";
import { TextInput } from "../../components/ui/TextInput";
import { useAsyncData } from "../../hooks/useAsyncData";
import { useDebounce } from "../../hooks/useDebounce";
import type { Ipo, IpoStatus, UpdateIpoInput } from "../../types/ipo";
import type { PaginatedResponse } from "../../types/pagination";
import { IPO_STATUS_BADGE_CLASSES, IPO_STATUS_OPTIONS } from "./ipoStatus";
import { IpoWizardModal } from "./IpoWizardModal";

type SortField = "company" | "issuePrice" | "createdAt";

const PAGE_SIZE = 20;

export function IposPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [status, setStatus] = useState<IpoStatus | "">("");
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [wizardOpen, setWizardOpen] = useState(false);

  const {
    data: result,
    setData: setResult,
    loading,
    error,
    setError,
    refetch,
  } = useAsyncData<PaginatedResponse<Ipo>>(
    () =>
      listIpos({
        search: debouncedSearch || undefined,
        status: status || undefined,
        sortBy,
        sortOrder,
        page,
        pageSize: PAGE_SIZE,
      }),
    [debouncedSearch, status, sortBy, sortOrder, page],
    "Failed to load IPOs.",
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const handleSort = (key: string) => {
    if (key !== "company" && key !== "issuePrice" && key !== "createdAt") return;
    if (sortBy === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const handleFieldSave = async (ipo: Ipo, field: keyof UpdateIpoInput, value: string) => {
    const payload: UpdateIpoInput =
      field === "issuePrice" || field === "lotSize"
        ? { [field]: Number(value) }
        : { company: value };
    try {
      const updated = await updateIpo(ipo.id, payload);
      setResult((prev) =>
        prev ? { ...prev, data: prev.data.map((i) => (i.id === updated.id ? updated : i)) } : prev,
      );
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update IPO.");
    }
  };

  const handleDelete = async (ipo: Ipo) => {
    if (!confirm(`Delete IPO "${ipo.company}"? This cannot be undone.`)) return;
    try {
      await deleteIpo(ipo.id);
      refetch();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete IPO.");
    }
  };

  const handleClone = async (ipo: Ipo) => {
    try {
      await cloneIpo(ipo.id);
      refetch();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to clone IPO.");
    }
  };

  const columns: Column<Ipo>[] = [
    {
      key: "company",
      header: "Company",
      sortable: true,
      render: (ipo) => (
        <EditableCell value={ipo.company} onSave={(v) => handleFieldSave(ipo, "company", v)} />
      ),
    },
    {
      key: "issuePrice",
      header: "Issue Price",
      sortable: true,
      render: (ipo) => (
        <EditableCell
          value={ipo.issuePrice}
          type="number"
          onSave={(v) => handleFieldSave(ipo, "issuePrice", v)}
        />
      ),
    },
    {
      key: "lotSize",
      header: "Lot Size",
      render: (ipo) => (
        <EditableCell
          value={String(ipo.lotSize)}
          type="number"
          onSave={(v) => handleFieldSave(ipo, "lotSize", v)}
        />
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (ipo) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${IPO_STATUS_BADGE_CLASSES[ipo.status]}`}
        >
          {ipo.status}
        </span>
      ),
    },
    {
      key: "applications",
      header: "Applications",
      render: (ipo) => `${ipo._count.applications}`,
    },
    {
      key: "actions",
      header: "",
      render: (ipo) => (
        <div className="flex gap-3 text-xs font-medium">
          <button
            type="button"
            onClick={() => navigate(`/ipos/${ipo.id}`)}
            className="text-slate-600 hover:text-slate-900"
          >
            View
          </button>
          <button
            type="button"
            onClick={() => void handleClone(ipo)}
            className="text-slate-600 hover:text-slate-900"
          >
            Clone
          </button>
          <button
            type="button"
            onClick={() => void handleDelete(ipo)}
            className="text-red-600 hover:text-red-700"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">IPOs</h1>
        <Button onClick={() => setWizardOpen(true)}>New IPO</Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <TextInput
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by company…"
          className="w-64"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as IpoStatus | "")}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        >
          <option value="">All statuses</option>
          {IPO_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={result?.data ?? []}
          getRowId={(ipo) => ipo.id}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSort}
          loading={loading}
          emptyMessage="No IPOs yet. Create your first IPO to get started."
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
        <span>
          Page {result?.page ?? 1} of {result?.totalPages ?? 1} ({result?.total ?? 0} IPOs)
        </span>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button
            variant="secondary"
            disabled={!result || page >= result.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <IpoWizardModal
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onCreated={() => {
          setWizardOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
