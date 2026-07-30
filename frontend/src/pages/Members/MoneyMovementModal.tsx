import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "../../api/client";
import { recordCommission, recordMoneyReturned, recordMoneySent } from "../../api/ledger";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { TextInput } from "../../components/ui/TextInput";

type MovementType = "sent" | "returned" | "commission";

const TITLES: Record<MovementType, string> = {
  sent: "Record Money Sent",
  returned: "Record Money Returned",
  commission: "Record Commission",
};

interface MoneyMovementModalProps {
  open: boolean;
  memberId: number;
  type: MovementType;
  onClose: () => void;
  onRecorded: () => void;
}

export function MoneyMovementModal({
  open,
  memberId,
  type,
  onClose,
  onRecorded,
}: MoneyMovementModalProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount("");
      setDescription("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const input = { amount: Number(amount), description: description || undefined };
      if (type === "sent") {
        await recordMoneySent(memberId, input);
      } else if (type === "returned") {
        await recordMoneyReturned(memberId, input);
      } else {
        await recordCommission(memberId, input);
      }
      onRecorded();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to record entry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title={TITLES[type]} onClose={onClose}>
      <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-3">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <label className="text-sm font-medium text-slate-700">
          Amount
          <TextInput
            type="number"
            min={0.01}
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
            className="mt-1 w-full"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Description (optional)
          <TextInput
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="mt-1 w-full"
          />
        </label>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Record"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
