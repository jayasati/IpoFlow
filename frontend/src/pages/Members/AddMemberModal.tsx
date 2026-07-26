import { useState, type FormEvent } from "react";
import { ApiError } from "../../api/client";
import { createMember } from "../../api/members";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { TextInput } from "../../components/ui/TextInput";

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function AddMemberModal({ open, onClose, onCreated }: AddMemberModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [commissionRate, setCommissionRate] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName("");
    setPhone("");
    setNotes("");
    setCommissionRate("0");
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createMember({
        name,
        phone: phone || undefined,
        notes: notes || undefined,
        defaultCommissionRate: Number(commissionRate),
      });
      reset();
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create member.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title="Add Member" onClose={handleClose}>
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
        <label className="text-sm font-medium text-slate-700">
          Phone
          <TextInput
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="mt-1 w-full"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Default commission rate (%)
          <TextInput
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={commissionRate}
            onChange={(event) => setCommissionRate(event.target.value)}
            className="mt-1 w-full"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Notes
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </label>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Add Member"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
