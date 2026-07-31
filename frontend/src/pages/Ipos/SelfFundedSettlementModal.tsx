import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "../../api/client";
import { createSettlement } from "../../api/settlement";
import type { SettlementOutcome } from "../../api/settlement";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { TextInput } from "../../components/ui/TextInput";

interface SelfFundedSettlementModalProps {
  open: boolean;
  applicationId: number;
  memberName: string;
  onClose: () => void;
  onSettled: (outcome: SettlementOutcome) => void;
}

export function SelfFundedSettlementModal({
  open,
  applicationId,
  memberName,
  onClose,
  onSettled,
}: SelfFundedSettlementModalProps) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const outcome = await createSettlement(applicationId, amount ? Number(amount) : 0);
      onSettled(outcome);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to settle application.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title={`Settle ${memberName} (self-funded)`} onClose={onClose}>
      <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-3">
        <p className="text-sm text-slate-500">
          {memberName} used their own money — their wallet won't be touched. Enter what you're
          taking as your cut (if this trade made a profit) or paying as compensation (if it made
          a loss). Leave at 0 if nothing changes hands.
        </p>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <label className="text-sm font-medium text-slate-700">
          Amount
          <TextInput
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0"
            className="mt-1 w-full"
          />
        </label>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Settling…" : "Settle"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
