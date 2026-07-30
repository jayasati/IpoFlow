import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError } from "../../api/client";
import { deleteMember, listMembers, updateMember } from "../../api/members";
import { listGroups } from "../../api/participantGroups";
import { DataTable } from "../../components/table/DataTable";
import type { Column } from "../../components/table/DataTable";
import { EditableCell } from "../../components/table/EditableCell";
import { Button } from "../../components/ui/Button";
import { TextInput } from "../../components/ui/TextInput";
import { useDebounce } from "../../hooks/useDebounce";
import type { Member, PaginatedResponse, UpdateMemberInput } from "../../types/member";
import type { ParticipantGroup } from "../../types/participantGroup";
import { AddMemberModal } from "./AddMemberModal";

type SortField = "name" | "createdAt" | "defaultCommissionRate";

const PAGE_SIZE = 20;

export function MembersPanel() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [groupId, setGroupId] = useState<number | "">("");
  const [sortBy, setSortBy] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PaginatedResponse<Member> | null>(null);
  const [groups, setGroups] = useState<ParticipantGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    listGroups()
      .then((res) => setGroups(res.data))
      .catch(() => setGroups([]));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, groupId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listMembers({
      search: debouncedSearch || undefined,
      groupId: groupId === "" ? undefined : groupId,
      sortBy,
      sortOrder,
      page,
      pageSize: PAGE_SIZE,
    })
      .then((res) => {
        if (cancelled) return;
        setResult(res);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Failed to load members.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, groupId, sortBy, sortOrder, page]);

  const refetch = () => {
    setPage((p) => p);
    listMembers({
      search: debouncedSearch || undefined,
      groupId: groupId === "" ? undefined : groupId,
      sortBy,
      sortOrder,
      page,
      pageSize: PAGE_SIZE,
    })
      .then((res) => setResult(res))
      .catch((err: unknown) =>
        setError(err instanceof ApiError ? err.message : "Failed to load members."),
      );
  };

  const handleSort = (key: string) => {
    if (key !== "name" && key !== "createdAt" && key !== "defaultCommissionRate") return;
    if (sortBy === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const handleFieldSave = async (member: Member, field: keyof UpdateMemberInput, value: string) => {
    const payload: UpdateMemberInput =
      field === "defaultCommissionRate"
        ? { defaultCommissionRate: Number(value) }
        : { [field]: value };
    try {
      const updated = await updateMember(member.id, payload);
      setResult((prev) =>
        prev ? { ...prev, data: prev.data.map((m) => (m.id === updated.id ? updated : m)) } : prev,
      );
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update member.");
    }
  };

  const handleDelete = async (member: Member) => {
    if (!confirm(`Delete ${member.name}? This cannot be undone.`)) return;
    try {
      await deleteMember(member.id);
      refetch();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete member.");
    }
  };

  const columns: Column<Member>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (m) => <EditableCell value={m.name} onSave={(v) => handleFieldSave(m, "name", v)} />,
    },
    {
      key: "phone",
      header: "Phone",
      render: (m) => (
        <EditableCell
          value={m.phone ?? ""}
          placeholder="Add phone"
          onSave={(v) => handleFieldSave(m, "phone", v)}
        />
      ),
    },
    {
      key: "defaultCommissionRate",
      header: "Commission %",
      sortable: true,
      render: (m) => (
        <EditableCell
          value={m.defaultCommissionRate}
          type="number"
          onSave={(v) => handleFieldSave(m, "defaultCommissionRate", v)}
        />
      ),
    },
    {
      key: "notes",
      header: "Notes",
      render: (m) => (
        <EditableCell
          value={m.notes ?? ""}
          placeholder="Add notes"
          onSave={(v) => handleFieldSave(m, "notes", v)}
        />
      ),
    },
    {
      key: "actions",
      header: "",
      render: (m) => (
        <div className="flex gap-3 text-xs font-medium">
          <button
            type="button"
            onClick={() => navigate(`/members/${m.id}`)}
            className="text-slate-600 hover:text-slate-900"
          >
            View
          </button>
          <button
            type="button"
            onClick={() => void handleDelete(m)}
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <TextInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or phone…"
            className="w-64"
          />
          <select
            value={groupId}
            onChange={(event) => setGroupId(event.target.value ? Number(event.target.value) : "")}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          >
            <option value="">All groups</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={() => setAddOpen(true)}>Add Member</Button>
      </div>

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={result?.data ?? []}
          getRowId={(m) => m.id}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSort}
          loading={loading}
          emptyMessage="No members yet. Add your first member to get started."
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
        <span>
          Page {result?.page ?? 1} of {result?.totalPages ?? 1} ({result?.total ?? 0} members)
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

      <AddMemberModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={refetch} />
    </div>
  );
}
