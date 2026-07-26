import { useEffect, useState } from "react";
import { bulkCreateApplications } from "../../api/applications";
import { ApiError } from "../../api/client";
import { listGroups } from "../../api/participantGroups";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import type { ParticipantGroup } from "../../types/participantGroup";

interface AddApplicationsModalProps {
  open: boolean;
  ipoId: number;
  existingMemberIds: Set<number>;
  onClose: () => void;
  onAdded: () => void;
}

export function AddApplicationsModal({
  open,
  ipoId,
  existingMemberIds,
  onClose,
  onAdded,
}: AddApplicationsModalProps) {
  const [groups, setGroups] = useState<ParticipantGroup[]>([]);
  const [groupId, setGroupId] = useState<number | "">("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<number>>(new Set());
  const [lotsByMember, setLotsByMember] = useState<Record<number, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setGroupId("");
    setSelectedMemberIds(new Set());
    setLotsByMember({});
    setError(null);
    listGroups()
      .then((res) => setGroups(res.data))
      .catch(() => setGroups([]));
  }, [open]);

  const currentGroup = groups.find((g) => g.id === groupId) ?? null;

  const handleGroupChange = (id: number | "") => {
    setGroupId(id);
    if (id === "") {
      setSelectedMemberIds(new Set());
      setLotsByMember({});
      return;
    }
    const group = groups.find((g) => g.id === id);
    if (!group) return;
    const eligible = group.members.filter((m) => !existingMemberIds.has(m.memberId));
    setSelectedMemberIds(new Set(eligible.map((m) => m.memberId)));
    setLotsByMember(Object.fromEntries(eligible.map((m) => [m.memberId, 1])));
  };

  const toggleMember = (memberId: number) => {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
  };

  const setLots = (memberId: number, lots: number) => {
    setLotsByMember((prev) => ({ ...prev, [memberId]: lots }));
  };

  const handleSubmit = async () => {
    if (selectedMemberIds.size === 0) {
      setError("Select at least one member.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const applications = Array.from(selectedMemberIds).map((memberId) => ({
        memberId,
        lots: lotsByMember[memberId] ?? 1,
      }));
      await bulkCreateApplications(ipoId, applications);
      onAdded();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add applications.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title="Add Applications" onClose={onClose}>
      <div className="flex flex-col gap-3">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <label className="text-sm font-medium text-slate-700">
          Participant group
          <select
            value={groupId}
            onChange={(event) =>
              handleGroupChange(event.target.value ? Number(event.target.value) : "")
            }
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          >
            <option value="">Select a group</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
                {g.isDefault ? " (default)" : ""}
              </option>
            ))}
          </select>
        </label>

        {currentGroup ? (
          <div className="max-h-56 overflow-y-auto rounded-md border border-slate-200 p-2">
            {currentGroup.members.length === 0 ? (
              <p className="text-sm text-slate-400">This group has no members.</p>
            ) : (
              currentGroup.members.map((m) => {
                const alreadyApplied = existingMemberIds.has(m.memberId);
                return (
                  <div key={m.memberId} className="flex items-center justify-between gap-2 py-1">
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={selectedMemberIds.has(m.memberId)}
                        disabled={alreadyApplied}
                        onChange={() => toggleMember(m.memberId)}
                      />
                      {m.member.name}
                      {alreadyApplied ? (
                        <span className="text-xs text-slate-400">(already applied)</span>
                      ) : null}
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={lotsByMember[m.memberId] ?? 1}
                      disabled={alreadyApplied || !selectedMemberIds.has(m.memberId)}
                      onChange={(event) => setLots(m.memberId, Number(event.target.value))}
                      className="w-20 rounded border border-slate-300 px-2 py-1 text-sm disabled:bg-slate-50"
                    />
                  </div>
                );
              })
            )}
          </div>
        ) : null}

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleSubmit()} disabled={submitting}>
            {submitting ? "Adding…" : "Add"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
