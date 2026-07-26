import { useEffect, useState } from "react";
import { ApiError } from "../../api/client";
import { listMembers } from "../../api/members";
import { deleteGroup, listGroups } from "../../api/participantGroups";
import { DataTable } from "../../components/table/DataTable";
import type { Column } from "../../components/table/DataTable";
import { Button } from "../../components/ui/Button";
import type { Member } from "../../types/member";
import type { ParticipantGroup } from "../../types/participantGroup";
import { GroupFormModal } from "./GroupFormModal";

export function GroupsPanel() {
  const [groups, setGroups] = useState<ParticipantGroup[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ParticipantGroup | null>(null);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([listGroups(), listMembers({ pageSize: 100 })])
      .then(([groupsRes, membersRes]) => {
        setGroups(groupsRes.data);
        setMembers(membersRes.data);
        setError(null);
      })
      .catch((err: unknown) =>
        setError(err instanceof ApiError ? err.message : "Failed to load groups."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleDelete = async (group: ParticipantGroup) => {
    if (!confirm(`Delete group "${group.name}"?`)) return;
    try {
      await deleteGroup(group.id);
      fetchAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete group.");
    }
  };

  const openCreate = () => {
    setEditingGroup(null);
    setModalOpen(true);
  };

  const openEdit = (group: ParticipantGroup) => {
    setEditingGroup(group);
    setModalOpen(true);
  };

  const columns: Column<ParticipantGroup>[] = [
    { key: "name", header: "Name", render: (g) => <span className="font-medium">{g.name}</span> },
    {
      key: "isDefault",
      header: "Default",
      render: (g) =>
        g.isDefault ? (
          <span className="text-emerald-600">Yes</span>
        ) : (
          <span className="text-slate-400">No</span>
        ),
    },
    { key: "members", header: "Members", render: (g) => `${g.members.length}` },
    {
      key: "actions",
      header: "",
      render: (g) => (
        <div className="flex gap-3 text-xs font-medium">
          <button
            type="button"
            onClick={() => openEdit(g)}
            className="text-slate-600 hover:text-slate-900"
          >
            Manage
          </button>
          <button
            type="button"
            onClick={() => void handleDelete(g)}
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
        <p className="text-sm text-slate-500">
          Groups let you quickly load a default set of members when creating a new IPO.
        </p>
        <Button onClick={openCreate}>New Group</Button>
      </div>

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={groups}
          getRowId={(g) => g.id}
          loading={loading}
          emptyMessage="No groups yet."
        />
      </div>

      <GroupFormModal
        open={modalOpen}
        group={editingGroup}
        members={members}
        onClose={() => setModalOpen(false)}
        onSaved={fetchAll}
      />
    </div>
  );
}
