import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "../../api/client";
import { createGroup, setGroupMembers, updateGroup } from "../../api/participantGroups";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { TextInput } from "../../components/ui/TextInput";
import type { Member } from "../../types/member";
import type { ParticipantGroup } from "../../types/participantGroup";

interface GroupFormModalProps {
  open: boolean;
  group: ParticipantGroup | null;
  members: Member[];
  onClose: () => void;
  onSaved: () => void;
}

export function GroupFormModal({ open, group, members, onClose, onSaved }: GroupFormModalProps) {
  const [name, setName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName(group?.name ?? "");
      setIsDefault(group?.isDefault ?? false);
      setSelectedIds(new Set(group?.members.map((m) => m.memberId) ?? []));
      setError(null);
    }
  }, [open, group]);

  const toggleMember = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const memberIds = Array.from(selectedIds);
      if (group) {
        await updateGroup(group.id, { name, isDefault });
        await setGroupMembers(group.id, memberIds);
      } else {
        await createGroup({ name, isDefault, memberIds });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save group.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title={group ? "Manage Group" : "New Group"} onClose={onClose}>
      <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-3">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <label className="text-sm font-medium text-slate-700">
          Name
          <TextInput
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="mt-1 w-full"
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(event) => setIsDefault(event.target.checked)}
          />
          Default group
        </label>
        <div>
          <p className="mb-1 text-sm font-medium text-slate-700">Members</p>
          <div className="max-h-48 overflow-y-auto rounded-md border border-slate-200 p-2">
            {members.length === 0 ? (
              <p className="text-sm text-slate-400">No members yet — add members first.</p>
            ) : (
              members.map((m) => (
                <label key={m.id} className="flex items-center gap-2 py-1 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(m.id)}
                    onChange={() => toggleMember(m.id)}
                  />
                  {m.name}
                </label>
              ))
            )}
          </div>
        </div>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
